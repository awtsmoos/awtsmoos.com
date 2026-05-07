
/**
 * B"H
 * @module Trainers
 */
export const Trainers = {
    'TRAINER_ELDER': {
        'START': {
            lines: ["B\"H. I am a gatherer of Sparks.", "Do you wish to sharpen your arguments?"],
            options: [
                { label: "Train with me! (Battle)", next: 'END', action: 'BATTLE' },
                { label: "Check my level.", next: 'CHECK_LVL' },
                { label: "Farewell.", next: 'END' }
            ]
        },
        'CHECK_LVL': {
            lines: ["Your spiritual stature is reaching new heights.", "Keep gathering sparks from the tall grass."],
            options: [{ label: "I will.", next: 'END' }]
        }
    }
};
