
/**
 * B"H
 * @module MelamedTrainer
 */
export const MelamedTrainer = {
    'START': {
        lines: [
            "B\"H. Listen closely, student. The world is built on four elements.", 
            "Pshat is Earth, Remez is Water, Drush is Fire, and Sod is Air.",
            "Water extinguishes Fire. Fire consumes Earth. Earth absorbs Water. Air touches all."
        ],
        options: [
            { label: "How do I capture a spark?", next: 'TEACH_CATCH' },
            { label: "Thank you, Rabbi.", next: 'END' }
        ]
    },
    'TEACH_CATCH': {
        lines: [
            "Not every Klipah must be shattered completely.",
            "If you weaken them (lower their HP) without destroying them, you can select REDEEM.",
            "Neutral sparks (Klipat Nogah) like beasts are easier to redeem than pure Klipot."
        ],
        options: [{ label: "I will redeem them.", next: 'END' }]
    }
};
