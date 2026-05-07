
/**
 * B"H
 * @module PhilosopherDialogue
 */
export const Philosophers = {
    'PHILOSOPHER_MAIN': {
        'START': {
            lines: ["You rely on faith, but I rely on logic!", "Explain the void."],
            options: [
                { label: "Let us debate!", next: 'END', action: 'BATTLE' },
                { label: "Silence is higher.", next: 'END' }
            ]
        }
    }
};
