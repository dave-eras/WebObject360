// Vocabulary handling functions
console.log("Vocabulary script starting...");

// Initialize vocabulary
window.initializeVocabulary = function() {
    if (!window.vocabulary) {
        console.error("Vocabulary data not loaded");
        return;
    }
    console.log("Vocabulary initialized");
};

// Get vocabulary item
window.getVocabularyItem = function(key) {
    if (!window.vocabulary || !window.vocabulary[key]) {
        console.error(`Vocabulary item not found: ${key}`);
        return null;
    }
    return window.vocabulary[key];
};

// Initialize when the script loads
window.initializeVocabulary(); 