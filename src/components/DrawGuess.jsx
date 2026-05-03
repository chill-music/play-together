import React, { useState, useRef, useEffect, useCallback } from 'react';
import { db } from '../config';
import { ref, set, onValue, off, remove } from 'firebase/database';
import { t, isRTL } from '../i18n/translations';
import { TimerRing, ChatPanel } from './SharedUI';

// ============================================
// Draw & Guess - Professional with Firebase Sync
// ============================================

var C = {
  bg: '#0f0f1a', bg2: '#1a1a2e', bgCard: 'rgba(30,30,60,0.7)',
  bgInput: 'rgba(20,20,40,0.8)',
  coral: '#ff6b6b', coralLight: '#ff8787', coralDark: '#e84545',
  amber: '#ffd93d', amberDark: '#ffc107',
  txt: '#e8e0f0', txt2: '#a8a0b8', txt3: '#6b6380',
  ok: '#4ecdc4', border: 'rgba(255,107,107,0.2)',
};
var R = { sm: '8px', md: '12px', lg: '16px', full: '9999px' };

var COLORS = [
  '#000000', '#808080', '#800000', '#ff0000', '#ff6600',
  '#ffcc00', '#33cc00', '#0099ff', '#6633cc', '#cc00cc',
  '#ffffff', '#c0c0c0', '#ff9999', '#ffcc99', '#ffff99',
  '#99ff99', '#99ccff', '#cc99ff', '#ff99cc', '#ff66b2',
  '#996633', '#cc9966', '#669966', '#669999', '#996699',
  '#003366', '#336699', '#663399', '#993366', '#cc6633',
];

