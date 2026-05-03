// ============================================
// 📚 Data - Word Banks, Characters, Questions
// ============================================

// Draw & Guess Words
export const drawGuessWords = {
  en: [
    "cat", "dog", "elephant", "giraffe", "penguin", "butterfly",
    "house", "car", "airplane", "bicycle", "train", "boat",
    "pizza", "banana", "ice cream", "cake", "hamburger", "sushi",
    "sun", "moon", "star", "rainbow", "cloud", "mountain",
    "guitar", "piano", "drums", "violin", "microphone", "headphones",
    "football", "basketball", "tennis", "swimming", "boxing", "skiing",
    "doctor", "teacher", "firefighter", "astronaut", "chef", "artist",
    "crown", "diamond", "sword", "shield", "castle", "dragon",
    "flower", "tree", "cactus", "mushroom", "rose", "palm tree",
    "robot", "alien", "dinosaur", "unicorn", "mermaid", "wizard",
    "laptop", "phone", "camera", "television", "rocket", "helicopter",
    "book", "clock", "glasses", "umbrella", "key", "ladder",
    "spider", "snake", "fish", "bird", "turtle", "rabbit",
    "snowman", "ghost", "vampire", "witch", "pirate", "ninja"
  ],
  ar: [
    "قطة", "كلب", "فيل", "زرافة", "بطريق", "فراشة",
    "بيت", "عربية", "طيارة", "دراجة", "قطر", "مركب",
    "بيتزا", "موز", "آيس كريم", "كيك", "شاورما", "سوشي",
    "شمس", "قمر", "نجمة", "قوس قزح", "سحابة", "جبل",
    "جيتار", "بيانو", "طبول", "كمان", "مايكروفون", "سماعات",
    "كورة", "كرة سلة", "تنس", "سباحة", "ملاكمة", "تزلج",
    "دكتور", "مدرس", "رجل إطفاء", "رائد فضاء", "طباخ", "فنان",
    "تاج", "ألماس", "سيف", "درع", "قلعة", "تنين",
    "وردة", "شجرة", "صبار", "فطر", "فلورا", "نخلة",
    "روبوت", "فضائي", "ديناصور", "يونيكورن", "حورية البحر", "ساحر",
    "لابتوب", "موبايل", "كاميرا", "تلفزيون", "صاروخ", "هليكوبتر",
    "كتاب", "ساعة", "نظارة", "شمسية", "مفتاح", "سلم",
    "عنكبوت", "أفعى", "سمكة", "عصفور", "سلحفاة", "أرنب",
    "رجل ثلج", "شبح", "مصاص دماء", "ساحرة", "قرصان", "نينجا"
  ]
};

// Forbidden Word - Word + Forbidden Words
export const forbiddenWordSets = {
  en: [
    { word: "Elephant", forbidden: ["big", "trunk", "africa", "gray", "nose"] },
    { word: "Pizza", forbidden: ["cheese", "italy", "tomato", "round", "oven"] },
    { word: "Guitar", forbidden: ["music", "string", "rock", "play", "band"] },
    { word: "Airplane", forbidden: ["fly", "sky", "pilot", "wing", "airport"] },
    { word: "Football", forbidden: ["soccer", "ball", "goal", "kick", "field"] },
    { word: "Doctor", forbidden: ["hospital", "medicine", "patient", "sick", "nurse"] },
    { word: "Snow", forbidden: ["cold", "white", "winter", "ice", "fall"] },
    { word: "Bicycle", forbidden: ["wheel", "pedal", "ride", "chain", "two"] },
    { word: "Camera", forbidden: ["photo", "picture", "lens", "shoot", "flash"] },
    { word: "Diamond", forbidden: ["ring", "jewelry", "expensive", "shine", "hard"] },
    { word: "Dragon", forbidden: ["fire", "wing", "mythical", "lizard", "knight"] },
    { word: "Umbrella", forbidden: ["rain", "water", "open", "handle", "cover"] },
    { word: "Robot", forbidden: ["machine", "metal", "computer", "human", "future"] },
    { word: "Moon", forbidden: ["night", "space", "sky", "bright", "round"] },
    { word: "Book", forbidden: ["read", "pages", "story", "library", "paper"] },
    { word: "Swimming", forbidden: ["water", "pool", "swim", "sport", "wet"] },
    { word: "Burger", forbidden: ["bread", "meat", "fast food", "restaurant", "eat"] },
    { word: "Castle", forbidden: ["king", "queen", "medieval", "stone", "fortress"] },
    { word: "Piano", forbidden: ["keys", "music", "black and white", "play", "instrument"] },
    { word: "Rainbow", forbidden: ["colors", "rain", "sky", "arc", "weather"] }
  ],
  ar: [
    { word: "فيل", forbidden: ["كبير", "خرطوم", "أفريقيا", "رمادي", "أنف"] },
    { word: "بيتزا", forbidden: ["جبنة", "إيطاليا", "طماطم", "دائري", "فرن"] },
    { word: "جيتار", forbidden: ["مزيكا", "وتر", "روك", "عزف", "فرقة"] },
    { word: "طيارة", forbidden: ["يطير", "سماء", "طيار", "جناح", "مطار"] },
    { word: "كورة", forbidden: ["جول", "كرة", "ملعب", "ركلة", "فريق"] },
    { word: "دكتور", forbidden: ["مستشفى", "دوا", "مريض", "مرض", "تمريض"] },
    { word: "ثلج", forbidden: ["برد", "أبيض", "شتاء", "جليد", "هطول"] },
    { word: "دراجة", forbidden: ["عجلة", "بديل", "ركوب", "سلسلة", "اتنين"] },
    { word: "كاميرا", forbidden: ["صورة", "تصوير", "عدسة", "فلاش", "فيديو"] },
    { word: "ألماس", forbidden: ["خاتم", "مجوهرات", "غالي", "يلمع", "صلب"] },
    { word: "تنين", forbidden: ["نار", "جناح", "أسطوري", "سحلية", "فارس"] },
    { word: "شمسية", forbidden: ["مطر", "مية", "مفتوحة", "مقبض", "غطاء"] },
    { word: "روبوت", forbidden: ["آلة", "معدن", "كمبيوتر", "بشري", "مستقبل"] },
    { word: "قمر", forbidden: ["ليل", "فضاء", "سماء", "ساطع", "دائري"] },
    { word: "كتاب", forbidden: ["قراءة", "صفحات", "قصة", "مكتبة", "ورق"] },
    { word: "سباحة", forbidden: ["مية", "حمام", "بسبسة", "رياضة", "مبلول"] },
    { word: "شاورما", forbidden: ["عيش", "لحمة", "أكل", "محل", "عربي"] },
    { word: "قلعة", forbidden: ["ملك", "ملكة", "حجر", "حصن", "قديم"] },
    { word: "بيانو", forbidden: ["كيبورد", "مزيكا", "أبيض وأسود", "عزف", "آلة"] },
    { word: "قوس قزح", forbidden: ["ألوان", "مطر", "سماء", "قوس", "طقس"] }
  ]
};

