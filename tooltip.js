// Tooltip implementation for Storyline
let followBox = null;
let followUpdater = null;

// Function to initialize tooltip
window.initializeTooltip = function() {
    // Only initialize if challenge mode is on
    const player = GetPlayer();
    if (!player || !player.GetVar('Challenge_mode')) {
        console.log("Challenge mode is off, not initializing tooltip");
        return;
    }

    console.log("Initializing tooltip...");
    
    // Create floating box if it doesn't exist
    if (!followBox) {
        followBox = document.createElement("div");
        followBox.id = "followBox";
        Object.assign(followBox.style, {
            position: "absolute",
            pointerEvents: "none",
            padding: "8px 12px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            fontSize: "20px",
            fontFamily: "'Fira Sans', sans-serif",
            borderRadius: "4px",
            zIndex: "9999",
            display: "none" // Start hidden
        });
        document.body.appendChild(followBox);
    }

    // State variables
    let lastResult = "";
    let lastCombined = "";
    let isOverriding = false;

    // Helper to show feedback (with icon) for exactly 2 seconds
    function showTemporaryFeedback({ text, backgroundColor, textColor }) {
        isOverriding = true;
        followBox.innerText = text;
        followBox.style.background = backgroundColor;
        followBox.style.color = textColor;

        // After 2 seconds, clear override and restore instruction text:
        setTimeout(() => {
            isOverriding = false;
            // Re-fetch the latest instruction/empty variables
            const updatedInstr = player.GetVar("Challenge_instr") || "";
            const updatedEmpty = player.GetVar("Challenge_empty") || "";
            const combined = `${updatedInstr} ${updatedEmpty}`.trim();
            followBox.innerText = combined;
            followBox.style.background = "rgba(0, 0, 0, 0.7)";
            followBox.style.color = "white";
            lastCombined = combined;
        }, 2000);
    }

    // Show the tooltip
    followBox.style.display = "block";

    // Track mouse to move the box
    document.addEventListener("mousemove", function(e) {
        if (followBox && followBox.style.display === "block") {
            followBox.style.left = (e.clientX + 15) + "px";
            followBox.style.top = (e.clientY + 15) + "px";
        }
    });

    // Main updater (runs every 200ms)
    if (followUpdater) {
        clearInterval(followUpdater);
    }

    followUpdater = setInterval(() => {
        if (!followBox || followBox.style.display !== "block") return;

        const helpLanguage = player.GetVar("helpLanguage") || ""; // Help language setting
        const targetLanguage = player.GetVar("Target_Language") || ""; // Target language setting
        
        // Get the instruction text in the appropriate language
        const instr = player.GetVar("Challenge_instr") || "";
        const feedback = player.GetVar("Challenge_feedback") || "";
        const feedback2 = player.GetVar("Challenge_feedback_2") || "";
        const empty = player.GetVar("Challenge_empty") || "";
        const result = player.GetVar("Challenge_result") || ""; // "correct" / "incorrect"
        const attempts = player.GetVar("Challenge_attempts"); // numeric attempts count

        // If any required variable is missing, try to initialize them
        if (!instr || !feedback || !feedback2) {
            // Call the text handler to ensure variables are set
            if (typeof window.text_handler === 'function') {
                window.text_handler();
            }
            if (typeof window.translation_handler === 'function') {
                window.translation_handler();
            }
            // Don't return here, let it try to display what it has
        }
        
        // The variables should already contain the text in the correct language
        // based on whether helpLanguage is defined or not
        const combined = `${instr} ${empty}`.trim();

        // 1) Correct case (only when transitioning from non-correct → correct)
        if (result === "correct" && lastResult !== "correct") {
            // Build "✓ Correct!" (✓ inherits the color we set below)
            const correctText = `✓ ${feedback}`;
            showTemporaryFeedback({
                text: correctText,
                backgroundColor: "green",
                textColor: "white"
            });
        }
        // 2) First incorrect (attempts === 1, transitioning into incorrect)
        else if (result === "incorrect" && lastResult !== "incorrect" && attempts === 1) {
            // Build "✕ Incorrect" (✕ inherits the color we set below)
            const incorrectText = `✕ ${feedback2}`;
            showTemporaryFeedback({
                text: incorrectText,
                backgroundColor: "orange",
                textColor: "black"
            });
        }
        // 3) Second incorrect (attempts === 0, transitioning into incorrect again)
        else if (result === "incorrect" && lastResult !== "incorrect" && attempts === 0) {
            const incorrectText = `✕ ${feedback2}`;
            showTemporaryFeedback({
                text: incorrectText,
                backgroundColor: "red",
                textColor: "white"
            });
        }

        // 4) Default: if not currently showing a temporary feedback override, update instruction text
        if (!isOverriding && combined !== lastCombined) {
            followBox.innerText = combined;
            followBox.style.background = "rgba(0, 0, 0, 0.7)";
            followBox.style.color = "white";
            lastCombined = combined;
        }

        lastResult = result;
    }, 200);
};

// Function to hide tooltip
window.hideTooltip = function() {
    if (followBox) {
        followBox.style.display = "none";
    }
    if (followUpdater) {
        clearInterval(followUpdater);
        followUpdater = null;
    }
}; 