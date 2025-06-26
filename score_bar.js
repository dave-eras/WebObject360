// ————————————————
// Responsive Progress Bar for Storyline
// ————————————————

console.log("Score bar script starting...");

// Create a global function to initialize the score bar
window.initializeScoreBar = function() {
    console.log("Initializing score bar from trigger...");
    
    var player   = GetPlayer();
    var maxScore = 30;

    // find stage
    var stage = document.getElementById('storyContent')
             || document.getElementById('slideContainer')
             || document.body;

    console.log("Found stage element:", stage);

    // ensure stage is a positioned container
    if (getComputedStyle(stage).position === 'static') {
      stage.style.position = 'relative';
      console.log("Set stage position to relative");
    }

    // Find the pre-existing container with data-acc-text 'score_bar' from Storyline
    // This Storyline container will serve as a reference for positioning our custom bar.
    var storylineContainer = document.querySelector('[data-acc-text="score_bar"]');
    if (!storylineContainer) {
        console.error("Storyline score bar container with data-acc-text 'score_bar' not found. Please ensure it exists in Storyline.");
        return;
    }
    console.log("Storyline container found:", storylineContainer);

    // Don't add twice - check for our custom progress bar
    if (document.getElementById('js-progress-bar')) {
        console.log("Custom progress bar already exists, skipping creation");
        return;
    }

    // Measure Storyline container's dimensions and position
    // We will use these to position our custom div
    var rect = storylineContainer.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();

    var contW    = rect.width;
    var contH    = rect.height;
    var contLeft = rect.left - stageRect.left; // Relative to stage
    var contTop  = rect.top - stageRect.top;   // Relative to stage

    console.log("Progress bar dimensions (from Storyline object):", { width: contW, height: contH, left: contLeft, top: contTop });

    // Build our custom progress bar container
    var container = document.createElement('div'); // This is our new custom div
    container.id = 'js-progress-bar'; // Give it a unique ID to prevent duplicates
    Object.assign(container.style, {
      position:        'absolute',
      left:            contLeft + 'px',
      top:             contTop  + 'px',
      width:           contW    + 'px',
      height:          contH    + 'px',
      backgroundColor: '#333', // Our custom background color
      border:          '2px solid #fff',
      borderRadius:    (contH/2) + 'px',
      overflow:        'hidden',
      opacity:         '0',
      transition:      'opacity 0.75s ease',
      zIndex:          '1000' // Ensure it's above Storyline elements
    });
    stage.appendChild(container); // Append to the main stage
    console.log("Custom progress bar container created and added to stage");

    // fill
    var fill = document.createElement('div');
    Object.assign(fill.style, {
      width:      '0px',
      height:     '100%',
      background: 'linear-gradient(90deg, #FFFACD, #FFD900)',
      transition: 'width 0.5s ease-out'
    });
    container.appendChild(fill); // Append fill to our custom container
    console.log("Progress bar fill element created");

    // Fade in, one draw
    setTimeout(function(){
      container.style.opacity = '1';
      updateBar();
      console.log("Progress bar faded in");
    }, 50);

    var lastScore = null;
    setInterval(updateBar, 200);

    function updateBar(){
      var score = parseInt(player.GetVar('Challenge_score'), 10) || 0;
      if (score === lastScore) return;
      lastScore = score;
      // Use the actual current width of our custom container for calculation
      var barWidth = container.offsetWidth;
      var fillW = (score / maxScore) * barWidth;
      fill.style.width = fillW + 'px';
      console.log("Progress bar updated:", { score, fillWidth: fillW, barWidth: barWidth });
    }

    // Store our custom container globally for access by hide function and resize handler
    window.scoreBarContainer = container;
    window.scoreBarFill = fill; // Also store fill for direct access on resize

    // Add resize listener for responsiveness
    window.addEventListener('resize', function() {
        console.log("Window resized. Updating score bar position and size.");
        var storylineContainer = document.querySelector('[data-acc-text="score_bar"]');
        if (storylineContainer) {
            var rect = storylineContainer.getBoundingClientRect();
            var stageRect = stage.getBoundingClientRect();

            var updatedContW    = rect.width;
            var updatedContH    = rect.height;
            var updatedContLeft = rect.left - stageRect.left;
            var updatedContTop  = rect.top - stageRect.top;

            Object.assign(container.style, {
                left:   updatedContLeft + 'px',
                top:    updatedContTop  + 'px',
                width:  updatedContW    + 'px',
                height: updatedContH    + 'px',
                borderRadius: (updatedContH/2) + 'px' // Re-calculate border radius
            });
            // Recalculate and apply fill width based on new container size
            updateBar(); 
            console.log("Score bar resized:", { width: updatedContW, height: updatedContH, left: updatedContLeft, top: updatedContTop });
        }
    });

};

// Make hide function available globally
window.hideScoreBar = function() {
  var container = window.scoreBarContainer;
  if (container) {
    container.style.opacity = '0';
    setTimeout(function() {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        window.scoreBarContainer = null; // Clean up
      }
    }, 750);
  }
}; 