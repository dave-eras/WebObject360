const CONFIG = {
    webObjectURL: "5ac9cRXuecF",
    maxRetries: 3,        // Maximum number of retry attempts
    retryDelay: 2000      // Delay between retries in milliseconds
};

// Global variables
window.player = GetPlayer();  // Make player globally available
window.vocabulary = null;     // Make vocabulary globally available

let loadedCount = 0;
const numLibs = 5;   // GSAP, gsap.js, vocabulary.json, image_handler.js, text_handler.js
let cachedXmlDoc = null;

/**** Utility Functions ****/

// Function to load a JavaScript file from the web object
window.loadJavaScriptFile = function(filename, callback) {
    const script = document.createElement('script');
    script.type = "text/javascript";
    script.src = filename;

    script.onload = () => {
        loadedCount++;
        console.log(`JavaScript file loaded: ${filename}`);
        callback();
        checkIfAllFilesLoaded();
    };

    script.onerror = (error) => {
        console.error(`Error loading JavaScript file ${filename}:`, error);
    };

    document.head.appendChild(script);
}

// Function to load the vocabulary JSON file with retry logic
window.loadVocabularyJSON = function(callback, retryCount = 0) {
    fetch(webObjectFolder + 'content.json')
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
            loadedCount++;
            console.log('Content data loaded successfully');
            callback();
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
                checkIfAllFilesLoaded();
            }
        });
}

window.checkIfAllFilesLoaded = function() {
    console.log(`Files loaded: ${loadedCount}/${numLibs}`);
    if (loadedCount >= numLibs) {
        window.player.SetVar("javascriptLoadedState", 1);
        console.log("All files loaded successfully");
    }
}

/**** Main StartUp Program ****/

// Define the web object folder path
const webObjectFolder = `./story_content/WebObjects/${CONFIG.webObjectURL}/`;

// Start the loading process
window.loadJavaScriptFile("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", () => {
    window.loadJavaScriptFile(webObjectFolder + "gsap.js", () => {
        window.loadVocabularyJSON(() => {
            window.loadJavaScriptFile(webObjectFolder + "image_handler.js", () => {
                window.loadJavaScriptFile(webObjectFolder + "text_handler.js", () => {
                    console.log("All files loaded in sequence");
                });
            });
        });
    });
});