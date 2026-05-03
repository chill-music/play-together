import React, { useState, useEffect, useRef } from 'react';
import { t, isRTL } from '../i18n/translations';

// ============================================
// 🎨 Design Tokens (inline styles reference)
// ============================================
const colors = {
  bgPrimary: '#0f0f1a',
  bgSecondary: '#1a1a2e',
  bgCard: 'rgba(30, 30, 60, 0.7)',
  bgCardHover: 'rgba(40, 40, 80, 0.8)',
  bgInput: 'rgba(20, 20, 40, 0.8)',
  coral: '#ff6b6b',
  coralLight: '#ff8787',
  coralDark: '#e84545',
  amber: '#ffd93d',
  amberLight: '#ffe066',
  amberDark: '#ffc107',
  textPrimary: '#e8e0f0',
  textSecondary: '#a8a0b8',
  textMuted: '#6b6380',
  success: '#4ecdc4',
  danger: '#ff6b6b',
  border: 'rgba(255, 107, 107, 0.2)',
  borderGlow: 'rgba(255, 107, 107, 0.4)',
};

const shadows = {
  sm: '0 2px 8px rgba(0,0,0,0.3)',
  md: '0 4px 16px rgba(0,0,0,0.4)',
  lg: '0 8px 32px rgba(0,0,0,0.5)',
  glow: '0 0 20px rgba(255, 107, 107, 0.3)',
};

const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

