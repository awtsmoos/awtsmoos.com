
/**
 * B"H
 * @module SageAleph
 * @description The dialogue tree for the Sage of the First Sector.
 */
export const SageAleph = {
    'START': {
        lines: [
            "B\"H - Welcome to the Orchard (Pardes).", 
            "I see you have begun the descent into the physical grid.",
            "Do not be fooled. Every pixel is spoken into existence by the Awtsmoos."
        ],
        options: [
            { label: "How do I gather light?", next: 'TEACH' },
            { label: "Challenge my Logic!", next: 'END', action: 'BATTLE' }
        ]
    },
    'TEACH': {
        lines: [
            "In the tall grass, the vessels are broken. Sparks of holiness are trapped.",
            "When a Klipah confronts you, select DEBATE.",
            "Choose a Sefarim from your BAG, and strike their logic with Divine Truth!",
            "As you gather sparks, your Level will increase, expanding your vessel's capacity for light."
        ],
        options: [{ label: "I will elevate the sparks.", next: 'END' }]
    }
};
