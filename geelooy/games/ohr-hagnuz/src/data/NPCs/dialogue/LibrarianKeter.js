
/**
 * B"H
 * @module LibrarianKeter
 * @description The dialogue tree for the Keeper of Sefarim.
 */
export const LibrarianKeter = {
    'START': {
        lines: [
            "B\"H. Ah, a seeker of the hidden wisdom.", 
            "The books in this room are mere physical representations.",
            "The true Torah is written in black fire upon white fire."
        ],
        options: [
            { label: "How do I read them?", next: 'GIVE' },
            { label: "I must go.", next: 'END' }
        ]
    },
    'GIVE': {
        lines: [
            "Wisdom is not given; it is earned by elevating sparks.", 
            "Defeat the Klipot in the tall grass to expand your vessel.",
            "Press 'I' at any time to open your Sacred Library."
        ],
        options: [{ label: "Understood.", next: 'END' }]
    }
};
