// B"H
// js/input.js

export function initInput(sendToWorker) {
    const keyState = {};

    // --- Keyboard Input ---

    document.addEventListener('keydown', (e) => {
        // Prevent default browser actions for game keys (scrolling, etc.)
        if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
        }

        // For continuous actions (movement), we track the state of the key being held down.
        // We only send an update if the state changes to avoid spamming the worker.
        if (!keyState[e.key]) {
            keyState[e.key] = true;
            sendToWorker('input', { type: 'keyState', keys: keyState });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keyState[e.key]) {
            delete keyState[e.key];
            sendToWorker('input', { type: 'keyState', keys: keyState });
        }
    });
    
    // --- Mobile Touch Input ---

    /**
     * A helper function to set up event listeners for a mobile control button.
     * @param {string} elementId - The ID of the button element.
     * @param {string} key - The keyboard key this button should emulate (e.g., 'ArrowUp').
     */
    const setupMobileButton = (elementId, key) => {
        const button = document.getElementById(elementId);
        if (!button) {
            console.warn(`Mobile control button with ID '${elementId}' not found.`);
            return;
        }

        const handlePress = (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (!keyState[key]) {
                keyState[key] = true;
                sendToWorker('input', { type: 'keyState', keys: keyState });
            }
        };

        const handleRelease = (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (keyState[key]) {
                delete keyState[key];
                sendToWorker('input', { type: 'keyState', keys: keyState });
            }
        };

        button.addEventListener('touchstart', handlePress, { passive: false });
        button.addEventListener('touchend', handleRelease, { passive: false });
        // Add mouse events for easier desktop testing of mobile controls
        button.addEventListener('mousedown', handlePress);
        button.addEventListener('mouseup', handleRelease);
        button.addEventListener('mouseleave', handleRelease);
    };

    // Map mobile D-Pad buttons to keyboard arrow keys
    setupMobileButton('control-up', 'ArrowUp');
    setupMobileButton('control-down', 'ArrowDown');
    setupMobileButton('control-left', 'ArrowLeft');
    setupMobileButton('control-right', 'ArrowRight');

    // The Action button is a special case. It's not a continuous press, it's a single event.
    const actionButton = document.getElementById('action-button');
    if (actionButton) {
        const handleActionPress = (e) => {
            e.preventDefault();
            actionButton.classList.add('active');
            // Send a discrete 'press' event for interaction/confirmation
            sendToWorker('input', { type: 'press', key: 'Confirm' }); 
        };
        const handleActionRelease = (e) => {
            e.preventDefault();
            actionButton.classList.remove('active');
        };

        actionButton.addEventListener('touchstart', handleActionPress, { passive: false });
        actionButton.addEventListener('touchend', handleActionRelease, { passive: false });
        actionButton.addEventListener('mousedown', handleActionPress);
        actionButton.addEventListener('mouseup', handleActionRelease);
    }
}