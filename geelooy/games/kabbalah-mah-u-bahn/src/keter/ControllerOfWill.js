
/**
 * B"H
 * ControllerOfWill: The nexus of intention.
 * Channels keyboard (Space, Arrow Keys) and physical touch vectors into the Seder.
 */
export const Intents = { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0, START: 0, SEL: 0 };
export const PreviousIntents = { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0, START: 0, SEL: 0 };

const InputRegistry = {
    'ArrowUp': 'U', 'w': 'U', 'W': 'U',
    'ArrowDown': 'D', 's': 'D', 'S': 'D',
    'ArrowLeft': 'L', 'a': 'L', 'A': 'L',
    'ArrowRight': 'R', 'd': 'R', 'D': 'R',
    'z': 'A', 'Enter': 'A', ' ': 'A',
    'x': 'B', 'Shift': 'B'
};

export class ControllerOfWill {
    /** Connects the soul to the physical button objects in Malchut. */
    static bindPhysicalAnchors() {
        window.addEventListener('keydown', (e) => {
            const mapped = InputRegistry[e.key];
            if (mapped) { e.preventDefault(); Intents[mapped] = 1; }
        }, { passive: false });

        window.addEventListener('keyup', (e) => {
            const mapped = InputRegistry[e.key];
            if (mapped) { e.preventDefault(); Intents[mapped] = 0; }
        }, { passive: false });

        // Physical Touch bindings for Gamepad IDs
        document.querySelectorAll('.ctrl-sig').forEach(node => {
            const sig = node.getAttribute('data-sig');
            if (!sig) return;
            const down = (e) => { e.preventDefault(); Intents[sig] = 1; };
            const up = (e) => { e.preventDefault(); Intents[sig] = 0; };
            node.addEventListener('pointerdown', down);
            node.addEventListener('pointerup', up);
            node.addEventListener('pointerleave', up);
            node.addEventListener('pointercancel', up);
        });
    }

    /** Seals current frame intents into history, allowing pulse calculation. */
    static commitWill() {
        Object.keys(Intents).forEach(k => PreviousIntents[k] = Intents[k]);
    }

    /** Validates a fresh arousal of will (Rising light from below). */
    static isFreshAwakening(btn) {
        return Intents[btn] === 1 && PreviousIntents[btn] === 0;
    }

    /** 
     * The Missing Function: consumeIntent.
     * Performs a 'Tikun' (Fixing) by clearing the pulse after use, 
     * preventing multiple actions in one state dimension.
     */
    static consumeIntent(btn) {
        Intents[btn] = 0;
        PreviousIntents[btn] = 1;
    }
}
