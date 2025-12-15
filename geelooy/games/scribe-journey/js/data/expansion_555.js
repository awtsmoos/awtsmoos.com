
// B"H
// js/data/expansion_555.js

// --- THE 555 GATES OF WISDOM ---
// A procedural expansion adding 555 collectible sparks and challenges.

export const features555Items = {};
export const features555Beasts = {};
export const features555Maps = {};

const sparkTypes = ["Chochmah", "Binah", "Daat", "Chesed", "Gevurah", "Tiferet", "Netzach", "Hod", "Yesod", "Malkuth"];
const sparkAdjectives = ["Glimmering", "Hidden", "Ancient", "Lost", "Redeemed", "Silent", "Singing", "Burning"];

// 1. Generate 555 "Sparks of Wisdom" (Items)
for (let i = 1; i <= 555; i++) {
    const id = `wisdom_spark_${i}`;
    const type = sparkTypes[i % sparkTypes.length];
    const adj = sparkAdjectives[i % sparkAdjectives.length];
    
    features555Items[id] = {
        id: id,
        name: `${adj} Spark of ${type} #${i}`,
        desc: `A fragment of divine wisdom #${i}. Collecting these refines the soul.`,
        type: 'consumable', 
        effect: { stat: 'xp', amount: 10 + (i % 50) },
        sellValue: i * 2,
        rarity: i % 100 === 0 ? 'holy' : 'common'
    };
}

// 2. Generate 555 "Shells of Ego" (Beasts)
// We don't want 555 unique sprites, but 555 variations of stats/names.
const shellPrefixes = ["Husk", "Shell", "Barrier", "Veil", "Curtain", "Stone", "Block", "Wall"];
const shellEmojis = ['🌑', '🪨', '🧱', '🕸️', '🌫️'];

for (let i = 1; i <= 555; i++) {
    const id = `ego_shell_${i}`;
    const prefix = shellPrefixes[i % shellPrefixes.length];
    
    features555Beasts[id] = {
        name: `${prefix} of Ego #${i}`,
        emoji: shellEmojis[i % shellEmojis.length],
        type: 'Kelipah',
        baseStats: {
            hp: 50 + (i * 2),
            attack: 10 + Math.floor(i / 5),
            defense: 10 + Math.floor(i / 5),
            diligence: i
        },
        moves: ['Harden', 'Collapse'],
        xpYield: 10 + i,
        moneyYield: { perutah: i }
    };
}

// 3. Generate "The Hall of 555" (Map)
// A single, massive corridor of 555 tiles length would be boring.
// Let's make it a dense grid of 24x24 (approx 576 tiles) where almost every tile has something.

const WIDTH = 25;
const HEIGHT = 25;
let baseString = '';
const interactables = {};
const encounters = { '🌫️': [] };

let placedCount = 0;

for (let y = 0; y < HEIGHT; y++) {
    let row = '';
    for (let x = 0; x < WIDTH; x++) {
        if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
            row += '🧱';
        } else if (placedCount < 555) {
            placedCount++;
            // 20% chance for item, 10% chance for specific mob interaction, rest is floor with random encounters
            const rand = Math.random();
            
            if (rand < 0.05) {
                // Item Pickup
                row += '✨';
                interactables[`${x},${y}`] = {
                    type: 'npc', emoji: '✨', pickup: `wisdom_spark_${placedCount}`
                };
            } else if (rand < 0.1) {
                // Specific Mob Battle (Static)
                row += '👹';
                interactables[`${x},${y}`] = {
                    type: 'npc', emoji: '👹', 
                    dialogue: { start: [`I am Shell #${placedCount}. You shall not pass!`, {startBattle: [{id: `ego_shell_${placedCount}`, level: 20 + Math.floor(placedCount/10)}]}] }
                };
            } else {
                row += '🌫️'; // Foggy floor with encounters
            }
        } else {
            row += '⬜';
        }
    }
    baseString += row.trim() + '\n';
}

// Populate Random Encounters for the Fog
for(let i=1; i<=55; i++) { // Sample 55 of them for random encounters
    encounters['🌫️'].push({ id: `ego_shell_${i*10}`, levelRange: [20, 60], chance: 0.02 });
}

// Exits
interactables[`${Math.floor(WIDTH/2)},${HEIGHT-2}`] = { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 12, targetY: 12 };

features555Maps['hall_of_555'] = {
    width: WIDTH,
    baseLayerString: baseString,
    encounters: encounters,
    interactables: interactables,
    isExtreme: true // Reuse extreme rendering for cool effect
};
