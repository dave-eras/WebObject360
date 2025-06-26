// Challenge Initializer for Storyline
window.challenge_initializer = function() {
    const player = GetPlayer();

    const isChallenge = player.GetVar("Challenge_mode");
    if (!isChallenge) return;

    if (!window.vocabulary) {
        console.error("Vocabulary data not loaded.");
        return;
    }

    const targetLang = player.GetVar("Target_Language");
    const slide = player.GetVar("Current_slide");
    const shouldReset = player.GetVar("Challenge_reset") || false;

    // Reset used words if requested
    if (shouldReset) {
        window.resetAllChallengeSlides(); // Reset all slides, not just the current one
        player.SetVar("Challenge_reset", false); // Reset the flag
        return; // Early return to avoid picking a word in the same call
    }

    // Determine word range based on slide number
    let minWord, maxWord;
    if (slide === 1) {
        minWord = 1;
        maxWord = 14;
    } else if (slide === 2) {
        minWord = 15;
        maxWord = 23;
    } else if (slide === 3) {
        minWord = 24;
        maxWord = 30;
    } else {
        console.warn("Current_slide not recognized:", slide);
        return;
    }

    // Slide-specific used word list
    const listName = `usedWords_slide${slide}`;
    window[listName] = window[listName] || [];
    const usedWords = window[listName];

    // Get all available (unused) words in range
    const available = [];
    for (let i = minWord; i <= maxWord; i++) {
        if (!usedWords.includes(i)) {
            available.push(i);
        }
    }

    if (available.length === 0) {
        console.log("All challenge words have been used on this slide.");
        player.SetVar("Challenge_empty", "✔ Completed!");
        player.SetVar("Voc_0_Current_Word", 0);
        player.SetVar("Challenge_word_number", 0);
        return;
    }

    // Pick a random word from available
    const index = Math.floor(Math.random() * available.length);
    const wordNum = available[index];
    usedWords.push(wordNum); // Mark as used

    const vocabItem = window.vocabulary.find(item => item.current_word === wordNum.toString());

    // Always set the word number (for both logic and visual tracking)
    player.SetVar("Challenge_word_number", wordNum);

    if (vocabItem && vocabItem.translations[targetLang]) {
        player.SetVar("Challenge_empty", vocabItem.translations[targetLang]);
    } else {
        player.SetVar("Challenge_empty", "???");
        console.warn("Translation not found for word number", wordNum);
    }
};

// Function to reset used words for a specific slide
function resetUsedWords(slide) {
    const listName = `usedWords_slide${slide}`;
    window[listName] = []; // Clear the array of used words
    console.log(`Reset used words for slide ${slide}`);
}

// Function to reset all slides
window.resetAllChallengeSlides = function() {
    for (let slide = 1; slide <= 3; slide++) {
        resetUsedWords(slide);
    }
    console.log("Reset all challenge slides");
}; 