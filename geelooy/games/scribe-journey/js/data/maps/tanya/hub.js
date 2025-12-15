
// B"H
// js/data/maps/tanya/hub.js

export const tanyaHubMaps = {
    'tanya_entrance': {
        width: 15,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🌫️
🌫️⬜📖⬜⬜⬜⚖️⬜⬜⬜🧘⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🌑⬜⬜⬜🌫️⬜⬜⬜☀️⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🌑⬜⬜⬜🌫️⬜⬜⬜☀️⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🚪🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'to_animal_soul': { type: 'door', emoji: '🌑', targetMap: 'left_ventricle_1', targetX: 1, targetY: 4 },
            'to_godly_soul': { type: 'door', emoji: '☀️', targetMap: 'right_ventricle_1', targetX: 1, targetY: 4 },
            'alter_rebbe': { 
                type: 'npc', emoji: '📖', questGiver: 'tanya_1_beinoni',
                dialogue: { 
                    start: [
                        "I have compiled this 'Likutei Amarim' for those who struggle.", 
                        "You are likely not a Tzaddik (perfect), nor are you a Rasha (wicked). You are a Beinoni.",
                        "Your task is the Battle of the Mind. Go to the Left Ventricle of the heart, where the Animal Soul resides, and subdue it."
                    ],
                    in_progress: ["Do not be depressed by the struggle. Sadness prevents victory. Meditate on the Unity of Hashem."],
                    completed: ["You have attained the rank of Beinoni. You are Master of your Actions, if not your Essence."]
                } 
            },
            'meditation_mat': { 
                type: 'npc', emoji: '🧘', 
                dialogue: { 
                    start: ["(A place of Hitbonenut - Meditation. Press ACTION to clear your mind.)", {action: 'meditate'}] 
                } 
            }
        }
    }
};
