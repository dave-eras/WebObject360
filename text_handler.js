// Function to handle text translations based on current word and target language
window.text_handler = function() {
    // Get the current word number from Storyline variable
    const currentWord = GetPlayer().GetVar("Voc_0_Current_Word");
    // Get the target language from Storyline variable
    const targetLanguage = GetPlayer().GetVar("Target_Language");
    
    // Check if data is loaded
    if (!window.vocabulary || !window.instructions || !window.func_expressions) {
        console.error('Content data not loaded');
        return "";
    }

    // Find the vocabulary item with matching current_word
    const vocabularyItem = window.vocabulary.find(item => item.current_word === currentWord.toString());
    
    // Set the Voc_0_empty variable with the translation if found
    if (vocabularyItem && vocabularyItem.translations[targetLanguage]) {
        GetPlayer().SetVar("Voc_0_empty", vocabularyItem.translations[targetLanguage]);
    } else {
        GetPlayer().SetVar("Voc_0_empty", ""); // Set empty string if no translation found
    }
    
    // Update all instruction fields
    window.instructions.forEach(instruction => {
        if (instruction.translations[targetLanguage]) {
            GetPlayer().SetVar(instruction.id, instruction.translations[targetLanguage]);
        }
    });
    
    // Update all functional expression fields
    window.func_expressions.forEach(expression => {
        if (expression.translations[targetLanguage]) {
            GetPlayer().SetVar(expression.id, expression.translations[targetLanguage]);
        }
    });

    // Update all vocabulary fields
    if (window.vocabulary) {
        window.vocabulary.forEach(vocabItem => {
            if (vocabItem.id && vocabItem.translations[targetLanguage]) {
                GetPlayer().SetVar(vocabItem.id, vocabItem.translations[targetLanguage]);
            }
        });
    }
    
    return ""; // Return empty string as we've updated the variables directly
}

// Function to handle translations for instructions and expression titles
window.translation_handler = function() {
    // Get the help language from Storyline variable
    const helpLanguage = GetPlayer().GetVar("helpLanguage");
    
    // Check if data is loaded
    if (!window.instructions || !window.expressions_titles) {
        console.error('Content data not loaded');
        return "";
    }
    
    // Update all instruction fields
    window.instructions.forEach(instruction => {
        if (instruction.translations[helpLanguage]) {
            GetPlayer().SetVar(instruction.id, instruction.translations[helpLanguage]);
        }
    });
    
    // Update all functional expression fields
    window.expressions_titles.forEach(expression => {
        if (expression.translations[helpLanguage]) {
            GetPlayer().SetVar(expression.id, expression.translations[helpLanguage]);
        }
    });
    
    return ""; // Return empty string as we've updated the variables directly
}