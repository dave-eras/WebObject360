// Function to handle image placement based on current word and language
window.handleImagePlacement = function() {
    // Get the current word number from Storyline variable
    const currentWord = window.player.GetVar("Voc_0_Current_Word");
    console.log('Current word from Storyline:', currentWord, 'Type:', typeof currentWord);
    
    // Get the current language from Storyline variable
    const currentLanguage = window.player.GetVar("Target_Language");
    console.log('Current language:', currentLanguage);
    
    // Debug log the vocabulary array
    console.log('Vocabulary array:', window.vocabulary);
    
    // Find the matching vocabulary item - convert both to strings for comparison
    const vocabularyItem = window.vocabulary.find(item => {
        console.log('Comparing:', String(item.current_word), 'with', String(currentWord));
        return String(item.current_word) === String(currentWord);
    });
    
    if (vocabularyItem) {
        // Get the image URL - use language-specific if available, otherwise use default
        const imageUrl = vocabularyItem.images[currentLanguage] || vocabularyItem.images.default;
        
        if (imageUrl) {
            // Find the image container
            const imageContainer = document.querySelector('[data-acc-text="img-frame"]');
            console.log('Image container found:', imageContainer);
            
            if (imageContainer) {
                // Log the container's HTML structure
                console.log('Container HTML:', imageContainer.outerHTML);
                
                // Create or update the image element
                let imgElement = imageContainer.querySelector('img');
                console.log('Existing img element:', imgElement);
                
                if (!imgElement) {
                    console.log('Creating new img element');
                    imgElement = document.createElement('img');
                    imageContainer.appendChild(imgElement);
                }
                
                // Set the image source and styling
                imgElement.src = imageUrl;
                imgElement.alt = vocabularyItem.translations[currentLanguage];
                
                // Apply styling to ensure image is visible and properly sized
                imgElement.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    z-index: 10;
                `;
                
                // Ensure the container has proper positioning
                imageContainer.style.position = 'relative';
                
                // Hide the SVG background if it exists
                const svgElement = imageContainer.querySelector('svg');
                if (svgElement) {
                    svgElement.style.display = 'none';
                }
                
                console.log('Image updated successfully:', imageUrl);
                console.log('Final img element:', imgElement.outerHTML);
                
                // Force a reflow to ensure the image is displayed
                imgElement.style.display = 'none';
                imgElement.offsetHeight; // Force reflow
                imgElement.style.display = '';
            } else {
                console.error('Image container not found. Available elements with data-acc-text:', 
                    Array.from(document.querySelectorAll('[data-acc-text]')).map(el => el.getAttribute('data-acc-text')));
            }
        } else {
            console.error(`No image URL found for language: ${currentLanguage} or default`);
        }
    } else {
        console.error(`No vocabulary item found for word number: ${currentWord}. Available items:`, 
            window.vocabulary.map(item => item.current_word));
    }
}

// Function to initialize the image handler
window.initImageHandler = function() {
    if (typeof window.player === 'object') {
        // Initial call to set up the image
        window.handleImagePlacement();
        
        // Set up variable change triggers in Storyline
        // These should be configured in Storyline's JavaScript triggers
        // For example:
        // - When Voc_0_Current_Word changes
        // - When Target_Language changes
        // Both should trigger handleImagePlacement()
        
        console.log('Image handler initialized successfully');
    } else {
        console.error('Player object not found - Storyline API not available');
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', window.initImageHandler);
