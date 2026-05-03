import React, { useState } from 'react';
import { t, setLanguage, getLanguage, isRTL } from '../i18n/translations';
import { Button, Card, Input } from './SharedUI';

// ============================================
// Colors & Styles
// ============================================
const colors = {
  bgPrimary: '#0f0f1a',
  bgSecondary: '#1a1a2e',
  bgCard: 'rgba(30, 30, 60, 0.7)',
  bgInput: 'rgba(20, 20, 40, 0.8)',
  coral: '#ff6b6b',
  coralLight: '#ff8787',
  amber: '#ffd93d',
  amberLight: '#ffe066',
  textPrimary: '#e8e0f0',
  textSecondary: '#a8a0b8',
  textMuted: '#6b6380',
  border: 'rgba(255, 107, 107, 0.2)',
  borderGlow: 'rgba(255, 107, 107, 0.4)',
  success: '#4ecdc4',
};

const radius = {
  sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px',
};

const shadows = {
  sm: '0 2px 8px rgba(0,0,0,0.3)',
  md: '0 4px 16px rgba(0,0,0,0.4)',
  lg: '0 8px 32px rgba(0,0,0,0.5)',
  glow: '0 0 20px rgba(255, 107, 107, 0.3)',
};

// ============================================
// HomeScreen - Name input + language + create/join
// ============================================
export const HomeScreen = ({ onJoinRoom }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [language, setLocalLang] = useState(getLanguage());

  const handleLanguageChange = (lang) => {
    setLocalLang(lang);
    setLanguage(lang); // Also saves to localStorage now
  };

  const handleSubmit = () => {
    if (name.trim()) {
      if (mode === 'join') {
        onJoinRoom(name.trim(), roomId.trim().toUpperCase());
      } else {
        onJoinRoom(name.trim(), null);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={styles.container}>
      {/* Floating decorative elements */}
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.homeContent}>
        {/* Logo / Title */}
        <div style={styles.logoSection}>
          <div style={styles.logoEmoji}>🎮</div>
          <h1 style={styles.title}>{t('appName')}</h1>
          <p style={styles.tagline}>{t('appTagline')}</p>
        </div>

        {/* Name Input */}
        <div style={styles.inputSection}>
          <label style={styles.label}>{t('enterYourName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('namePlaceholder')}
            maxLength={15}
            style={styles.textInput}
          />
        </div>

        {/* Language Toggle */}
        <div style={styles.langSection}>
          <label style={styles.label}>{t('chooseLanguage')}</label>
          <div style={styles.langToggle}>
            <button
              onClick={() => handleLanguageChange('ar')}
              style={{
                ...styles.langBtn,
                background: language === 'ar' ? colors.coral : 'transparent',
                color: language === 'ar' ? '#fff' : colors.textSecondary,
                borderColor: language === 'ar' ? colors.coral : colors.border,
              }}
            >
              العربية
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              style={{
                ...styles.langBtn,
                background: language === 'en' ? colors.coral : 'transparent',
                color: language === 'en' ? '#fff' : colors.textSecondary,
                borderColor: language === 'en' ? colors.coral : colors.border,
              }}
            >
              English
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={styles.modeToggle}>
          <button
            onClick={() => setMode('create')}
            style={{
              ...styles.modeBtn,
              background: mode === 'create' ? colors.coral : 'transparent',
              color: mode === 'create' ? '#fff' : colors.textSecondary,
            }}
          >
            ✨ {t('createRoom')}
          </button>
          <button
            onClick={() => setMode('join')}
            style={{
              ...styles.modeBtn,
              background: mode === 'join' ? colors.coral : 'transparent',
              color: mode === 'join' ? '#fff' : colors.textSecondary,
            }}
          >
            🔗 {t('joinRoom')}
          </button>
        </div>

        {/* Room Code Input (for join mode) */}
        {mode === 'join' && (
          <div style={{
            ...styles.inputSection,
            animation: 'slideDown 0.3s ease',
          }}>
            <label style={styles.label}>{t('roomCode')}</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="XXXX"
              maxLength={4}
              style={{ ...styles.textInput, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || (mode === 'join' && roomId.trim().length < 3)}
          fullWidth
          size="lg"
        >
          {mode === 'create' ? '✨ ' + t('createRoom') : '🔗 ' + t('joinRoom')}
        </Button>
      </div>
    </div>
  );
};

// ============================================
// LobbyScreen - Waiting room before game starts
// ============================================
export const LobbyScreen = ({
  roomId,
  players,
  currentPlayerId,
  isAdmin,
  onSelectGame,
  onLeaveRoom,
  onKickPlayer,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      const el = document.createElement('textarea');
      el.value = roomId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canStart = players.length >= 2;

  return (
    <div style={styles.lobbyContainer}>
      {/* Room Header */}
      <div style={styles.lobbyHeader}>
        <button onClick={onLeaveRoom} style={styles.backBtn}>
          ← {t('leaveRoom')}
        </button>
        <h2 style={styles.lobbyTitle}>{t('appName')}</h2>
        <div style={{ width: '80px' }} />
      </div>

      {/* Room Code Card */}
      <div style={styles.roomCodeCard}>
        <p style={styles.roomCodeLabel}>{t('roomCode')}</p>
        <div style={styles.roomCodeRow}>
          <span style={styles.roomCode}>{roomId}</span>
          <button onClick={handleCopy} style={styles.copyBtn}>
            {copied ? '✓ ' + t('copied') : '📋 ' + t('copyCode')}
          </button>
        </div>
        <p style={styles.shareText}>{t('shareCode')}</p>
      </div>

      {/* Players List */}
      <div style={styles.playersSection}>
        <div style={styles.playersHeader}>
          <h3 style={styles.playersTitle}>👥 {t('players')}</h3>
          <span style={styles.playersCount}>{players.length}/5</span>
        </div>
        <div style={styles.playersList}>
          {players.map((player, i) => {
            const isMe = player.id === currentPlayerId;
            const isCreator = player.isAdmin;
            return (
              <div
                key={player.id}
                style={{
                  ...styles.playerItem,
                  animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <div style={styles.playerAvatar}>
                  {player.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={styles.playerInfo}>
                  <span style={styles.playerName}>
                    {player.name}
                    {isCreator && ' 👑'}
                  </span>
                  {isMe && <span style={styles.youTag}>{isRTL() ? 'أنت' : 'You'}</span>}
                </div>
                {isAdmin && !isMe && !isCreator && (
                  <button
                    onClick={() => onKickPlayer(player.id)}
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

        {players.length < 2 && (
          <p style={styles.waitingMsg}>
            ⏳ {t('waitingForPlayers')}
          </p>
        )}
      </div>

      {/* Action Button */}
      {isAdmin && (
        <div style={styles.actionSection}>
          {canStart ? (
            <Button onClick={onSelectGame} fullWidth size="lg">
              🎮 {t('startGame')}
            </Button>
          ) : (
            <p style={styles.cantStartMsg}>
              {t('minPlayersNeeded')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// GameSelectScreen - Choose which game to play
// ============================================
export const GameSelectScreen = ({ onSelectGame, onBack }) => {
  const games = [
    {
      id: 'drawGuess',
      emoji: '🎨',
      name: t('drawGuess'),
      desc: t('drawGuessDesc'),
      gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    },
    {
      id: 'forbiddenWord',
      emoji: '🤐',
      name: t('forbiddenWord'),
      desc: t('forbiddenWordDesc'),
      gradient: 'linear-gradient(135deg, #ffd93d, #f39c12)',
    },
    {
      id: 'whoIsIt',
      emoji: '🤔',
      name: t('whoIsIt'),
      desc: t('whoIsItDesc'),
      gradient: 'linear-gradient(135deg, #4ecdc4, #44bd9e)',
    },
  ];

  return (
    <div style={styles.gameSelectContainer}>
      <div style={styles.gameSelectHeader}>
        <button onClick={onBack} style={styles.backBtn}>
          ← {t('back')}
        </button>
        <h2 style={styles.gameSelectTitle}>{t('selectGame')}</h2>
        <div style={{ width: '80px' }} />
      </div>

      <div style={styles.gameCards}>
        {games.map((game, i) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            style={{
              ...styles.gameCard,
              animation: `slideUp 0.4s ease ${i * 0.1}s both`,
            }}
          >
            <div style={{
              ...styles.gameCardGradient,
              background: game.gradient,
            }} />
            <div style={styles.gameCardContent}>
              <span style={styles.gameCardEmoji}>{game.emoji}</span>
              <h3 style={styles.gameCardName}>{game.name}</h3>
              <p style={styles.gameCardDesc}>{game.desc}</p>
              <span style={styles.gameCardPlay}>{t('play')} →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// STYLES
// ============================================
const styles = {
  // Shared
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    background: `linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecor1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 217, 61, 0.06) 0%, transparent 70%)',
    bottom: '-80px',
    right: '-80px',
    pointerEvents: 'none',
  },

  // HomeScreen
  homeContent: {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 1,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '10px',
    animation: 'slideDown 0.5s ease',
  },
  logoEmoji: {
    fontSize: '3.5rem',
    display: 'block',
    marginBottom: '8px',
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: `linear-gradient(135deg, ${colors.coral}, ${colors.amber})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.3,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: '1rem',
    marginTop: '4px',
  },
  inputSection: {
    width: '100%',
    animation: 'slideUp 0.4s ease',
  },
  label: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: '0.9rem',
    marginBottom: '8px',
  },
  textInput: {
    width: '100%',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: '14px 18px',
    color: colors.textPrimary,
    fontSize: '1.1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  langSection: {
    width: '100%',
    animation: 'slideUp 0.5s ease',
  },
  langToggle: {
    display: 'flex',
    gap: '8px',
    background: colors.bgCard,
    borderRadius: radius.md,
    padding: '4px',
    border: `1px solid ${colors.border}`,
  },
  langBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: radius.sm,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    background: colors.bgCard,
    borderRadius: radius.md,
    padding: '4px',
    border: `1px solid ${colors.border}`,
    animation: 'slideUp 0.6s ease',
  },
  modeBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: radius.sm,
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },

  // LobbyScreen
  lobbyContainer: {
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  lobbyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: '8px 16px',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  lobbyTitle: {
    fontSize: '1.2rem',
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  roomCodeCard: {
    background: colors.bgCard,
    borderRadius: radius.xl,
    padding: '24px',
    textAlign: 'center',
    border: `1px solid ${colors.border}`,
    backdropFilter: 'blur(10px)',
  },
  roomCodeLabel: {
    fontSize: '0.85rem',
    color: colors.textMuted,
    marginBottom: '8px',
  },
  roomCodeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  roomCode: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: colors.amber,
    letterSpacing: '12px',
    fontFamily: 'monospace',
  },
  copyBtn: {
    background: 'rgba(255, 217, 61, 0.1)',
    border: `1px solid rgba(255, 217, 61, 0.3)`,
    borderRadius: radius.full,
    padding: '8px 16px',
    color: colors.amber,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  shareText: {
    fontSize: '0.85rem',
    color: colors.textMuted,
  },
  playersSection: {
    flex: 1,
    background: colors.bgCard,
    borderRadius: radius.lg,
    padding: '16px',
    border: `1px solid ${colors.border}`,
  },
  playersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  playersTitle: {
    fontSize: '1rem',
    color: colors.textSecondary,
  },
  playersCount: {
    fontSize: '0.85rem',
    color: colors.textMuted,
    background: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: radius.full,
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  playerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: colors.coral,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0,
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  playerName: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  youTag: {
    fontSize: '0.75rem',
    color: colors.coral,
  },
  kickBtn: {
    background: 'rgba(255, 107, 107, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    color: colors.coral,
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingMsg: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: '16px',
    fontSize: '0.9rem',
    animation: 'pulse 2s ease infinite',
  },
  actionSection: {
    padding: '8px 0',
  },
  cantStartMsg: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '0.9rem',
    padding: '12px',
  },

  // GameSelectScreen
  gameSelectContainer: {
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  gameSelectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameSelectTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  gameCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1,
    justifyContent: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%',
  },
  gameCard: {
    position: 'relative',
    borderRadius: radius.xl,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: `1px solid ${colors.border}`,
  },
  gameCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gameCardContent: {
    position: 'relative',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: colors.bgCard,
  },
  gameCardEmoji: {
    fontSize: '2.5rem',
    marginBottom: '4px',
  },
  gameCardName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  gameCardDesc: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    lineHeight: 1.4,
  },
  gameCardPlay: {
    color: colors.coral,
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '4px',
  },
};
