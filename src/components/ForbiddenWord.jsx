import React, { useState, useEffect, useRef } from 'react';
import { t, isRTL, getLanguage } from '../i18n/translations';
import { TimerRing, ChatPanel, ScoreBoard } from './SharedUI';

// ============================================
// Forbidden Word Game Component - Firebase Sync
// ============================================

const colors = {
  bgPrimary: '#0f0f1a',
  bgSecondary: '#1a1a2e',
  bgCard: 'rgba(30, 30, 60, 0.7)',
  bgInput: 'rgba(20, 20, 40, 0.8)',
  coral: '#ff6b6b',
  coralLight: '#ff8787',
  amber: '#ffd93d',
  textPrimary: '#e8e0f0',
  textSecondary: '#a8a0b8',
  textMuted: '#6b6380',
  success: '#4ecdc4',
  danger: '#ff4757',
  border: 'rgba(255, 107, 107, 0.2)',
};

const radius = { sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px' };

export const ForbiddenWord = ({
  gameData,
  players,
  currentPlayerId,
  roomId,
  language,
  chatMessages,
  onSendMessage,
}) => {
  const [guessedPlayers, setGuessedPlayers] = useState(new Set());
  const [forbiddenAlert, setForbiddenAlert] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const alertTimer = useRef(null);

  const currentDescriber = gameData?.currentDescriber;
  const word = gameData?.word;
  const forbiddenWords = gameData?.forbiddenWords || [];
  const timeLeft = gameData?.timeLeft ?? 45;
  const maxTime = 45;
  const isMyTurn = currentDescriber === currentPlayerId;
  const round = gameData?.round || 1;
  const maxRounds = gameData?.maxRounds || 3;

  const me = players.find(p => p.id === currentPlayerId);

  // Watch chatMessages for correct guesses
  useEffect(() => {
    const newGuessed = new Set();
    chatMessages.forEach(msg => {
      if (msg.isCorrect && msg.senderId) {
        newGuessed.add(msg.senderId);
      }
    });
    if (newGuessed.size > 0) {
      setGuessedPlayers(newGuessed);
    }
  }, [chatMessages]);

  // Check if describer said a forbidden word
  const containsForbiddenWord = (text) => {
    const lowerText = text.toLowerCase();
    return forbiddenWords.some(fw => {
      const lowerFw = fw.toLowerCase();
      return lowerText.includes(lowerFw) || lowerFw.includes(lowerText);
    });
  };

  // Handle message from describer
  const handleDescribe = (text) => {
    if (!word) return;

    const playerName = me?.name || 'Unknown';

    // Check if describer used a forbidden word
    if (containsForbiddenWord(text)) {
      setForbiddenAlert(true);
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 500);

      // Push penalty system message to Firebase
      onSendMessage({
        text: '⚠️ ' + playerName + ' ' + t('youSaidForbidden') + ' (-5 ' + t('score') + ')',
        isSystem: true,
      });

      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setForbiddenAlert(false), 2000);
      return;
    }

    // Push normal message from describer to Firebase
    onSendMessage({
      text,
      senderId: currentPlayerId,
      senderName: playerName,
      isSystem: false,
      isCorrect: false,
    });
  };

  // Handle guess from guessers
  const handleGuess = (text) => {
    if (!word) return;

    const isCorrect = text.toLowerCase().trim() === word.toLowerCase().trim();
    const playerName = me?.name || 'Unknown';

    // Push guess to Firebase
    onSendMessage({
      text,
      senderId: currentPlayerId,
      senderName: playerName,
      isCorrect,
      isSystem: false,
    });

    if (isCorrect) {
      // Push celebration message
      onSendMessage({
        text: `🎉 ${playerName} ${t('guessedCorrectly')}`,
        isSystem: true,
      });
    }
  };

  const handleMessage = isMyTurn ? handleDescribe : handleGuess;

  const describerName = players.find(p => p.id === currentDescriber)?.name;

  return (
    <div style={{
      ...styles.container,
      ...(penaltyFlash ? styles.penaltyContainer : {}),
    }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.roundBadge}>
            {t('round')} {round}/{maxRounds}
          </span>
        </div>
        <TimerRing timeLeft={timeLeft} maxTime={maxTime} size={60} />
        <div style={styles.headerRight}>
          <ScoreBoard players={players} currentPlayerId={currentPlayerId} />
        </div>
      </div>

      {/* Word Display */}
      <div style={styles.wordSection}>
        {isMyTurn ? (
          <div style={styles.wordCard}>
            <span style={styles.wordLabel}>{t('yourTurnToDescribe')}</span>
            <span style={styles.wordValue}>{word}</span>
            <span style={styles.wordHint}>
              ⚠️ {t('forbiddenWords')}
            </span>
          </div>
        ) : (
          <div style={styles.wordCard}>
            <span style={styles.wordLabel}>
              {describerName} {isRTL() ? 'بيوصف...' : 'is describing...'}
            </span>
            <span style={styles.wordMasked}>
              {t('guessTheDescription')}
            </span>
          </div>
        )}
      </div>

      {/* Forbidden Words List */}
      {isMyTurn && forbiddenWords.length > 0 && (
        <div style={{
          ...styles.forbiddenSection,
          animation: 'slideDown 0.3s ease',
        }}>
          <span style={styles.forbiddenTitle}>🚫 {t('forbiddenWords')}</span>
          <div style={styles.forbiddenTags}>
            {forbiddenWords.map((fw, i) => (
              <span key={i} style={styles.forbiddenTag}>
                {fw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Forbidden Alert */}
      {forbiddenAlert && (
        <div style={styles.forbiddenAlert}>
          ⚠️ {t('youSaidForbidden')} - {t('penaltyPoints')}
        </div>
      )}

      {/* Chat Section */}
      <div style={styles.chatSection}>
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleMessage}
          currentPlayerId={currentPlayerId}
          disabled={false}
          placeholder={isMyTurn ? t('describeHere') : t('typeGuess')}
          fullHeight
        />
      </div>

      {/* Guessed Players Bar */}
      {guessedPlayers.size > 0 && (
        <div style={styles.guessedBar}>
          {players.filter(p => guessedPlayers.has(p.id)).map(p => (
            <span key={p.id} style={styles.guessedTag}>
              ✓ {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    height: '100vh',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden',
    transition: 'background 0.3s ease',
  },
  penaltyContainer: {
    background: 'rgba(255, 71, 87, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  headerLeft: {},
  headerRight: {
    maxWidth: '200px',
  },
  roundBadge: {
    background: 'rgba(255, 217, 61, 0.1)',
    color: colors.amber,
    padding: '6px 14px',
    borderRadius: radius.full,
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  wordSection: {
    textAlign: 'center',
    flexShrink: 0,
  },
  wordCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '14px 20px',
    background: 'rgba(255, 217, 61, 0.08)',
    borderRadius: radius.lg,
    border: `1px solid rgba(255, 217, 61, 0.15)`,
  },
  wordLabel: {
    fontSize: '0.85rem',
    color: colors.textMuted,
  },
  wordValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: colors.amber,
    letterSpacing: '3px',
  },
  wordMasked: {
    fontSize: '1.2rem',
    color: colors.textPrimary,
    fontWeight: '600',
  },
  wordHint: {
    fontSize: '0.8rem',
    color: colors.danger,
    fontWeight: 'bold',
    marginTop: '4px',
  },
  forbiddenSection: {
    padding: '12px 16px',
    background: 'rgba(255, 71, 87, 0.08)',
    borderRadius: radius.lg,
    border: `1px solid rgba(255, 71, 87, 0.2)`,
    flexShrink: 0,
  },
  forbiddenTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: '8px',
    display: 'block',
  },
  forbiddenTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  forbiddenTag: {
    background: 'rgba(255, 71, 87, 0.15)',
    color: colors.coralLight,
    padding: '6px 14px',
    borderRadius: radius.full,
    fontSize: '0.85rem',
    fontWeight: 'bold',
    border: '1px solid rgba(255, 71, 87, 0.3)',
  },
  forbiddenAlert: {
    background: 'rgba(255, 71, 87, 0.15)',
    color: colors.danger,
    padding: '10px 16px',
    borderRadius: radius.md,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    border: `1px solid ${colors.danger}`,
    animation: 'shake 0.5s ease',
    flexShrink: 0,
  },
  chatSection: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  guessedBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 12px',
    background: 'rgba(78, 205, 196, 0.08)',
    borderRadius: radius.md,
    border: `1px solid rgba(78, 205, 196, 0.2)`,
    animation: 'fadeIn 0.3s ease',
    flexShrink: 0,
  },
  guessedTag: {
    background: 'rgba(78, 205, 196, 0.2)',
    color: colors.success,
    padding: '4px 12px',
    borderRadius: radius.full,
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
};
