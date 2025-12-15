
// B"H
// js/data/maps/maamar_5715_expansion.js

export const maamarMaps = {};

// =============================================================================
// WING 1: MATBEA (THE MINT OF NATURE) - Levels 1-18
// Concept: Nature is a coin stamped by the King. Repetitive, mechanical, metallic.
// =============================================================================
const matbeaLayouts = [
    `🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`, `🧱💰⚙️💰⚙️💰⚙️🧱`, `🧱⚙️⬜⬜⬜⬜⚙️🧱`, `🧱💰⬜🤖⬜💰⬜🧱`, `🧱⚙️⬜⬜⬜⬜⚙️🧱`, `🧱💰⚙️💰⚙️💰⚙️🧱`, `🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`, // 1
    `🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`, `🧱⚙️⚙️⚙️⚙️⚙️⚙️🧱`, `🧱💰⬜⬜⬜⬜💰🧱`, `🧱💰⬜🪙⬜⬜💰🧱`, `🧱💰⬜⬜⬜⬜💰🧱`, `🧱⚙️⚙️⚙️⚙️⚙️⚙️🧱`, `🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`, // 2
    // ... Patterns vary to represent the complexity of nature ...
];

for (let i = 1; i <= 18; i++) {
    const id = `matbea_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `matbea_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `matbea_${i + 1}`; // Loop back or end
    
    maamarMaps[id] = {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜💰⬜⬜🤖⬜⬜💰⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜🪙⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `, // Simplified representation for code brevity, logic ensures distinct links
        encounters: {
            '⬜': [
                { id: 'automaton_guard', levelRange: [30 + i, 35 + i], chance: 0.3 },
                { id: 'teva_mask', levelRange: [32 + i, 38 + i], chance: 0.2 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: i === 1 ? 10 : 1, targetY: i === 1 ? 5 : 5, x: 1, y: 4 },
            'next': { type: 'door', emoji: '🚪', targetMap: next, targetX: 1, targetY: 4, x: 13, y: 4 },
            'sign': { type: 'npc', emoji: '🪙', dialogue: { start: [`(Minting Chamber ${i}: The stamp of the King is upon all things here.)`] }, x: 7, y: 4 }
        }
    };
    
    // Manual overrides for specific floors to ensure unique layout logic
    if (i % 5 === 0) {
        maamarMaps[id].baseLayerString = `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱💰💰💰💰💰💰💰💰💰💰💰💰💰🧱
🧱💰⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💰🧱
🧱💰⬜⚙️⬜⚙️⬜⚙️⬜⚙️⬜⚙️⬜💰🧱
🧱💰⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💰🧱
🧱💰💰💰💰💰💰💰💰💰💰💰💰💰🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `;
    }
}

// =============================================================================
// WING 2: TVIA (THE SUBMERSION) - Levels 1-18
// Concept: Godliness is water covering the creation. Hidden, blue, fluid.
// =============================================================================
for (let i = 1; i <= 18; i++) {
    const id = `tvia_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `tvia_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `tvia_${i + 1}`;
    
    maamarMaps[id] = {
        width: 15,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊🐟⬜🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜🐟🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊🌊🌊⬜🌊🌊🌊🐙🌊🌊🌊⬜🌊🌊🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊🐟⬜🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜🐟🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        encounters: {
            '⬜': [
                { id: 'benevolent_stream', levelRange: [40 + i, 45 + i], chance: 0.4 },
                { id: 'drawn_water_elemental', levelRange: [42 + i, 48 + i], chance: 0.3 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: i === 1 ? 2 : 1, targetY: i === 1 ? 3 : 3, x: 1, y: 3 },
            'next': { type: 'door', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 },
            'marker': { type: 'npc', emoji: '🐙', dialogue: { start: [`(Depth Level ${i}. The waters of Daat cover you completely.)`] }, x: 7, y: 3 }
        }
    };
}

// =============================================================================
// WING 3: DIBBUR (THE WORKSHOP OF SPEECH) - Levels 1-18
// Concept: Creation of Matter (Yesh) via Speech. Letters, bricks, separation.
// =============================================================================
for (let i = 1; i <= 18; i++) {
    const id = `dibbur_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `dibbur_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `dibbur_${i + 1}`;

    maamarMaps[id] = {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🧱
🧱🗣️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🗣️🧱
🧱🗣️⬜🔤⬜⬜⬜📜⬜⬜⬜🔤⬜🗣️🧱
🧱🗣️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🗣️🧱
🧱🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [
                { id: 'silent_syllogism', levelRange: [50 + i, 55 + i], chance: 0.4 },
                { id: 'obsidian_golem', levelRange: [52 + i, 58 + i], chance: 0.3 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: i === 1 ? 17 : 1, targetY: i === 1 ? 6 : 3, x: 1, y: 3 },
            'next': { type: 'door', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 },
            'letter': { type: 'npc', emoji: '🔤', dialogue: { start: [`(Chamber of Speech ${i}. The letters separate and create boundaries.)`] }, x: 3, y: 3 }
        }
    };
}

// =============================================================================
// WING 4: RATZON (THE PALACE OF WILL) - Levels 1-18
// Concept: Creation of Form via Will. Nullification, Crown, Unity.
// =============================================================================
for (let i = 1; i <= 18; i++) {
    const id = `ratzon_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `ratzon_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `ratzon_${i + 1}`;

    maamarMaps[id] = {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜👑⬜⬜⬜✨⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜👑⬜⬜⬜✨⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        encounters: {
            '⬜': [
                { id: 'crown_of_will', levelRange: [60 + i, 65 + i], chance: 0.3 },
                { id: 'infinite_light', levelRange: [65 + i, 70 + i], chance: 0.2 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: i === 1 ? 8 : 1, targetY: i === 1 ? 2 : 3, x: 1, y: 3 },
            'next': { type: 'door', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 },
            'crown': { type: 'npc', emoji: '👑', dialogue: { start: [`(Will Chamber ${i}. Here, there is no separation, only the desire of the King.)`] }, x: 7, y: 2 }
        }
    };
}
