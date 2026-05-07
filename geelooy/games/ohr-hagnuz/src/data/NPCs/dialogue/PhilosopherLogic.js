
/**
 * B"H
 * @module PhilosopherLogic
 * @description The dialogue for the secular challenger in House Beis.
 */
export const PhilosopherLogic = {
    'START': {
        lines: [
            "You rely on Faith, but I rely on Measurement!", 
            "If the Infinite encompasses all, how can there be a finite universe?",
            "Your 'Tzimtzum' (Contraction) is a logical paradox!"
        ],
        options: [
            { label: "The Paradox is the Truth! (Debate)", next: 'END', action: 'BATTLE' },
            { label: "Silence is higher than logic.", next: 'END' }
        ]
    }
};
