import React, { useState, useEffect, useRef } from 'react';
import { t, isRTL, getLanguage } from '../i18n/translations';
import { TimerRing, ChatPanel, ScoreBoard } from './SharedUI';

// ============================================
// Who Is It? Game Component - Firebase Sync
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
  success: '#4ecdc4',
  border: 'rgba(255, 107, 107, 0.2)',
};

const radius = { sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px' };

export const WhoIsIt = ({
  gameData,
  players,
  currentPlayerId,
  roomId,
  language,
  chatMessages,
  onSendMessage,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(1);
  const [guessedCorrectly, setGuessedCorrectly] = useState(new Set());

  const character = gameData?.character || {};
  const hints = character.hints || [];
  const characterName = character.name || '???';
  const timeLeft = gameData?.timeLeft ?? 90;
  const maxTime = 90;
  const round = gameData?.round || 1;
  const maxRounds = gameData?.maxRounds || 3;
  const currentQuestionPlayer = gameData?.currentQuestionPlayer;
  const me = players.find(p => p.id === currentPlayerId);
  const showAnswer = timeLeft <= 0;

  // Watch chatMessages for correct guesses
  useEffect(() => {
    const newGuessed = new Set();
    chatMessages.forEach(msg => {
      if (msg.isCorrect && msg.senderId) {
        newGuessed.add(msg.senderId);
      }
    });
    if (newGuessed.size > 0) {
      setGuessedCorrectly(newGuessed);
    }
  }, [chatMessages]);

  // Reveal hints over time
  useEffect(() => {
    const hintInterval = setInterval(() => {
      setHintsRevealed(prev => {
        if (prev < hints.length) return prev + 1;
        return prev;
      });
    }, 20000);
    return () => clearInterval(hintInterval);
  }, [hints.length]);

  // Handle asking a question
  const handleAskQuestion = (text) => {
    if (!text.trim()) return;

    const playerName = me?.name || 'Unknown';

    // Push question to Firebase
    onSendMessage({
      text,
      senderId: currentPlayerId,
      senderName: playerName,
      isSystem: false,
      isCorrect: false,
    });
  };

  // Handle character guess
  const handleGuess = () => {
    if (!guessInput.trim()) return;

    const playerName = me?.name || 'Unknown';
    const isCorrect = guessInput.toLowerCase().trim() === characterName.toLowerCase().trim();

    // Push guess to Firebase
    onSendMessage({
      text: `🎯 ${isRTL() ? 'تخمين' : 'Guess'}: ${guessInput} ${isCorrect ? '✅' : '❌'}`,
      senderId: currentPlayerId,
      senderName: playerName,
      isSystem: false,
      isCorrect,
    });

    if (isCorrect) {
      // Push celebration message
      onSendMessage({
        text: `🎉 ${playerName} ${isRTL() ? 'عرف الشخصية!' : 'guessed the character!'}`,
        isSystem: true,
      });
    }

    setGuessInput('');
  };

  const questionPlayerName = players.find(p => p.id === currentQuestionPlayer)?.name;

  return (
    <div style={styles.container}>
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

      {/* Character Card */}
      <div style={styles.characterSection}>
        <div style={styles.characterCard}>
          <div style={styles.characterEmoji}>
            {character.category === 'Sports' ? '⚽' :
             character.category === 'History' ? '🏛️' :
             character.category === 'Art' ? '🎨' :
             character.category === 'Comics' ? '💥' :
             character.category === 'Space' ? '🚀' :
             character.category === 'Science' ? '🔬' :
             character.category === 'Literature' ? '📚' :
             character.category === 'Cartoons' ? '✨' :
             character.category === 'رياضة' ? '⚽' :
             character.category === 'تاريخ' ? '🏛️' :
             character.category === 'فن' ? '🎨' :
             character.category === 'كوميكس' ? '💥' :
             character.category === 'فضاء' ? '🚀' :
             character.category === 'علوم' ? '🔬' :
             character.category === 'أدب' ? '📚' :
             character.category === 'كرتون' ? '✨' : '❓'}
          </div>
          <span style={styles.characterCategory}>{character.category}</span>
          <span style={styles.characterName}>
            {showAnswer ? characterName : '???'}
          </span>
          {showAnswer && (
            <span style={styles.revealLabel}>
              {t('characterIs')} {characterName}
            </span>
          )}
        </div>
      </div>

      {/* Hints */}
      <div style={styles.hintsSection}>
        <span style={styles.hintsTitle}>💡 {isRTL() ? 'تلميحات' : 'Hints'}</span>
        <div style={styles.hintsList}>
          {hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{
              ...styles.hintItem,
              animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
            }}>
              <span style={styles.hintNumber}>{i + 1}</span>
              <span style={styles.hintText}>{hint}</span>
            </div>
          ))}
          {hintsRevealed < hints.length && (
            <div style={styles.hintLocked}>
              🔒 {isRTL() ? 'تلميح جاي قريب...' : 'Next hint coming soon...'}
            </div>
          )}
        </div>
      </div>

      {/* Guess Input */}
      {!showAnswer && (
        <div style={styles.guessSection}>
          <label style={styles.guessLabel}>
            🎯 {t('yourGuess')}
          </label>
          <div style={styles.guessRow}>
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              placeholder={t('guessTheCharacter')}
              maxLength={50}
              style={styles.guessInput}
            />
            <button
              onClick={handleGuess}
              disabled={!guessInput.trim()}
              style={{
                ...styles.guessBtn,
                opacity: guessInput.trim() ? 1 : 0.5,
              }}
            >
              {t('correct')} ✓
            </button>
          </div>
        </div>
      )}

      {/* Chat */}
      <div style={styles.chatSection}>
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleAskQuestion}
          currentPlayerId={currentPlayerId}
          disabled={showAnswer}
          placeholder={t('askQuestion')}
          fullHeight
        />
      </div>

      {/* Successfully guessed players */}
      {guessedCorrectly.size > 0 && (
        <div style={styles.guessedBar}>
          {players.filter(p => guessedCorrectly.has(p.id)).map(p => (
            <span key={p.id} style={styles.guessedTag}>
              🎉 {p.name}
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

  characterSection: {
    textAlign: 'center',
    flexShrink: 0,
  },
  characterCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '16px 20px',
    background: 'rgba(78, 205, 196, 0.06)',
    borderRadius: radius.lg,
    border: `1px solid rgba(78, 205, 196, 0.15)`,
  },
  characterEmoji: {
    fontSize: '2.5rem',
    marginBottom: '4px',
    animation: 'float 3s ease-in-out infinite',
  },
  characterCategory: {
    fontSize: '0.8rem',
    color: colors.textMuted,
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 12px',
    borderRadius: radius.full,
  },
  characterName: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: colors.success,
    letterSpacing: '2px',
  },
  revealLabel: {
    fontSize: '0.9rem',
    color: colors.amber,
    fontWeight: 'bold',
    marginTop: '4px',
  },

  hintsSection: {
    padding: '12px',
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
    maxHeight: '180px',
    overflowY: 'auto',
  },
  hintsTitle: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: colors.amber,
    marginBottom: '10px',
    display: 'block',
  },
  hintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  hintItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: radius.sm,
  },
  hintNumber: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(255, 217, 61, 0.15)',
    color: colors.amber,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  hintText: {
    fontSize: '0.9rem',
    color: colors.textPrimary,
    lineHeight: 1.4,
  },
  hintLocked: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '0.85rem',
    padding: '8px',
    fontStyle: 'italic',
  },

  guessSection: {
    padding: '12px',
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  guessLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: colors.textSecondary,
    marginBottom: '8px',
  },
  guessRow: {
    display: 'flex',
    gap: '8px',
  },
  guessInput: {
    flex: 1,
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: '10px 14px',
    color: colors.textPrimary,
    fontSize: '0.95rem',
    outline: 'none',
  },
  guessBtn: {
    background: colors.success,
    color: '#fff',
    border: 'none',
    borderRadius: radius.md,
    padding: '10px 18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
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
