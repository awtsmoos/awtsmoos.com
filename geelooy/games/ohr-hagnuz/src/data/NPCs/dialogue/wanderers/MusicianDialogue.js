
/**
 * B"H
 * @module MusicianDialogue
 */
export const MusicianDialogue = {
    'START': {
        lines: [
            "🎵 Ai yai yai, da di da... 🎵", 
            "A word is worth a coin, but a song is worth a world.",
            "Words reach the mind, but a Niggun bypasses logic and strikes the soul directly."
        ],
        options: [
            { label: "Sing with me! (Debate)", next: 'END', action: 'BATTLE' },
            { label: "Beautiful.", next: 'END' }
        ]
    }
};
