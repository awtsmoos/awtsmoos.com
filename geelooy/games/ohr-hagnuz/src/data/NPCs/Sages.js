
/**
 * B"H
 * @module SagesDialogue
 */
export const Sages = {
    'SAGE_ALEPH': {
        'START': {
            lines: ["B\"H - Welcome to the Orchard.", "The physical world is but a garment."],
            options: [
                { label: "Teach me.", next: 'TEACH' },
                { label: "I am ready to debate!", next: 'END', action: 'BATTLE' }
            ]
        },
        'TEACH': {
            lines: ["The letters of creation are everywhere.", "Search the tall grass."],
            options: [{ label: "I will.", next: 'END' }]
        }
    }
};
