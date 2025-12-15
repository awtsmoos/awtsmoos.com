
// B"H
// js/data/chanukah_massive.js

// --- THE REVOLT OF THE 677 ---
// Procedurally generating 677 distinct idols to smash and oil drops to collect.

export const chanukahItems = {};
export const chanukahBeasts = {};
export const chanukahMaps = {};

const greekNames = ["Antiochus", "Lysias", "Nicanor", "Gorgias", "Bacchides", "Heliodorus", "Jason", "Menelaus"];
const idolTypes = ["Zeus", "Apollo", "Hermes", "Hercules", "Athena", "Ares", "Poseidon", "Hades"];

// 1. Generate 677 "Fragments of Impurity" (Items)
for (let i = 1; i <= 677; i++) {
    const id = `idol_fragment_${i}`;
    chanukahItems[id] = {
        id: id,
        name: `Shard of Idol #${i}`,
        desc: `Remains of a smashed idol. Evidence of zealotry.`,
        type: 'material',
        sellValue: 1
    };
}

// 2. Generate "The Hall of 677 Idols" (Map)
// A massive grid where every other tile is an enemy or a statue.
const WIDTH = 40; 
const HEIGHT = 40; // 1600 tiles, plenty of room for 677 idols.

let baseString = '';
const interactables = {};
const encounters = { '🏛️': [] };

let placedCount = 0;

for (let y = 0; y < HEIGHT; y++) {
    let row = '';
    for (let x = 0; x < WIDTH; x++) {
        if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
            row += '🧱';
        } else if (placedCount < 677 && (x % 2 !== 0 && y % 2 !== 0)) {
            // Place an IDOL
            row += '🗿';
            placedCount++;
            interactables[`${x},${y}`] = {
                type: 'npc',
                emoji: '🗿',
                dialogue: {
                    start: [
                        `You stand before Idol #${placedCount}. It blocks the light.`,
                        { text: "Smash it!", action: "smash_idol", value: placedCount }
                    ]
                }
            };
        } else if (Math.random() < 0.1) {
            row += '🏛️'; // Hellenist encounter tile
        } else {
            row += '⬜';
        }
    }
    baseString += row.trim() + '\n';
}

// Add exit
interactables[`${Math.floor(WIDTH/2)},${HEIGHT-2}`] = { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 10 };

// 3. Generate Enemies
greekNames.forEach(name => {
    const id = `hellenist_${name.toLowerCase()}`;
    chanukahBeasts[id] = {
        name: `General ${name}`,
        emoji: '🗡️',
        type: 'Qliphoth',
        baseStats: { hp: 200, attack: 40, defense: 30, diligence: 20 },
        moves: ['Pummel', 'Iron_Grip'],
        xpYield: 150,
        moneyYield: { perutah: 50 }
    };
    encounters['🏛️'].push({ id, levelRange: [20, 50], chance: 0.1 });
});

chanukahMaps['hall_of_idols'] = {
    width: WIDTH,
    baseLayerString: baseString,
    encounters: encounters,
    interactables: interactables
};

// 4. Special Items
chanukahItems['golden_dreidel'] = {
    id: 'golden_dreidel',
    name: 'Golden Dreidel',
    desc: 'A spinning top of destiny. Use to play.',
    type: 'consumable', // Or key item with 'use'
    effect: { type: 'play_dreidel' },
    sellValue: 500
};

chanukahItems['hammer_maccabee'] = {
    id: 'hammer_maccabee',
    name: 'Hammer of the Maccabees',
    desc: 'The legendary weapon. Teaches "Maccabee Smash".',
    type: 'tome', // It teaches a move when used/equipped, simplifying to 'tome' logic for now
    moveId: 'Maccabee_Smash',
    sellValue: 5000,
    rarity: 'holy'
};
