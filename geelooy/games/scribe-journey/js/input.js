// B"H
// js/input.js

export function initInput(sendToWorker) {
    const keyState = {};

    document.addEventListener('keydown', (e) => {
        if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
        }

        // Add Spacebar functionality for confirmation actions.
        if (e.key === ' ') {
            sendToWorker('input', { type: 'press', key: 'Confirm' });
            return; // Prevent spacebar from being treated as a movement key
        }

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
        button.addEventListener('mousedown', handlePress);
        button.addEventListener('mouseup', handleRelease);
        button.addEventListener('mouseleave', handleRelease);
    };

    setupMobileButton('control-up', 'ArrowUp');
    setupMobileButton('control-down', 'ArrowDown');
    setupMobileButton('control-left', 'ArrowLeft');
    setupMobileButton('control-right', 'ArrowRight');

    const actionButton = document.getElementById('action-button');
    if (actionButton) {
        const handleActionPress = (e) => {
            e.preventDefault();
            actionButton.classList.add('active');
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