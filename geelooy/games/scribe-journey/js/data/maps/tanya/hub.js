
// B"H
// js/data/maps/tanya/hub.js

export const tanyaHubMaps = {
    'tanya_entrance': {
        width: 15,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜🌫️⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🌑⬜⬜⬜🌫️⬜⬜⬜☀️⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uef01', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'to_animal_soul': { type: 'door', uu: '\uef06', visual: '🌑', emoji: '🌑', x: 2, y: 4, targetMap: 'left_ventricle_1', targetX: 1, targetY: 4 },
            'to_godly_soul': { type: 'door', uu: '\uef08', visual: '☀️', emoji: '☀️', x: 10, y: 4, targetMap: 'right_ventricle_1', targetX: 1, targetY: 4 },
            'alter_rebbe': { 
                type: 'npc', uu: '\uef03', visual: '📖', emoji: '📖', x: 2, y: 2, questGiver: 'tanya_1_beinoni',
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
                type: 'npc', uu: '\uef05', visual: '🧘', emoji: '🧘', x: 10, y: 2, 
                dialogue: { 
                    start: ["(A place of Hitbonenut - Meditation. Press ACTION to clear your mind.)", {action: 'meditate'}] 
                } 
            },
            'upper_exit': { type: 'door', uu: '\uef02', visual: '🚪', emoji: '🚪', x: 13, y: 1, targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'balance_scale': { type: 'npc', uu: '\uef04', visual: '⚖️', emoji: '⚖️', x: 6, y: 2, dialogue: { start: ["The Beinoni is not measured by fantasy identity, but by exact action."] } },
            'animal_soul_lower': { type: 'door', uu: '\uef07', visual: '🌑', emoji: '🌑', x: 2, y: 6, targetMap: 'left_ventricle_1', targetX: 1, targetY: 4 },
            'godly_soul_lower': { type: 'door', uu: '\uef09', visual: '☀️', emoji: '☀️', x: 10, y: 6, targetMap: 'right_ventricle_1', targetX: 1, targetY: 4 },
            'to_inner_tanya': { type: 'door', uu: '\uef0a', visual: '🚪', emoji: '🚪', x: 6, y: 8, targetMap: 'left_ventricle_1', targetX: 1, targetY: 4 }
        }
    }
};
