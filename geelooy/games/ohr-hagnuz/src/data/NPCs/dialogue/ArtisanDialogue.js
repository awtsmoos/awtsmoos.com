
/**
 * B"H
 * @module ArtisanDialogue
 */
export const ArtisanDialogue = {
    'START': {
        lines: [
            "B\"H. I am shaping the physical vessels of Asiyah.", 
            "If the vessel is too small, the light shatters it.",
            "Gather more sparks to expand your capacity!"
        ],
        options: [
            { label: "My vessel is strong!", next: 'TEST' },
            { label: "I will gather more.", next: 'END' }
        ]
    },
    'TEST': {
        lines: ["We shall see if your structure holds..."],
        options: [{ label: "Begin! (Debate)", next: 'END', action: 'BATTLE' }]
    }
};
