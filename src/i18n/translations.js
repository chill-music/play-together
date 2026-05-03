// ============================================
// 🌍 Translations - English + Arabic
// ============================================

const translations = {
  en: {
    // App
    appName: "Play Together",
    appTagline: "Play with your friends in real-time!",

    // Home Screen
    enterYourName: "Enter your name",
    namePlaceholder: "Your name...",
    chooseLanguage: "Language",
    english: "English",
    arabic: "العربية",
    startButton: "Start Playing",
    createRoom: "Create Room",
    joinRoom: "Join Room",

    // Lobby Screen
    roomCode: "Room Code",
    shareCode: "Share this code with friends",
    copyCode: "Copy Code",
    copied: "Copied!",
    players: "Players",
    waitingForPlayers: "Waiting for players...",
    ready: "Ready",
    notReady: "Not Ready",
    kickPlayer: "Remove",
    leaveRoom: "Leave Room",
    startGame: "Start Game",
    maxPlayersReached: "Max 5 players allowed",
    minPlayersNeeded: "Need at least 2 players to start",

    // Game Select
    selectGame: "Choose a Game",
    drawGuess: "Draw & Guess",
    drawGuessDesc: "Draw the word and let others guess!",
    forbiddenWord: "Forbidden Word",
    forbiddenWordDesc: "Describe the word without saying forbidden words!",
    whoIsIt: "Who Is It?",
    whoIsItDesc: "Ask questions to guess the character!",
    back: "Back",
    play: "Play",

    // Settings
    maxRounds: "Rounds",
    round: "round",
    rounds: "rounds",
    players: "players",

    // Game Shared
    score: "Score",
    round: "Round",
    timeLeft: "Time",
    correct: "Correct!",
    wrong: "Wrong!",
    pass: "Pass",
    skip: "Skip",

    // Draw & Guess
    yourTurnToDraw: "Your turn to draw!",
    guessTheWord: "Guess the drawing!",
    wordIs: "The word is:",
    drawHere: "Draw here...",
    guessInput: "Type your guess...",
    clearCanvas: "Clear",
    colorPalette: "Colors",
    brushSize: "Brush Size",
    guessedCorrectly: "guessed correctly!",
    drawerPoints: "points for drawing",

    // Forbidden Word
    yourTurnToDescribe: "Your turn to describe!",
    guessTheDescription: "Guess from the description!",
    theWordIs: "The word is:",
    forbiddenWords: "Forbidden Words:",
    describeHere: "Describe the word...",
    typeGuess: "Type your guess...",
    youSaidForbidden: "You said a forbidden word!",
    penaltyPoints: "Penalty!",

    // Who Is It?
    guessTheCharacter: "Who is this character?",
    askQuestion: "Ask a yes/no question...",
    yes: "Yes",
    no: "No",
    characterIs: "The character is:",
    yourGuess: "Your guess:",
    isItCorrect: "Is it correct?",

    // Chat
    chat: "Chat",
    typeMessage: "Type a message...",
    send: "Send",

    // Round Summary
    roundOver: "Round Over!",
    roundResults: "Round Results",
    wordWas: "The word was:",
    nextRound: "Next Round",
    finalResults: "Final Results",

    // Game End
    gameOver: "Game Over!",
    winner: "Winner",
    congratulations: "Congratulations!",
    playAgain: "Play Again",
    backToLobby: "Back to Lobby",
    finalScore: "Final Score",

    // Rules
    howToPlay: "How to Play",
    rules: "Rules",
    close: "Close",
    drawGuessRules: "One player draws a word while others try to guess it. The drawer gets points for each correct guess. You have 60 seconds per round!",
    forbiddenWordRules: "One player must describe a word without using any of the forbidden words. Other players try to guess. If the describer uses a forbidden word, they lose points! You have 45 seconds per round!",
    whoIsItRules: "A character is chosen and players take turns asking yes/no questions. Players vote on who the character is. The first to guess correctly gets bonus points!",

    // Connection
    connected: "Connected",
    disconnected: "Disconnected",
    reconnecting: "Reconnecting...",

    // Misc
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try Again",
    playerJoined: "joined the room",
    playerLeft: "left the room",
  },

  ar: {
    // App
    appName: "العب معايا",
    appTagline: "العب مع أصحابك بشكل مباشر!",

    // Home Screen
    enterYourName: "ادخل اسمك",
    namePlaceholder: "اسمك...",
    chooseLanguage: "اللغة",
    english: "English",
    arabic: "العربية",
    startButton: "ابدأ اللعب",
    createRoom: "إنشاء غرفة",
    joinRoom: "انضمام لغرفة",

    // Lobby Screen
    roomCode: "كود الغرفة",
    shareCode: "شارك الكود ده مع أصحابك",
    copyCode: "نسخ الكود",
    copied: "تم النسخ!",
    players: "اللاعبين",
    waitingForPlayers: "في انتظار اللاعبين...",
    ready: "جاهز",
    notReady: "مش جاهز",
    kickPlayer: "إزالة",
    leaveRoom: "خروج من الغرفة",
    startGame: "ابدأ اللعبة",
    maxPlayersReached: "أقصى عدد 5 لاعبين",
    minPlayersNeeded: "لازم لاعبين على الأقل عشان تبدأ",

    // Game Select
    selectGame: "اختار لعبة",
    drawGuess: "ارسم وخمّن",
    drawGuessDesc: "ارسم الكلمة وخلي اللي عايز يخمّن!",
    forbiddenWord: "الكلمة المحظورة",
    forbiddenWordDesc: "وصف الكلمة من غير ما تقول الكلمات المحظورة!",
    whoIsIt: "مين ده؟",
    whoIsItDesc: "اسأل أسئلة عشان تعرف الشخصية!",
    back: "رجوع",
    play: "العب",

    // Settings
    maxRounds: "الجولات",
    round: "جولة",
    rounds: "جولات",
    players: "لاعبين",

    // Game Shared
    score: "النقاط",
    round: "الجولة",
    timeLeft: "الوقت",
    correct: "صح!",
    wrong: "غلط!",
    pass: "تخطي",
    skip: "تخطي",

    // Draw & Guess
    yourTurnToDraw: "دورك ترسم!",
    guessTheWord: "خمّن الرسمة!",
    wordIs: "الكلمة هي:",
    drawHere: "ارسم هنا...",
    guessInput: "اكتب تخمينك...",
    clearCanvas: "مسح",
    colorPalette: "الألوان",
    brushSize: "حجم الفرشة",
    guessedCorrectly: "خمّن صح!",
    drawerPoints: "نقاط للرسم",

    // Forbidden Word
    yourTurnToDescribe: "دورك توصف!",
    guessTheDescription: "خمّن من الوصف!",
    theWordIs: "الكلمة هي:",
    forbiddenWords: "كلمات ممنوعة:",
    describeHere: "وصف الكلمة...",
    typeGuess: "اكتب تخمينك...",
    youSaidForbidden: "قلت كلمة ممنوعة!",
    penaltyPoints: "خصم نقاط!",

    // Who Is It?
    guessTheCharacter: "مين الشخصية دي؟",
    askQuestion: "اسأل سؤال نعم/لا...",
    yes: "نعم",
    no: "لا",
    characterIs: "الشخصية هي:",
    yourGuess: "تخمينك:",
    isItCorrect: "هل صح؟",

    // Chat
    chat: "الدردشة",
    typeMessage: "اكتب رسالة...",
    send: "إرسال",

    // Round Summary
    roundOver: "انتهت الجولة!",
    roundResults: "نتائج الجولة",
    wordWas: "الكلمة كانت:",
    nextRound: "الجولة الجاية",
    finalResults: "النتائج النهائية",

    // Game End
    gameOver: "انتهت اللعبة!",
    winner: "الفائز",
    congratulations: "مبروك!",
    playAgain: "العب تاني",
    backToLobby: "الرجوع للوبي",
    finalScore: "النتتيجة النهائية",

    // Rules
    howToPlay: "إزاي تلعب",
    rules: "القواعد",
    close: "إغلاق",
    drawGuessRules: "لاعب واحديرسم كلمة والباقي يحاولوا يخمّنوها. الرسام بياخد نقاط لكل تخمين صح. عندك 60 ثانية في كل جولة!",
    forbiddenWordRules: "لاعب لازم يوصف كلمة من غير ما يستخدم أي كلمة من الكلمات الممنوعة. اللاعبين التانية بيحاولوا يخمّنوا. لو الوصف استخدم كلمة ممنوعة بيخصم منه! عندك 45 ثانية في كل جولة!",
    whoIsItRules: "شخصية بتتختار واللاعبين بياخدوا دور يسألوا أسئلة نعم/لا. اللاعبين بتصوت على مين الشخصية. أول واحد يخمّن صح بياخد نقاط إضافية!",

    // Connection
    connected: "متصل",
    disconnected: "غير متصل",
    reconnecting: "بيعيد الاتصال...",

    // Misc
    loading: "بيحمل...",
    error: "حصل مشكلة",
    retry: "حاول تاني",
    playerJoined: "انضم للغرفة",
    playerLeft: "خرج من الغرفة",
  }
};

// Get translation helper
let currentLanguage = localStorage.getItem('playTogetherLang') || 'en'; // Default English

export const setLanguage = (lang) => {
  currentLanguage = lang;
  localStorage.setItem('playTogetherLang', lang); // Save to browser storage
  // Update HTML dir attribute
  const html = document.documentElement;
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  html.setAttribute('lang', lang);
};

export const getLanguage = () => {
  return currentLanguage;
};

export const t = (key) => {
  return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
};

export const isRTL = () => {
  return currentLanguage === 'ar';
};

export default translations;
