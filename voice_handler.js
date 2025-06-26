// Function to handle text-to-speech requests
window.voice_handler = async function() {
    // Get the current word number and target language from Storyline variables
    const currentWord = GetPlayer().GetVar("Voc_0_Current_Word");
    const targetLanguage = GetPlayer().GetVar("Target_Language");
    
    // Check if data is loaded
    if (!window.vocabulary) {
        console.error('Vocabulary data not loaded');
        return "";
    }
    
    // Find the vocabulary item with matching current_word
    const vocabularyItem = window.vocabulary.find(item => item.current_word === currentWord.toString());
    
    if (!vocabularyItem || !vocabularyItem.translations[targetLanguage]) {
        console.error('No translation found for the current word and language');
        return "";
    }
    
    // Get the text to be spoken
    const textToSpeak = vocabularyItem.translations[targetLanguage];
    
    try {
        // Make request to the API gateway endpoint
        const response = await fetch(`https://byvxf34hzk.execute-api.eu-central-1.amazonaws.com/test1/narakeet360realWorld?text=${encodeURIComponent(textToSpeak)}&targetLanguage=${targetLanguage}`, {
            headers: {
                'Accept': 'audio/x-m4a'
            },
            credentials: 'include'  // This will include credentials in the request
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the audio data
        const audioBlob = await response.blob();
        
        // Create an audio element and play the sound
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
        
        return ""; // Return empty string as we're handling the audio playback directly
    } catch (error) {
        console.error('Error fetching audio:', error);
        return "";
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Voice handler initialized');
});