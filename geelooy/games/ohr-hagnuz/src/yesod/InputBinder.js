
/**
 * B"H
 * @class InputBinder
 * @chapter The Connection of Will
 * @description
 * Bridges the gap between the mortal user and the digital simulation. 
 * "And his hands were faithful" (Exodus 17:12).
 */
export class InputBinder {
    /**
     * @description Attaches listeners to the window to capture the pulse of intent.
     */
    static bind() {
        const keyMap = {
            'ArrowUp': 'U', 'w': 'U',
            'ArrowDown': 'D', 's': 'D',
            'ArrowLeft': 'L', 'a': 'L',
            'ArrowRight': 'R', 'd': 'R',
            'z': 'A', 'Enter': 'A', ' ': 'A',
            'x': 'B', 'Shift': 'B'
        };

        window.addEventListener('keydown', (e) => {
            const intent = keyMap[e.key];
            if (intent) {
                window.AwtsmoosIntents[intent] = 1;
                // Prevent scrolling
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const intent = keyMap[e.key];
            if (intent) {
                window.AwtsmoosIntents[intent] = 0;
            }
        });

        console.log("B\"H - Intentions are now bound to the physical keys.");
    }
}