// ============================================
// 1. PlayerList - Shows all players in room
// ============================================
export const PlayerList = ({ players, currentPlayerId, isAdmin, onKick, showReady = false }) => {
  return (
    <div style={styles.playerList}>
      <h3 style={styles.playerListTitle}>
        👥 {t('players')} ({players.length})
      </h3>
      <div style={styles.playerGrid}>
        {players.map((player, index) => {
          const isMe = player.id === currentPlayerId;
          const isCreator = player.isAdmin;
          return (
            <div
              key={player.id}
              style={{
                ...styles.playerCard,
                ...(isMe ? styles.playerCardActive : {}),
                animation: `slideIn 0.3s ease ${index * 0.05}s both`,
              }}
            >
              <div style={styles.playerAvatar}>
                {player.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={styles.playerInfo}>
                <span style={styles.playerName}>
                  {player.name}
                  {isCreator && <span style={styles.crown}> 👑</span>}
                  {isMe && <span style={styles.youBadge}> ({isRTL() ? 'أنت' : 'You'})</span>}
                </span>
                <span style={styles.playerScore}>
                  ⭐ {player.score || 0}
                </span>
              </div>
              {showReady && (
                <span style={{
                  ...styles.readyBadge,
                  background: player.isReady ? colors.success : colors.textMuted,
                }}>
                  {player.isReady ? '✓' : '○'}
                </span>
              )}
              {isAdmin && !isMe && !isCreator && (
                <button
                  onClick={() => onKick?.(player.id)}
                  style={styles.kickBtn}
                  title={t('kickPlayer')}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 2. ScoreBoard - Shows scores ranking
// ============================================
export const ScoreBoard = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={styles.scoreBoard}>
      <h3 style={styles.scoreBoardTitle}>🏆 {t('score')}</h3>
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          style={{
            ...styles.scoreRow,
            ...(player.id === currentPlayerId ? styles.scoreRowActive : {}),
            animation: `slideIn 0.3s ease ${index * 0.08}s both`,
          }}
        >
          <span style={styles.scoreRank}>
            {medals[index] || `#${index + 1}`}
          </span>
          <span style={styles.scoreName}>{player.name}</span>
          <span style={styles.scoreValue}>{player.score || 0}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// 3. TimerRing - Circular countdown timer
// ============================================
export const TimerRing = ({ timeLeft, maxTime, size = 80 }) => {
  const [animatedTime, setAnimatedTime] = useState(timeLeft);
  const prevTimeRef = useRef(timeLeft);

  useEffect(() => {
    if (timeLeft <= 10) {
      setAnimatedTime(timeLeft);
    } else {
      const timer = setTimeout(() => setAnimatedTime(timeLeft), 100);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const percentage = maxTime > 0 ? (animatedTime / maxTime) * 100 : 0;
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isWarning = animatedTime <= 10;
  const isCritical = animatedTime <= 5;

  return (
    <div style={{
      ...styles.timerContainer,
      animation: isCritical ? 'timerPulse 1s ease infinite' : 'none',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isCritical ? colors.coralDark : isWarning ? colors.amberDark : colors.coral}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{
        ...styles.timerText,
        color: isCritical ? colors.coralDark : isWarning ? colors.amberDark : colors.textPrimary,
        fontSize: size * 0.3,
      }}>
        {animatedTime}
      </div>
    </div>
  );
};

// ============================================
// 4. ChatPanel - Game chat for guessing (Firebase synced)
// ============================================
export const ChatPanel = ({ messages, onSendMessage, currentPlayerId, disabled = false, placeholder, fullHeight = false }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // Support both old (playerId/name) and new (senderId/senderName) message formats
  const getSenderId = (msg) => msg.senderId || msg.playerId;
  const getSenderName = (msg) => msg.senderName || msg.name || 'Unknown';

  const panelStyle = fullHeight
    ? {
        ...styles.chatPanel,
        height: '100%',
        maxHeight: 'none',
        minHeight: 0,
      }
    : styles.chatPanel;

  return (
    <div style={panelStyle}>
      <h3 style={styles.chatTitle}>💬 {t('chat')}</h3>
      <div style={styles.chatMessages}>
        {messages.length === 0 && (
          <div style={styles.chatEmpty}>
            {t('waitingForPlayers')}
          </div>
        )}
        {messages.map((msg, i) => {
          const msgSenderId = getSenderId(msg);
          const isMe = msgSenderId === currentPlayerId;
          const isSystem = msg.isSystem;
          const msgName = getSenderName(msg);

          if (isSystem) {
            return (
              <div key={msg.id || i} style={styles.systemMsg}>
                {msg.text}
              </div>
            );
          }
          return (
            <div
              key={msg.id || i}
              style={{
                ...styles.chatMsg,
                justifyContent: isMe ? (isRTL() ? 'flex-start' : 'flex-end') : (isRTL() ? 'flex-end' : 'flex-start'),
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {!isMe && msgName && <span style={styles.chatMsgName}>{msgName}</span>}
              <div style={{
                ...styles.chatBubble,
                background: msg.isCorrect ? 'rgba(78, 205, 196, 0.2)' : isMe ? colors.coral : colors.bgCardHover,
                border: msg.isCorrect ? `1px solid ${colors.success}` : 'none',
              }}>
                {msg.isCorrect && '✓ '}
                {msg.text}
              </div>
              {isMe && msgName && <span style={styles.chatMsgName}>{msgName}</span>}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.chatInputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('typeMessage')}
          disabled={disabled}
          style={styles.chatInput}
          maxLength={100}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          style={{
            ...styles.chatSendBtn,
            opacity: disabled || !input.trim() ? 0.5 : 1,
          }}
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
};

// ============================================
// 5. RoundSummary - Shown after each round
// ============================================
export const RoundSummary = ({ round, maxRounds, word, scores, onNext, isFinal }) => {
  const sortedScores = [...scores].sort((a, b) => b.roundScore - a.roundScore);

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.roundSummaryCard,
        animation: 'slideUp 0.4s ease',
      }}>
        <h2 style={styles.roundSummaryTitle}>
          {isFinal ? '🎉 ' + t('finalResults') : '✨ ' + t('roundOver')}
        </h2>
        {!isFinal && (
          <p style={styles.roundSubtitle}>
            {t('round')} {round} / {maxRounds}
          </p>
        )}
        <div style={styles.wordReveal}>
          <span style={styles.wordRevealLabel}>{t('wordWas')}</span>
          <span style={styles.wordRevealValue}>{word}</span>
        </div>
        <div style={styles.roundScores}>
          {sortedScores.map((s, i) => (
            <div key={s.id} style={styles.roundScoreRow}>
              <span>{i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'} {s.name}</span>
              <span style={{
                color: s.roundScore > 0 ? colors.amber : colors.textMuted,
                fontWeight: 'bold',
              }}>
                +{s.roundScore}
              </span>
            </div>
          ))}
        </div>
        <button onClick={onNext} style={styles.nextRoundBtn}>
          {isFinal ? t('finalResults') : t('nextRound')} →
        </button>
      </div>
    </div>
  );
};

// ============================================
// 6. GameEndScreen - Shown after game ends
// ============================================
export const GameEndScreen = ({ players, onPlayAgain, onBackToLobby }) => {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.gameEndCard,
        animation: 'slideUp 0.5s ease',
      }}>
        <div style={styles.confettiContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: [colors.coral, colors.amber, colors.success, colors.amberLight][i % 4],
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `confetti ${2 + Math.random() * 3}s ease ${Math.random() * 1}s infinite`,
              }}
            />
          ))}
        </div>
        <h1 style={styles.gameEndTitle}>🎉 {t('gameOver')}</h1>
        <div style={styles.winnerSection}>
          <div style={styles.winnerAvatar}>
            {winner?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 style={styles.winnerName}>{winner?.name}</h2>
          <p style={styles.winnerLabel}>{t('winner')}</p>
          <p style={styles.winnerScore}>{winner?.score || 0} ⭐</p>
        </div>
        <div style={styles.finalRankings}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={styles.finalRankRow}>
              <span style={styles.finalRankMedal}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span style={styles.finalRankName}>{p.name}</span>
              <span style={styles.finalRankScore}>{p.score || 0}</span>
            </div>
          ))}
        </div>
        <div style={styles.gameEndButtons}>
          <button onClick={onPlayAgain} style={styles.playAgainBtn}>
            🔄 {t('playAgain')}
          </button>
          <button onClick={onBackToLobby} style={styles.backToLobbyBtn}>
            🏠 {t('backToLobby')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 7. RulesModal - Shows game rules
// ============================================
export const RulesModal = ({ gameType, onClose }) => {
  const rulesMap = {
    drawGuess: t('drawGuessRules'),
    forbiddenWord: t('forbiddenWordRules'),
    whoIsIt: t('whoIsItRules'),
  };

  const gameNameMap = {
    drawGuess: t('drawGuess'),
    forbiddenWord: t('forbiddenWord'),
    whoIsIt: t('whoIsIt'),
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{
        ...styles.rulesCard,
        animation: 'slideUp 0.3s ease',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.rulesTitle}>
          📖 {gameNameMap[gameType] || ''}
        </h2>
        <h3 style={styles.rulesSubtitle}>{t('howToPlay')}</h3>
        <p style={styles.rulesText}>
          {rulesMap[gameType] || ''}
        </p>
        <button onClick={onClose} style={styles.rulesCloseBtn}>
          {t('close')}
        </button>
      </div>
    </div>
  );
};

// ============================================
// 8. ConnectionStatus - Shows connection state
// ============================================
export const ConnectionStatus = ({ connected }) => {
  return (
    <div style={{
      ...styles.connectionStatus,
      ...(connected ? {} : { animation: 'pulse 2s ease infinite' }),
    }}>
      <div style={{
        ...styles.connectionDot,
        background: connected ? colors.success : colors.coralDark,
      }} />
      <span style={{
        ...styles.connectionText,
        color: connected ? colors.success : colors.coralDark,
      }}>
        {connected ? t('connected') : t('disconnected')}
      </span>
    </div>
  );
};

// ============================================
// 9. WhoIsItButtons - Yes/No voting buttons
// ============================================
export const WhoIsItButtons = ({ onVote, disabled = false, currentVoter }) => {
  return (
    <div style={styles.whoIsItBtnContainer}>
      <p style={styles.whoIsItBtnLabel}>
        {currentVoter} {isRTL() ? 'بيصوت...' : 'is voting...'}
      </p>
      <div style={styles.whoIsItBtnRow}>
        <button
          onClick={() => onVote('yes')}
          disabled={disabled}
          style={{
            ...styles.whoIsItYesBtn,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {t('yes')} ✓
        </button>
        <button
          onClick={() => onVote('no')}
          disabled={disabled}
          style={{
            ...styles.whoIsItNoBtn,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {t('no')} ✕
        </button>
      </div>
    </div>
  );
};

// ============================================
// 10. Button Component - Reusable styled button
// ============================================
export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, style = {}, fullWidth = false }) => {
  const variantStyles = {
    primary: {
      background: colors.coral,
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: colors.coral,
      border: `2px solid ${colors.coral}`,
    },
    amber: {
      background: colors.amber,
      color: '#0f0f1a',
      border: 'none',
    },
    ghost: {
      background: 'rgba(255,255,255,0.05)',
      color: colors.textSecondary,
      border: '1px solid rgba(255,255,255,0.1)',
    },
  };

  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '0.8rem' },
    md: { padding: '10px 24px', fontSize: '1rem' },
    lg: { padding: '14px 32px', fontSize: '1.1rem' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: radius.full,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: variant === 'primary' ? shadows.glow : 'none',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = shadows.glow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variant === 'primary' ? shadows.glow : 'none';
      }}
    >
      {children}
    </button>
  );
};

// ============================================
// 11. Card Component - Glass morphism card
// ============================================
export const Card = ({ children, style = {}, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bgCard,
        backdropFilter: 'blur(10px)',
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        padding: '20px',
        boxShadow: shadows.md,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = colors.borderGlow;
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = shadows.glow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadows.md;
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 12. Input Component - Styled input
// ============================================
export const Input = ({ value, onChange, placeholder, type = 'text', maxLength, style = {}, onKeyDown }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      style={{
        background: colors.bgInput,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: '12px 16px',
        color: colors.textPrimary,
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s ease',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.coral;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border;
      }}
    />
  );
};

// ============================================
// STYLES
// ============================================
const styles = {
  // PlayerList
  playerList: { width: '100%' },
  playerListTitle: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: colors.textSecondary,
  },
  playerGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: colors.bgCard,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  playerCardActive: {
    borderColor: colors.coral,
    background: 'rgba(255, 107, 107, 0.1)',
  },
  playerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: colors.coral,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#fff',
    flexShrink: 0,
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  youBadge: {
    color: colors.coral,
    fontSize: '0.8rem',
  },
  crown: {},
  playerScore: {
    fontSize: '0.8rem',
    color: colors.textMuted,
  },
  readyBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    color: '#fff',
  },
  kickBtn: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    color: colors.coral,
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ScoreBoard
  scoreBoard: {
    width: '100%',
    padding: '12px',
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
  },
  scoreBoardTitle: {
    fontSize: '1.1rem',
    marginBottom: '12px',
    textAlign: 'center',
    color: colors.amber,
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: radius.sm,
    marginBottom: '4px',
    transition: 'background 0.2s',
  },
  scoreRowActive: {
    background: 'rgba(255, 107, 107, 0.1)',
  },
  scoreRank: { fontSize: '1.1rem', width: '30px', textAlign: 'center' },
  scoreName: { flex: 1, color: colors.textPrimary, margin: '0 8px' },
  scoreValue: {
    fontWeight: 'bold',
    color: colors.amber,
    fontSize: '1.1rem',
  },

  // TimerRing
  timerContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    position: 'absolute',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ChatPanel
  chatPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: '400px',
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    flexShrink: 0,
  },
  chatTitle: {
    padding: '12px 16px',
    fontSize: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  chatEmpty: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: '20px',
    fontSize: '0.9rem',
  },
  chatMsg: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    maxWidth: '85%',
  },
  chatMsgName: {
    fontSize: '0.7rem',
    color: colors.textMuted,
    flexShrink: 0,
    marginBottom: '2px',
  },
  chatBubble: {
    padding: '8px 14px',
    borderRadius: radius.md,
    fontSize: '0.9rem',
    color: colors.textPrimary,
    wordBreak: 'break-word',
  },
  systemMsg: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: colors.textMuted,
    padding: '4px',
    fontStyle: 'italic',
  },
  chatInputRow: {
    display: 'flex',
    gap: '8px',
    padding: '10px',
    borderTop: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: '10px 14px',
    color: colors.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
  },
  chatSendBtn: {
    background: colors.coral,
    color: '#fff',
    border: 'none',
    borderRadius: radius.md,
    padding: '10px 18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // RoundSummary
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  roundSummaryCard: {
    background: colors.bgSecondary,
    borderRadius: radius.xl,
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  roundSummaryTitle: {
    fontSize: '1.8rem',
    marginBottom: '8px',
    background: `linear-gradient(135deg, ${colors.coral}, ${colors.amber})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  roundSubtitle: {
    color: colors.textSecondary,
    marginBottom: '16px',
  },
  wordReveal: {
    background: 'rgba(255, 217, 61, 0.1)',
    borderRadius: radius.md,
    padding: '14px',
    marginBottom: '20px',
  },
  wordRevealLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: colors.textMuted,
    marginBottom: '6px',
  },
  wordRevealValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: colors.amber,
  },
  roundScores: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  roundScoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.sm,
    fontSize: '0.95rem',
    color: colors.textPrimary,
  },
  nextRoundBtn: {
    background: colors.coral,
    color: '#fff',
    border: 'none',
    borderRadius: radius.full,
    padding: '14px 32px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.glow,
  },

  // GameEndScreen
  gameEndCard: {
    background: colors.bgSecondary,
    borderRadius: radius.xl,
    padding: '30px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  gameEndTitle: {
    fontSize: '2rem',
    marginBottom: '20px',
    background: `linear-gradient(135deg, ${colors.coral}, ${colors.amber})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  winnerSection: {
    marginBottom: '24px',
  },
  winnerAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: colors.coral,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: '0 auto 12px',
    boxShadow: shadows.glow,
  },
  winnerName: {
    fontSize: '1.5rem',
    color: colors.amber,
    marginBottom: '4px',
  },
  winnerLabel: {
    color: colors.textMuted,
    fontSize: '0.9rem',
    marginBottom: '4px',
  },
  winnerScore: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  finalRankings: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  finalRankRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.sm,
  },
  finalRankMedal: { fontSize: '1.2rem' },
  finalRankName: { flex: 1, textAlign: isRTL() ? 'right' : 'left', margin: '0 8px', color: colors.textPrimary },
  finalRankScore: { fontWeight: 'bold', color: colors.amber },
  gameEndButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  playAgainBtn: {
    background: colors.coral,
    color: '#fff',
    border: 'none',
    borderRadius: radius.full,
    padding: '12px 28px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.glow,
  },
  backToLobbyBtn: {
    background: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: '12px 28px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // RulesModal
  rulesCard: {
    background: colors.bgSecondary,
    borderRadius: radius.xl,
    padding: '30px',
    maxWidth: '450px',
    width: '100%',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.lg,
  },
  rulesTitle: {
    fontSize: '1.5rem',
    marginBottom: '8px',
    textAlign: 'center',
    color: colors.coral,
  },
  rulesSubtitle: {
    fontSize: '1rem',
    marginBottom: '16px',
    textAlign: 'center',
    color: colors.textSecondary,
  },
  rulesText: {
    fontSize: '0.95rem',
    lineHeight: '1.8',
    color: colors.textPrimary,
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
  },
  rulesCloseBtn: {
    display: 'block',
    margin: '0 auto',
    background: colors.coral,
    color: '#fff',
    border: 'none',
    borderRadius: radius.full,
    padding: '10px 30px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  // ConnectionStatus
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.full,
    fontSize: '0.8rem',
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'background 0.3s ease',
  },
  connectionText: {
    fontSize: '0.8rem',
    fontWeight: '500',
  },

  // WhoIsItButtons
  whoIsItBtnContainer: {
    textAlign: 'center',
    padding: '16px',
  },
  whoIsItBtnLabel: {
    color: colors.textSecondary,
    marginBottom: '12px',
    fontSize: '0.95rem',
  },
  whoIsItBtnRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  whoIsItYesBtn: {
    background: 'rgba(78, 205, 196, 0.2)',
    color: colors.success,
    border: `2px solid ${colors.success}`,
    borderRadius: radius.full,
    padding: '14px 36px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  whoIsItNoBtn: {
    background: 'rgba(255, 107, 107, 0.2)',
    color: colors.coral,
    border: `2px solid ${colors.coral}`,
    borderRadius: radius.full,
    padding: '14px 36px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
