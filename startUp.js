// ————————————————
// Storyline Web Object Startup
// ————————————————

// Configuration
const CONFIG = {
    webObjectURL: "6gBZPThFJBZ",
    maxRetries: 3,        // Maximum number of retry attempts
    retryDelay: 2000      // Delay between retries in milliseconds
};

// Define the web object folder path
const webObjectFolder = `./story_content/WebObjects/${CONFIG.webObjectURL}/`;
console.log("Web object folder path:", webObjectFolder);

// Global variables
window.player = GetPlayer();  // Make player globally available
window.vocabulary = null;     // Make vocabulary globally available

let loadedCount = 0;
const numLibs = 10;   // GSAP, gsap.js, vocabulary.json, image_handler.js, text_handler.js, voice_handler.js, challenge_initializer.js, score_bar.js, tooltip.js
let cachedXmlDoc = null;

// Function to check if all files are loaded
window.checkIfAllFilesLoaded = function() {
    console.log(`Files loaded: ${loadedCount}/${numLibs}`);
    if (loadedCount >= numLibs) {
        window.player.SetVar("javascriptLoadedState", 1);
        console.log("All files loaded successfully");
    }
};

// Function to load JavaScript files
window.loadJavaScriptFile = function(filename, callback) {
    const script = document.createElement('script');
    script.type = "text/javascript";
    script.src = filename;

    script.onload = () => {
        loadedCount++;
        console.log(`JavaScript file loaded: ${filename}`);
        if (callback) callback();
        checkIfAllFilesLoaded();
    };

    script.onerror = (error) => {
        console.error(`Error loading JavaScript file ${filename}:`, error);
        loadedCount++; // Increment count even on error to prevent infinite loading
        if (callback) callback();
        checkIfAllFilesLoaded();
    };

    document.head.appendChild(script);
};

// Function to load the vocabulary JSON file with retry logic
window.loadVocabularyJSON = function(callback, retryCount = 0) {
    const url = webObjectFolder + 'content.json';
    console.log("Attempting to load vocabulary from:", url);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.vocabulary = data.vocabulary;
            window.instructions = data.instructions;
            window.func_expressions = data.func_expressions;
            window.expressions_titles = data.expressions_titles;
            loadedCount++;
            console.log('Content data loaded successfully');
            if (callback) callback();
            checkIfAllFilesLoaded();
        })
        .catch(error => {
            console.error(`Error loading content data (attempt ${retryCount + 1}/${CONFIG.maxRetries}):`, error);
            
            if (retryCount < CONFIG.maxRetries - 1) {
                console.log(`Retrying in ${CONFIG.retryDelay/1000} seconds...`);
                setTimeout(() => {
                    window.loadVocabularyJSON(callback, retryCount + 1);
                }, CONFIG.retryDelay);
            } else {
                console.error('Maximum retry attempts reached. Content data could not be loaded.');
                loadedCount++;
                if (callback) callback();
                checkIfAllFilesLoaded();
            }
        });
};

// Start the loading process
window.loadJavaScriptFile("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", () => {
    window.loadJavaScriptFile(webObjectFolder + "gsap.js", () => {
        window.loadVocabularyJSON(() => {
            window.loadJavaScriptFile(webObjectFolder + "image_handler.js", () => {
                window.loadJavaScriptFile(webObjectFolder + "text_handler.js", () => {
                    window.loadJavaScriptFile(webObjectFolder + "voice_handler.js", () => {
                        window.loadJavaScriptFile(webObjectFolder + "vocabulary.js", () => {
                            window.loadJavaScriptFile(webObjectFolder + "challenge_initializer.js", () => {
                                window.loadJavaScriptFile(webObjectFolder + "score_bar.js", () => {
                                    window.loadJavaScriptFile(webObjectFolder + "tooltip.js", () => {
                                        console.log("All files loaded in sequence");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});