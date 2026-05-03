import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from './config';
import { ref, set, get, onValue, onChildAdded, onChildRemoved, off, remove, update, push, onDisconnect, serverTimestamp } from 'firebase/database';
import { t, setLanguage, getLanguage, isRTL } from './i18n/translations';
import { drawGuessWords, forbiddenWordSets, whoIsItCharacters, getRandomItem, shuffleArray } from './data';
import { HomeScreen, LobbyScreen, GameSelectScreen } from './components/Lobby';
import { DrawGuess } from './components/DrawGuess';
import { ForbiddenWord } from './components/ForbiddenWord';
import { WhoIsIt } from './components/WhoIsIt';
import { ConnectionStatus, RoundSummary, GameEndScreen, RulesModal } from './components/SharedUI';

// ============================================
// App - Main Component
// ============================================

function generateRoomCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId() {
  return 'P' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function App() {
  // ============================================
  // State
  // ============================================
  var _currentScreen = useState('home');
  var currentScreen = _currentScreen[0];
  var setCurrentScreen = _currentScreen[1];

  var _playerId = useState(null);
  var playerId = _playerId[0];
  var setPlayerId = _playerId[1];

  var _playerName = useState('');
  var playerName = _playerName[0];
  var setPlayerName = _playerName[1];

  var _roomId = useState(null);
  var roomId = _roomId[0];
  var setRoomId = _roomId[1];

  var _players = useState([]);
  var players = _players[0];
  var setPlayers = _players[1];

  var _gameData = useState(null);
  var gameData = _gameData[0];
  var setGameData = _gameData[1];

  var _chatMessages = useState([]);
  var chatMessages = _chatMessages[0];
  var setChatMessages = _chatMessages[1];

  var _connected = useState(true);
  var connected = _connected[0];
  var setConnected = _connected[1];

  var _showRules = useState(false);
  var showRules = _showRules[0];
  var setShowRules = _showRules[1];

  var _gameType = useState(null);
  var gameType = _gameType[0];
  var setGameType = _gameType[1];

  var _showRoundSummary = useState(false);
  var showRoundSummary = _showRoundSummary[0];
  var setShowRoundSummary = _showRoundSummary[1];

  var _showGameEnd = useState(false);
  var showGameEnd = _showGameEnd[0];
  var setShowGameEnd = _showGameEnd[1];

  var _roundResults = useState([]);
  var roundResults = _roundResults[0];
  var setRoundResults = _roundResults[1];

  var _roundWord = useState('');
  var roundWord = _roundWord[0];
  var setRoundWord = _roundWord[1];

  var _leaveConfirm = useState(false);
  var leaveConfirm = _leaveConfirm[0];
  var setLeaveConfirm = _leaveConfirm[1];

  var timerIntervalRef = useRef(null);
  var roomIdRef = useRef(null);
  var playersRef = useRef([]);
  var gameDataRef = useRef(null);
  var hasConnectedRef = useRef(false);
  var language = getLanguage();

  // Keep refs in sync with state
  useEffect(function() { roomIdRef.current = roomId; }, [roomId]);
  useEffect(function() { playersRef.current = players; }, [players]);
  useEffect(function() { gameDataRef.current = gameData; }, [gameData]);

  // Set initial HTML direction
  useEffect(function() {
    var lang = getLanguage();
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, []);

  // ============================================
  // Timer
  // ============================================
  var stopTimer = useCallback(function() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  var startTimer = useCallback(function(initialTime) {
    stopTimer();
    var timeLeft = initialTime;
    var currentRoomId = roomIdRef.current;

    // Sync initial time to Firebase
    if (currentRoomId) {
      update(ref(db, 'rooms/' + currentRoomId + '/game'), { timeLeft: timeLeft });
    }

    timerIntervalRef.current = setInterval(function() {
      timeLeft -= 1;

      if (timeLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        timeLeft = 0;

        var gd = gameDataRef.current;
        var ps = playersRef.current;
        var rid = roomIdRef.current;

        if (rid && gd) {
          var currentRound = gd.round || 1;
          var maxRounds = gd.maxRounds || 3;
          var isLastRound = currentRound + 1 > maxRounds;

          var scoreUpdates = {};
          ps.forEach(function(p) {
            scoreUpdates['rooms/' + rid + '/players/' + p.id + '/score'] = (p.score || 0) + (p.roundScore || 0);
          });

          if (isLastRound) {
            update(ref(db), {
              ...scoreUpdates,
              ['rooms/' + rid + '/game/status']: 'gameEnd',
              ['rooms/' + rid + '/game/timeLeft']: 0,
            });
          } else {
            update(ref(db), {
              ...scoreUpdates,
              ['rooms/' + rid + '/game/status']: 'roundEnd',
              ['rooms/' + rid + '/game/word']: gd.word || '',
              ['rooms/' + rid + '/game/timeLeft']: 0,
              ['rooms/' + rid + '/game/roundResults']: ps.map(function(p) {
                return { id: p.id, name: p.name, roundScore: p.roundScore || 0 };
              }),
            });
          }
        }
      } else {
        if (currentRoomId) {
          update(ref(db, 'rooms/' + currentRoomId + '/game'), { timeLeft: timeLeft });
        }
      }
    }, 1000);
  }, [stopTimer]);

  // ============================================
  // Send Chat Message to Firebase
  // ============================================
  var sendChatMessage = useCallback(function(message) {
    if (!roomId) return;
    push(ref(db, 'rooms/' + roomId + '/chat'), {
      ...message,
      timestamp: Date.now(),
    });
  }, [roomId]);

  // ============================================
  // Firebase Room Management
  // ============================================
  var joinRoom = useCallback(async function(name, existingRoomId) {
    var myId = generatePlayerId();
    setPlayerId(myId);
    setPlayerName(name);

    var targetRoomId = existingRoomId;

    if (!targetRoomId) {
      targetRoomId = generateRoomCode();
      var roomRef = ref(db, 'rooms/' + targetRoomId);
      var snapshot = await get(roomRef);
      if (snapshot.exists()) {
        targetRoomId = generateRoomCode();
      }

      await set(ref(db, 'rooms/' + targetRoomId), {
        createdAt: serverTimestamp(),
        settings: { maxPlayers: 5, maxRounds: 3, language: language },
        game: null,
      });

      await set(ref(db, 'rooms/' + targetRoomId + '/players/' + myId), {
        id: myId, name: name, score: 0, isAdmin: true, isReady: true, joinedAt: serverTimestamp(),
      });

      await push(ref(db, 'rooms/' + targetRoomId + '/chat'), {
        text: name + ' ' + t('playerJoined'), isSystem: true, timestamp: serverTimestamp(),
      });
    } else {
      var roomRef2 = ref(db, 'rooms/' + targetRoomId);
      var snapshot2 = await get(roomRef2);

      if (!snapshot2.exists()) {
        alert(isRTL() ? 'الكود ده مش موجود!' : 'Room not found!');
        return;
      }

      var roomData = snapshot2.val();
      var playerCount = roomData.players ? Object.keys(roomData.players).length : 0;

      if (playerCount >= 5) {
        alert(t('maxPlayersReached'));
        return;
      }

      if (roomData.game && roomData.game.status === 'playing') {
        alert(isRTL() ? 'اللعبة شغالة دلوقتي!' : 'Game is already in progress!');
        return;
      }

      await set(ref(db, 'rooms/' + targetRoomId + '/players/' + myId), {
        id: myId, name: name, score: 0, isAdmin: false, isReady: false, joinedAt: serverTimestamp(),
      });

      await push(ref(db, 'rooms/' + targetRoomId + '/chat'), {
        text: name + ' ' + t('playerJoined'), isSystem: true, timestamp: serverTimestamp(),
      });
    }

    setRoomId(targetRoomId);
    setCurrentScreen('lobby');
  }, [language]);

  // ============================================
  // Firebase Listeners
  // ============================================
  useEffect(function() {
    if (!roomId) return;

    // Connection state
    var connRef = ref(db, '.info/connected');
    var connTimeout = null;
    onValue(connRef, function(snap) {
      var isConnected = snap.val() === true;
      if (isConnected) {
        hasConnectedRef.current = true;
      }
      clearTimeout(connTimeout);
      connTimeout = setTimeout(function() {
        setConnected(isConnected);
      }, 3000);
    });

    // Disconnect handler
    if (playerId) {
      var myPlayerRef = ref(db, 'rooms/' + roomId + '/players/' + playerId);
      onDisconnect(myPlayerRef).remove();

      var leaveMsgRef = push(ref(db, 'rooms/' + roomId + '/chat'));
      onDisconnect(leaveMsgRef).set({
        text: playerName + ' ' + t('playerLeft'),
        isSystem: true,
        timestamp: serverTimestamp(),
      });
    }

    // Players listener
    var playersListenerRef = ref(db, 'rooms/' + roomId + '/players');
    onValue(playersListenerRef, function(snapshot) {
      if (snapshot.exists()) {
        var playersData = snapshot.val();
        setPlayers(Object.values(playersData));

        // Auto-delete room if empty
        var playerKeys = Object.keys(playersData);
        if (playerKeys.length === 0) {
          remove(ref(db, 'rooms/' + roomId));
          setPlayers([]);
          setCurrentScreen('home');
          setRoomId(null);
          stopTimer();
        }
      } else {
        setPlayers([]);
        setCurrentScreen('home');
        setRoomId(null);
        stopTimer();
      }
    });

    // Game state listener
    var gameListenerRef = ref(db, 'rooms/' + roomId + '/game');
    onValue(gameListenerRef, function(snapshot) {
      if (snapshot.exists()) {
        var data = snapshot.val();
        setGameData(data);
        setGameType(data.type);

        if (data.status === 'playing') {
          setCurrentScreen('game');
        } else if (data.status === 'roundEnd') {
          setShowRoundSummary(true);
          setRoundWord(data.word || '');
          setRoundResults(data.roundResults || []);
          stopTimer();
        } else if (data.status === 'gameEnd') {
          setShowGameEnd(true);
          setCurrentScreen('game');
          stopTimer();
        } else if (data.status === 'cancelled') {
          stopTimer();
          setCurrentScreen('lobby');
          setChatMessages([]);
          setShowRoundSummary(false);
          setShowGameEnd(false);
        }
      } else {
        setGameData(null);
        setGameType(null);
        stopTimer();
      }
    });

    // Chat listener - onChildAdded for new messages
    var chatListenerRef = ref(db, 'rooms/' + roomId + '/chat');
    onChildAdded(chatListenerRef, function(snapshot) {
      var msg = snapshot.val();
      var msgKey = snapshot.key;
      if (!msg) return;
      setChatMessages(function(prev) {
        if (prev.some(function(m) { return m.id === msgKey; })) return prev;
        return prev.concat([{ ...msg, id: msgKey }]);
      });
    });

    // Chat listener - onChildRemoved for when chat is cleared
    onChildRemoved(chatListenerRef, function() {
      // When messages are removed, clear local chat
      setChatMessages([]);
    });

    // Cleanup on unmount
    return function() {
      clearTimeout(connTimeout);
      off(playersListenerRef);
      off(gameListenerRef);
      off(chatListenerRef);
      off(connRef);
      stopTimer();

      // Remove player + clean empty room
      if (playerId && roomId) {
        remove(ref(db, 'rooms/' + roomId + '/players/' + playerId));
        push(ref(db, 'rooms/' + roomId + '/chat'), {
          text: playerName + ' ' + t('playerLeft'),
          isSystem: true,
          timestamp: serverTimestamp(),
        });

        setTimeout(function() {
          get(ref(db, 'rooms/' + roomId + '/players')).then(function(snap) {
            if (!snap.exists() || Object.keys(snap.val()).length === 0) {
              remove(ref(db, 'rooms/' + roomId));
            }
          }).catch(function() {});
        }, 2000);
      }
    };
  }, [roomId, playerId, playerName, stopTimer]);

  // ============================================
  // Room Actions
  // ============================================
  var leaveRoom = useCallback(function() {
    stopTimer();
    setRoomId(null);
    setPlayers([]);
    setGameData(null);
    setChatMessages([]);
    setShowRules(false);
    setShowRoundSummary(false);
    setShowGameEnd(false);
    setGameType(null);
    setLeaveConfirm(false);
    setCurrentScreen('home');
  }, [stopTimer]);

  var handleLeaveFromGame = useCallback(function() {
    stopTimer();
    if (roomId) {
      update(ref(db, 'rooms/' + roomId + '/game'), { status: 'cancelled' });
      remove(ref(db, 'rooms/' + roomId + '/drawing'));
    }
    leaveRoom();
  }, [roomId, leaveRoom, stopTimer]);

  var kickPlayer = useCallback(function(targetPlayerId) {
    if (!roomId) return;
    var targetPlayer = players.find(function(p) { return p.id === targetPlayerId; });
    remove(ref(db, 'rooms/' + roomId + '/players/' + targetPlayerId));
    if (targetPlayer) {
      push(ref(db, 'rooms/' + roomId + '/chat'), {
        text: targetPlayer.name + (isRTL() ? ' تم إزالته' : ' was removed'),
        isSystem: true,
        timestamp: serverTimestamp(),
      });
    }
  }, [roomId, players]);

  // ============================================
  // Game Logic
  // ============================================
  var startGame = useCallback(async function(type) {
    if (!roomId) return;

    var playerList = players.map(function(p) { return { ...p, roundScore: 0 }; });
    var shuffledPlayers = shuffleArray(playerList);

    var initialGameData = {};
    var wordList = language === 'ar' ? drawGuessWords.ar : drawGuessWords.en;

    if (type === 'drawGuess') {
      var word = getRandomItem(wordList);
      initialGameData = {
        type: 'drawGuess', status: 'playing', round: 1, maxRounds: 3,
        currentDrawer: shuffledPlayers[0].id, word: word,
        timeLeft: 60, maxTime: 60, usedWords: [word],
        playerOrder: shuffledPlayers.map(function(p) { return p.id; }),
        currentDrawerIndex: 0,
      };
    } else if (type === 'forbiddenWord') {
      var wordSet = getRandomItem(language === 'ar' ? forbiddenWordSets.ar : forbiddenWordSets.en);
      initialGameData = {
        type: 'forbiddenWord', status: 'playing', round: 1, maxRounds: 3,
        currentDescriber: shuffledPlayers[0].id,
        word: wordSet.word, forbiddenWords: wordSet.forbidden,
        timeLeft: 45, maxTime: 45, usedWords: [wordSet.word],
        playerOrder: shuffledPlayers.map(function(p) { return p.id; }),
        currentDescriberIndex: 0,
      };
    } else if (type === 'whoIsIt') {
      var character = getRandomItem(language === 'ar' ? whoIsItCharacters.ar : whoIsItCharacters.en);
      initialGameData = {
        type: 'whoIsIt', status: 'playing', round: 1, maxRounds: 3,
        character: character, currentQuestionPlayer: shuffledPlayers[0].id,
        timeLeft: 90, maxTime: 90, usedCharacters: [character.name],
        playerOrder: shuffledPlayers.map(function(p) { return p.id; }),
        currentQuestionPlayerIndex: 0,
      };
    }

    // Clear drawing data
    await remove(ref(db, 'rooms/' + roomId + '/drawing'));
    // Clear chat
    await remove(ref(db, 'rooms/' + roomId + '/chat'));
    setChatMessages([]);

    await set(ref(db, 'rooms/' + roomId + '/game'), initialGameData);
    setCurrentScreen('game');

    // Start timer
    setTimeout(function() {
      startTimer(initialGameData.timeLeft);
    }, 500);
  }, [roomId, players, language, startTimer]);

  var handleNextRound = useCallback(async function() {
    if (!roomId || !gameData) return;

    setShowRoundSummary(false);
    stopTimer();

    var nextRound = (gameData.round || 1) + 1;
    var playerOrder = gameData.playerOrder || players.map(function(p) { return p.id; });

    // FIX: Use explicit undefined check instead of || to handle index 0
    var currentIndex;
    if (gameData.type === 'drawGuess') {
      currentIndex = (gameData.currentDrawerIndex != null) ? gameData.currentDrawerIndex : 0;
    } else if (gameData.type === 'forbiddenWord') {
      currentIndex = (gameData.currentDescriberIndex != null) ? gameData.currentDescriberIndex : 0;
    } else {
      currentIndex = (gameData.currentQuestionPlayerIndex != null) ? gameData.currentQuestionPlayerIndex : 0;
    }

    var idx = currentIndex + 1;
    var actualIndex = idx % playerOrder.length;

    // Get current active player ID
    var currentActivePlayerId;
    if (gameData.type === 'drawGuess') {
      currentActivePlayerId = gameData.currentDrawer;
    } else if (gameData.type === 'forbiddenWord') {
      currentActivePlayerId = gameData.currentDescriber;
    } else {
      currentActivePlayerId = gameData.currentQuestionPlayer;
    }

    // Ensure the next player is different from the current one
    if (playerOrder.length > 1 && playerOrder[actualIndex] === currentActivePlayerId) {
      actualIndex = (actualIndex + 1) % playerOrder.length;
    }

    var nextPlayer = playerOrder[actualIndex];

    var updates = { round: nextRound, status: 'playing', timeLeft: gameData.maxTime };

    if (gameData.type === 'drawGuess') {
      var wList = language === 'ar' ? drawGuessWords.ar : drawGuessWords.en;
      var usedWords = gameData.usedWords || [];
      var availableWords = wList.filter(function(w) { return !usedWords.includes(w); });
      var w = availableWords.length > 0 ? getRandomItem(availableWords) : getRandomItem(wList);
      updates.currentDrawer = nextPlayer;
      updates.currentDrawerIndex = actualIndex;
      updates.word = w;
      updates.usedWords = usedWords.concat([w]);
    } else if (gameData.type === 'forbiddenWord') {
      var wordSets = language === 'ar' ? forbiddenWordSets.ar : forbiddenWordSets.en;
      var usedWords2 = gameData.usedWords || [];
      var availableSets = wordSets.filter(function(ws) { return !usedWords2.includes(ws.word); });
      var ws = availableSets.length > 0 ? getRandomItem(availableSets) : getRandomItem(wordSets);
      updates.currentDescriber = nextPlayer;
      updates.currentDescriberIndex = actualIndex;
      updates.word = ws.word;
      updates.forbiddenWords = ws.forbidden;
      updates.usedWords = usedWords2.concat([ws.word]);
    } else if (gameData.type === 'whoIsIt') {
      var characters = language === 'ar' ? whoIsItCharacters.ar : whoIsItCharacters.en;
      var usedChars = gameData.usedCharacters || [];
      var availableChars = characters.filter(function(c) { return !usedChars.includes(c.name); });
      var ch = availableChars.length > 0 ? getRandomItem(availableChars) : getRandomItem(characters);
      updates.currentQuestionPlayer = nextPlayer;
      updates.currentQuestionPlayerIndex = actualIndex;
      updates.character = ch;
      updates.usedCharacters = usedChars.concat([ch.name]);
    }

    // Clear drawing
    await remove(ref(db, 'rooms/' + roomId + '/drawing'));
    // Clear chat
    await remove(ref(db, 'rooms/' + roomId + '/chat'));
    setChatMessages([]);

    await update(ref(db, 'rooms/' + roomId + '/game'), updates);

    var scoreUpdates = {};
    players.forEach(function(p) {
      scoreUpdates['rooms/' + roomId + '/players/' + p.id + '/roundScore'] = 0;
    });
    await update(ref(db), scoreUpdates);

    setTimeout(function() {
      startTimer(gameData.maxTime);
    }, 500);
  }, [roomId, gameData, players, language, startTimer, stopTimer]);

  var playAgain = useCallback(function() {
    setShowGameEnd(false);
    stopTimer();
    startGame(gameType);
  }, [gameType, startGame, stopTimer]);

  var backToLobby = useCallback(async function() {
    if (!roomId) return;
    setShowGameEnd(false);
    stopTimer();

    await remove(ref(db, 'rooms/' + roomId + '/drawing'));

    var scoreUpdates = {};
    players.forEach(function(p) {
      scoreUpdates['rooms/' + roomId + '/players/' + p.id + '/score'] = 0;
    });
    scoreUpdates['rooms/' + roomId + '/game'] = null;
    await update(ref(db), scoreUpdates);

    setCurrentScreen('lobby');
    setChatMessages([]);
  }, [roomId, players, stopTimer]);

  // ============================================
  // Render
  // ============================================
  var isAdmin = players.find(function(p) { return p.id === playerId; });
  isAdmin = isAdmin ? isAdmin.isAdmin : false;

  switch (currentScreen) {
    case 'home':
      return <HomeScreen onJoinRoom={joinRoom} />;

    case 'lobby':
      return (
        <div style={{ position: 'relative' }}>
          <LobbyScreen
            roomId={roomId}
            players={players}
            currentPlayerId={playerId}
            isAdmin={isAdmin}
            onSelectGame={function() { setCurrentScreen('gameSelect'); }}
            onLeaveRoom={leaveRoom}
            onKickPlayer={kickPlayer}
          />
          <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 100 }}>
            <ConnectionStatus connected={connected} />
          </div>
        </div>
      );

    case 'gameSelect':
      return (
        <GameSelectScreen
          onSelectGame={startGame}
          onBack={function() { setCurrentScreen('lobby'); }}
        />
      );

    case 'game':
      return (
        <div style={{ position: 'relative' }}>
          {/* Leave Room Button - top left corner */}
          <div style={leaveBtnContainerStyle}>
            {!leaveConfirm ? (
              <button
                onClick={function() { setLeaveConfirm(true); }}
                style={leaveBtnStyle}
              >
                {'\uD83D\uDEAA'} {t('leaveRoom')}
              </button>
            ) : (
              <div style={leaveConfirmStyle}>
                <span style={{ fontSize: '0.85rem', color: '#e8e0f0' }}>
                  {isRTL() ? 'متأكد تخرج؟' : 'Are you sure?'}
                </span>
                <button
                  onClick={handleLeaveFromGame}
                  style={{ ...leaveConfirmBtn, background: '#ff4757' }}
                >
                  {isRTL() ? 'نعم' : 'Yes'}
                </button>
                <button
                  onClick={function() { setLeaveConfirm(false); }}
                  style={leaveConfirmBtn}
                >
                  {t('close')}
                </button>
              </div>
            )}
          </div>

          {/* Connection Status - top right */}
          <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 100 }}>
            <ConnectionStatus connected={connected} />
          </div>

          {/* Rules button - bottom right */}
          <button
            onClick={function() { setShowRules(true); }}
            style={{
              position: 'fixed', bottom: '12px', right: '12px', zIndex: 100,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
              color: '#a8a0b8', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ?
          </button>

          {gameType === 'drawGuess' && (
            <DrawGuess
              gameData={gameData}
              players={players}
              currentPlayerId={playerId}
              roomId={roomId}
              language={language}
              chatMessages={chatMessages}
              onSendMessage={sendChatMessage}
            />
          )}
          {gameType === 'forbiddenWord' && (
            <ForbiddenWord
              gameData={gameData}
              players={players}
              currentPlayerId={playerId}
              roomId={roomId}
              language={language}
              chatMessages={chatMessages}
              onSendMessage={sendChatMessage}
            />
          )}
          {gameType === 'whoIsIt' && (
            <WhoIsIt
              gameData={gameData}
              players={players}
              currentPlayerId={playerId}
              roomId={roomId}
              language={language}
              chatMessages={chatMessages}
              onSendMessage={sendChatMessage}
            />
          )}

          {showRoundSummary && (
            <RoundSummary
              round={gameData ? gameData.round : 1}
              maxRounds={gameData ? gameData.maxRounds : 3}
              word={roundWord}
              scores={roundResults}
              onNext={handleNextRound}
              isFinal={false}
            />
          )}

          {showGameEnd && (
            <GameEndScreen
              players={players}
              onPlayAgain={playAgain}
              onBackToLobby={backToLobby}
            />
          )}

          {showRules && gameType && (
            <RulesModal gameType={gameType} onClose={function() { setShowRules(false); }} />
          )}
        </div>
      );

    default:
      return <HomeScreen onJoinRoom={joinRoom} />;
  }
}

// ============================================
// Inline styles for leave button
// ============================================
var leaveBtnContainerStyle = {
  position: 'fixed',
  top: '12px',
  left: '12px',
  zIndex: 200,
};

var leaveBtnStyle = {
  background: 'rgba(255, 71, 87, 0.15)',
  border: '1px solid rgba(255, 71, 87, 0.4)',
  borderRadius: '20px',
  padding: '6px 16px',
  color: '#ff6b6b',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
};

var leaveConfirmStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(15, 15, 26, 0.95)',
  border: '1px solid rgba(255, 71, 87, 0.5)',
  borderRadius: '12px',
  padding: '8px 14px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
};

var leaveConfirmBtn = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  padding: '5px 12px',
  color: '#e8e0f0',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 'bold',
};
