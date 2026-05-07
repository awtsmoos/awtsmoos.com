
/**
 * B"H
 * @module MysticDialogue
 */
export const MysticDialogue = {
    'START': {
        lines: [
            "B\"H. The light you see with your eyes is but a shadow.", 
            "The True Light (Ohr HaGnuz) is hidden for the righteous in the world to come.",
            "But through the study of Chassidus, you can taste it now."
        ],
        options: [
            { label: "Reveal the light to me! (Debate)", next: 'END', action: 'BATTLE' },
            { label: "I will study.", next: 'END' }
        ]
    }
};