// Who Is It? - Characters with hints
export const whoIsItCharacters = {
  en: [
    {
      name: "Albert Einstein",
      hints: ["I was a scientist", "I developed the theory of relativity", "I had wild white hair", "I won a Nobel Prize in Physics"],
      category: "Science"
    },
    {
      name: "Cleopatra",
      hints: ["I was a queen", "I ruled ancient Egypt", "I spoke 9 languages", "My story inspired many movies"],
      category: "History"
    },
    {
      name: "Lionel Messi",
      hints: ["I am an athlete", "I play football", "I'm from Argentina", "I won the World Cup"],
      category: "Sports"
    },
    {
      name: "Mona Lisa",
      hints: ["I am a painting", "I was painted by Leonardo da Vinci", "I hang in the Louvre", "I have a mysterious smile"],
      category: "Art"
    },
    {
      name: "Spider-Man",
      hints: ["I am a fictional character", "I was bitten by a spider", "I live in New York City", "I can shoot webs"],
      category: "Comics"
    },
    {
      name: "Frida Kahlo",
      hints: ["I was an artist", "I was from Mexico", "I painted many self-portraits", "I had a unibrow"],
      category: "Art"
    },
    {
      name: "Neil Armstrong",
      hints: ["I was an astronaut", "I was the first person on the moon", "I worked for NASA", "I said 'That's one small step for man'"],
      category: "Space"
    },
    {
      name: "Mickey Mouse",
      hints: ["I am a cartoon character", "I was created by Walt Disney", "I have big round ears", "I wear red shorts"],
      category: "Cartoons"
    },
    {
      name: "Shakespeare",
      hints: ["I was a writer", "I wrote plays", "I was from England", "I wrote Romeo and Juliet"],
      category: "Literature"
    },
    {
      name: "Batman",
      hints: ["I am a superhero", "I live in Gotham City", "I don't have superpowers", "I dress like a bat"],
      category: "Comics"
    }
  ],
  ar: [
    {
      name: "ألبرت أينشتاين",
      hints: ["كنت عالم", "طوريت نظرية النسبية", "كان عندي شعر أبيض فوضوي", "كسبت جائزة نوبل في الفيزياء"],
      category: "علوم"
    },
    {
      name: "كليوباترا",
      hints: ["كنت ملكة", "حكمت مصر القديمة", "كنت بتتكلم 9 لغات", "قصتي ألهمت أفلام كتير"],
      category: "تاريخ"
    },
    {
      name: "ليونيل ميسي",
      hints: ["أنا رياضي", "بلعب كورة", "أنا من الأرجنتين", "كسبت كأس العالم"],
      category: "رياضة"
    },
    {
      name: "موناليزا",
      hints: ["أنا لوحة", "رسمها ليوناردو دافنشي", "معروضة في اللوفر", "عندي ابتسامة غامضة"],
      category: "فن"
    },
    {
      name: "سبايدر مان",
      hints: ["أنا شخصية خيالية", "عضتني عنكبوت", "أعيش في نيويورك", "أقدر أرمي شبك"],
      category: "كوميكس"
    },
    {
      name: "فريدا كالو",
      hints: ["كنت فنانة", "كنت من المكسيك", "رسمت صور ذاتية كتير", "كان عندي حاجب موحد"],
      category: "فن"
    },
    {
      name: "نيل أرمسترونغ",
      hints: ["كنت رائد فضاء", "أول شخص نزل على القمر", "اشتغلت في ناسا", "قلت 'هي خطوة صغيرة للإنسان'"],
      category: "فضاء"
    },
    {
      name: "ميكي ماوس",
      hints: ["أنا شخصية كرتونية", "أنشأني والت ديزني", "عندي ودان كبار مدورين", "بلبس شورت أحمر"],
      category: "كرتون"
    },
    {
      name: "شكسبير",
      hints: ["كنت كاتب", "كنت أكتب مسرحيات", "كنت من إنجلترا", "كتبت روميو وجولييت"],
      category: "أدب"
    },
    {
      name: "باتمان",
      hints: ["أنا بطل خارق", "أعيش في جوثام سيتي", "مش عندي قوى خارقة", "بلبس زي الخفاش"],
      category: "كوميكس"
    }
  ]
};

// Utility: Get random item from array
export const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Utility: Shuffle array
export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Utility: Pick N random items without repeats
export const pickRandom = (arr, count) => {
  return shuffleArray(arr).slice(0, count);
};