var TOOLS = [
  { id: 'pen', icon: '✏️', label: 'Pen' },
  { id: 'eraser', icon: '🧹', label: 'Eraser' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
];

export var DrawGuess = function DrawGuess(props) {
  var gameData = props.gameData;
  var players = props.players;
  var currentPlayerId = props.currentPlayerId;
  var roomId = props.roomId;
  var language = props.language;
  var chatMessages = props.chatMessages;
  var onSendMessage = props.onSendMessage;

  var canvasRef = useRef(null);
  var ctxRef = useRef(null);
  var isDrawingRef = useRef(false);
  var lastPosRef = useRef(null);
  var historyRef = useRef([]);
  var historyIndexRef = useRef(-1);
  var prevIsMyTurnRef = useRef(false);
  var isMyTurnRef = useRef(false);
  var syncIntervalRef = useRef(null);

  var _toolState = useState('pen');
  var tool = _toolState[0];
  var setTool = _toolState[1];

  var _brushColorState = useState('#000000');
  var brushColor = _brushColorState[0];
  var setBrushColor = _brushColorState[1];

  var _brushSizeState = useState(5);
  var brushSize = _brushSizeState[0];
  var setBrushSize = _brushSizeState[1];

  var _guessedState = useState(new Set());
  var guessedPlayers = _guessedState[0];
  var setGuessedPlayers = _guessedState[1];

  var currentDrawer = gameData ? gameData.currentDrawer : null;
  var word = gameData ? gameData.word : null;
  var timeLeft = gameData ? (gameData.timeLeft != null ? gameData.timeLeft : 60) : 60;
  var maxTime = 60;
  var isMyTurn = currentDrawer === currentPlayerId;
  var round = (gameData && gameData.round) ? gameData.round : 1;
  var maxRounds = (gameData && gameData.maxRounds) ? gameData.maxRounds : 3;
  var me = players.find(function(p) { return p.id === currentPlayerId; });

  // Keep isMyTurnRef in sync - avoids stale closures in drawing callbacks
  useEffect(function() {
    isMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  // ============================================
  // Canvas Initialization
  // ============================================
  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    return function() {
      ctxRef.current = null;
    };
  }, []);

  // ============================================
  // Firebase Drawing Sync - LISTEN (non-drawer)
  // ============================================
  useEffect(function() {
    if (!roomId || isMyTurn) {
      // Stop periodic sync if we become the drawer
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    var drawingRef = ref(db, 'rooms/' + roomId + '/drawing');

    function handleDrawingUpdate(snapshot) {
      var canvas = canvasRef.current;
      var ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      if (snapshot.exists()) {
        var data = snapshot.val();
        if (data && data.canvasData) {
          var img = new Image();
          img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.onerror = function() {};
          img.src = data.canvasData;
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    onValue(drawingRef, handleDrawingUpdate);

    return function() {
      off(drawingRef);
    };
  }, [roomId, isMyTurn]);

  // ============================================
  // Periodic sync for drawer (every 2 seconds fallback)
  // ============================================
  useEffect(function() {
    if (!roomId || !isMyTurn) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    syncIntervalRef.current = setInterval(function() {
      sendDrawingToFirebase();
    }, 2000);

    return function() {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [roomId, isMyTurn]);

  // ============================================
  // CLEAR canvas when I become the drawer
  // ============================================
  useEffect(function() {
    if (isMyTurn && !prevIsMyTurnRef.current && canvasRef.current && ctxRef.current) {
      var canvas = canvasRef.current;
      var ctx = ctxRef.current;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistory();
      if (roomId) {
        remove(ref(db, 'rooms/' + roomId + '/drawing'));
      }
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn, roomId]);

  // ============================================
  // Watch chatMessages for correct guesses
  // ============================================
  useEffect(function() {
    var newGuessed = new Set();
    chatMessages.forEach(function(msg) {
      if (msg.isCorrect && msg.senderId) {
        newGuessed.add(msg.senderId);
      }
    });
    if (newGuessed.size > 0) {
      setGuessedPlayers(newGuessed);
    }
  }, [chatMessages]);

  // ============================================
  // Save canvas state for undo/redo
  // ============================================
  var saveHistory = useCallback(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var dataUrl = canvas.toDataURL();
    var history = historyRef.current;
    var index = historyIndexRef.current;
    historyRef.current = history.slice(0, index + 1);
    historyRef.current.push(dataUrl);
    if (historyRef.current.length > 30) {
      historyRef.current = historyRef.current.slice(-30);
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // ============================================
  // Send drawing to Firebase (uses ref for isMyTurn check)
  // ============================================
  var sendDrawingToFirebase = useCallback(function() {
    if (!roomId || !canvasRef.current) return;
    if (!isMyTurnRef.current) return;
    try {
      var dataUrl = canvasRef.current.toDataURL('image/png');
      set(ref(db, 'rooms/' + roomId + '/drawing'), {
        canvasData: dataUrl,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Drawing sync error:', err);
    }
  }, [roomId]);

  // Undo
  var undo = useCallback(function() {
    var index = historyIndexRef.current;
    if (index <= 0) return;
    historyIndexRef.current = index - 1;
    restoreFromHistory();
  }, []);

  // Redo
  var redo = useCallback(function() {
    var index = historyIndexRef.current;
    var history = historyRef.current;
    if (index >= history.length - 1) return;
    historyIndexRef.current = index + 1;
    restoreFromHistory();
  }, []);

  var restoreFromHistory = useCallback(function() {
    var canvas = canvasRef.current;
    var ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    var img = new Image();
    img.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      sendDrawingToFirebase();
    };
    img.src = historyRef.current[historyIndexRef.current];
  }, [sendDrawingToFirebase]);

  // Flood fill
  var floodFill = useCallback(function(startX, startY, fillColor) {
    var canvas = canvasRef.current;
    var ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    var w = canvas.width;
    var h = canvas.height;
    var fc = hexToRgb(fillColor);
    var si = (startY * w + startX) * 4;
    var tR = pixels[si], tG = pixels[si+1], tB = pixels[si+2], tA = pixels[si+3];

    if (tR === fc.r && tG === fc.g && tB === fc.b && tA === 255) return;

    var stack = [[startX, startY]];
    var visited = {};

    while (stack.length > 0) {
      var pos = stack.pop();
      var px = pos[0], py = pos[1];
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      var key = py * w + px;
      if (visited[key]) continue;
      visited[key] = true;
      var idx = key * 4;
      if (Math.abs(pixels[idx] - tR) > 30 ||
          Math.abs(pixels[idx+1] - tG) > 30 ||
          Math.abs(pixels[idx+2] - tB) > 30 ||
          Math.abs(pixels[idx+3] - tA) > 30) continue;
      pixels[idx] = fc.r;
      pixels[idx+1] = fc.g;
      pixels[idx+2] = fc.b;
      pixels[idx+3] = 255;
      stack.push([px+1, py], [px-1, py], [px, py+1], [px, py-1]);
    }
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
  }, [saveHistory]);

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  // ============================================
  // Drawing functions
  // ============================================
  var getPos = useCallback(function(e) {
    var canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var cx, cy;
    if (e.touches && e.touches.length > 0) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = e.clientX;
      cy = e.clientY;
    }
    return {
      x: Math.round((cx - rect.left) * scaleX),
      y: Math.round((cy - rect.top) * scaleY),
    };
  }, []);

  var startDraw = useCallback(function(e) {
    if (!isMyTurnRef.current || !ctxRef.current) return;
    e.preventDefault();
    var pos = getPos(e);
    if (tool === 'fill') {
      floodFill(pos.x, pos.y, brushColor);
      sendDrawingToFirebase();
      return;
    }
    isDrawingRef.current = true;
    lastPosRef.current = pos;
    var ctx = ctxRef.current;
    var drawColor = tool === 'eraser' ? '#ffffff' : brushColor;
    var drawSize = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, drawSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = drawColor;
    ctx.fill();
  }, [getPos, brushColor, brushSize, tool, floodFill, sendDrawingToFirebase]);

  var doDraw = useCallback(function(e) {
    if (!isDrawingRef.current || !ctxRef.current) return;
    e.preventDefault();
    var pos = getPos(e);
    var lastPos = lastPosRef.current;
    var ctx = ctxRef.current;
    var drawColor = tool === 'eraser' ? '#ffffff' : brushColor;
    var drawSize = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.stroke();
    lastPosRef.current = pos;
  }, [getPos, brushColor, brushSize, tool]);

  var endDraw = useCallback(function(e) {
    if (!isDrawingRef.current) return;
    if (e) e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
    saveHistory();
    sendDrawingToFirebase();
  }, [saveHistory, sendDrawingToFirebase]);

  var clearCanvas = useCallback(function() {
    var canvas = canvasRef.current;
    var ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistory();
      sendDrawingToFirebase();
    }
  }, [saveHistory, sendDrawingToFirebase]);

  // ============================================
  // Handle guess
  // ============================================
  function handleGuess(text) {
    if (!word || isMyTurn) return;
    var isCorrect = text.toLowerCase().trim() === word.toLowerCase().trim();
    var playerName = me ? me.name : 'Unknown';
    onSendMessage({
      text: text,
      senderId: currentPlayerId,
      senderName: playerName,
      isCorrect: isCorrect,
      isSystem: false,
    });
    if (isCorrect) {
      onSendMessage({
        text: '\uD83C\uDF89 ' + playerName + ' ' + t('guessedCorrectly'),
        isSystem: true,
      });
    }
  }

  function maskWord(w) {
    if (!w) return '';
    if (w.length <= 2) return w;
    return w.charAt(0) + ' ' + '_ '.repeat(w.length - 2) + w.charAt(w.length - 1);
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.roundBadge}>{t('round')} {round}/{maxRounds}</span>
          <div style={styles.playerAvatars}>
            {players.map(function(p) {
              var isGuessed = guessedPlayers.has(p.id);
              return (
                <div key={p.id} style={{
                  ...styles.pAvatar,
                  border: isGuessed ? ('2px solid ' + C.ok) : '2px solid transparent',
                  background: p.id === currentDrawer ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.04)',
                }}>
                  <span style={styles.pAvatarIcon}>{p.name ? p.name.charAt(0).toUpperCase() : '?'}</span>
                  <span style={styles.pAvatarScore}>{p.score || 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.topBarCenter}>
          <div style={styles.wordBox}>
            {isMyTurn ? (
              <div>
                <span style={styles.wordLabelSm}>{t('yourTurnToDraw')}</span>
                <span style={styles.wordBig}>{word}</span>
              </div>
            ) : (
              <div>
                <span style={styles.wordLabelSm}>{t('guessTheWord')}</span>
                <span style={styles.wordBig}>{maskWord(word)}</span>
                <span style={styles.wordHintSm}>({(word || '').length || 0} {isRTL() ? '\u062D\u0631\u0648\u0641' : 'letters'})</span>
              </div>
            )}
          </div>
          <TimerRing timeLeft={timeLeft} maxTime={maxTime} size={50} />
        </div>

        <div style={styles.topBarRight}>
          {guessedPlayers.size > 0 && (
            <div style={styles.guessedCompact}>
              {players.filter(function(p) { return guessedPlayers.has(p.id); }).map(function(p) {
                return <span key={p.id} style={styles.guessedChip}>{'\u2713'} {p.name}</span>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* MAIN AREA: Canvas + Chat */}
      <div style={styles.mainArea}>
        {/* LEFT: Canvas + Tools */}
        <div style={styles.canvasCol}>
          <div style={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              style={{
                ...styles.canvas,
                cursor: isMyTurn
                  ? (tool === 'fill' ? 'cell' : tool === 'eraser' ? 'grab' : 'crosshair')
                  : 'default',
              }}
              onMouseDown={isMyTurn ? startDraw : undefined}
              onMouseMove={isMyTurn ? doDraw : undefined}
              onMouseUp={isMyTurn ? endDraw : undefined}
              onMouseLeave={isMyTurn ? endDraw : undefined}
              onTouchStart={isMyTurn ? startDraw : undefined}
              onTouchMove={isMyTurn ? doDraw : undefined}
              onTouchEnd={isMyTurn ? endDraw : undefined}
            />
          </div>

          {isMyTurn && (
            <div style={styles.toolsBar}>
              <div style={styles.toolsRow}>
                {TOOLS.map(function(t2) {
                  return (
                    <button
                      key={t2.id}
                      onClick={function() { setTool(t2.id); }}
                      title={t2.label}
                      style={{
                        ...styles.toolBtn,
                        background: tool === t2.id ? C.coral : 'rgba(255,255,255,0.06)',
                        boxShadow: tool === t2.id ? ('0 0 12px ' + C.coral + '40') : 'none',
                      }}
                    >
                      {t2.icon}
                    </button>
                  );
                })}
                <div style={styles.toolDivider} />
                <button onClick={undo} title="Undo" style={styles.toolBtn}>{'\u21A9\uFE0F'}</button>
                <button onClick={redo} title="Redo" style={styles.toolBtn}>{'\u21AA\uFE0F'}</button>
                <div style={styles.toolDivider} />
                <button onClick={clearCanvas} title={t('clearCanvas')} style={{
                  ...styles.toolBtn,
                  color: C.coralLight,
                }}>{'\uD83D\uDDD1\uFE0F'}</button>
              </div>

              <div style={styles.paletteRow}>
                {COLORS.map(function(color, i) {
                  return (
                    <button
                      key={i}
                      onClick={function() { setBrushColor(color); setTool('pen'); }}
                      style={{
                        ...styles.colorSwatch,
                        background: color,
                        transform: brushColor === color && tool === 'pen' ? 'scale(1.3)' : 'scale(1)',
                        boxShadow: brushColor === color && tool === 'pen'
                          ? ('0 0 8px ' + (color === '#ffffff' ? 'rgba(255,255,255,0.5)' : color))
                          : 'none',
                        zIndex: brushColor === color && tool === 'pen' ? 2 : 1,
                      }}
                    />
                  );
                })}
              </div>

              <div style={styles.sizeRow}>
                <span style={styles.sizeLabel}>{isRTL() ? '\u0627\u0644\u062D\u062C\u0645' : 'Size'}</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={brushSize}
                  onChange={function(e) { setBrushSize(parseInt(e.target.value)); }}
                  style={styles.sizeSlider}
                />
                <div style={styles.sizePreview}>
                  <div style={{
                    width: Math.max(brushSize, 2),
                    height: Math.max(brushSize, 2),
                    borderRadius: '50%',
                    background: tool === 'eraser' ? C.txt3 : brushColor,
                    transition: 'all 0.15s ease',
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat Panel */}
        <div style={styles.chatCol}>
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleGuess}
            currentPlayerId={currentPlayerId}
            disabled={isMyTurn}
            placeholder={isMyTurn ? t('drawHere') : t('guessInput')}
            fullHeight={true}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// STYLES
// ============================================
var styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: C.bg,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: C.bg2,
    borderBottom: '1px solid ' + C.border,
    flexShrink: 0,
    gap: '12px',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  topBarCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    justifyContent: 'center',
  },
  topBarRight: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  roundBadge: {
    background: 'rgba(255,217,61,0.1)',
    color: C.amber,
    padding: '4px 12px',
    borderRadius: R.full,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  playerAvatars: {
    display: 'flex',
    gap: '6px',
  },
  pAvatar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
    padding: '3px 6px',
    borderRadius: R.sm,
    minWidth: '32px',
  },
  pAvatarIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: C.coral,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  pAvatarScore: {
    fontSize: '0.6rem',
    color: C.amber,
    fontWeight: 'bold',
  },
  wordBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 20px',
    background: 'rgba(255,217,61,0.06)',
    borderRadius: R.md,
    border: '1px solid rgba(255,217,61,0.12)',
  },
  wordLabelSm: {
    fontSize: '0.7rem',
    color: C.txt3,
  },
  wordBig: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: C.amber,
    letterSpacing: '3px',
    fontFamily: 'monospace',
  },
  wordHintSm: {
    fontSize: '0.65rem',
    color: C.txt3,
  },
  guessedCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  guessedChip: {
    background: 'rgba(78,205,196,0.15)',
    color: C.ok,
    padding: '2px 8px',
    borderRadius: R.full,
    fontSize: '0.7rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 0,
  },
  canvasCol: {
    width: '65%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  canvasWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    minHeight: 0,
    overflow: 'hidden',
    background: '#0a0a15',
  },
  canvas: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: R.sm,
    border: '2px solid ' + C.border,
    display: 'block',
    touchAction: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  toolsBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px 12px',
    background: C.bg2,
    borderTop: '1px solid ' + C.border,
    flexShrink: 0,
  },
  toolsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toolBtn: {
    width: '36px',
    height: '36px',
    borderRadius: R.sm,
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    background: 'rgba(255,255,255,0.06)',
    color: C.txt,
    flexShrink: 0,
  },
  toolDivider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0 4px',
  },
  paletteRow: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '4px 0',
  },
  colorSwatch: {
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '2px solid rgba(255,255,255,0.15)',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  sizeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '2px 4px',
  },
  sizeLabel: {
    fontSize: '0.75rem',
    color: C.txt3,
    minWidth: '30px',
  },
  sizeSlider: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
    maxWidth: '200px',
  },
  sizePreview: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: R.sm,
    flexShrink: 0,
  },
  chatCol: {
    width: '35%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderLeft: '1px solid ' + C.border,
  },
};
