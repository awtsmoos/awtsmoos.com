
// B"H
// js/data/labyrinth_67.js

// --- THE LABYRINTH OF 67 ---
// A procedurally generated descent into extreme holiness and madness.
// 67 Floors. 67 Guardians. 67 Artifacts.

export const labyrinthItems = {};
export const labyrinthBeasts = {};
export const labyrinthMaps = {};

const adjectives = ["Burning", "Frozen", "Silent", "Screaming", "Infinite", "Broken", "Absolute", "Hidden", "Radiant", "Dark", "Twisted", "Holy", "Ancient", "Neon", "Hyper"];
const nouns = ["Truth", "Lie", "Crown", "Void", "Spark", "Ego", "Will", "Terror", "Love", "Law", "Chaos", "Order", "Light", "Shadow", "Glitch"];
const emojis = ['🌀', '👾', '🔥', '❄️', '⚡', '👁️', '🎲', '💀', '👽', '🤖', '🎃', '👺', '👻', '🐲', '🌵'];

// Generate 67 Layers
for (let i = 1; i <= 67; i++) {
    // 1. Artifacts
    const itemId = `artifact_67_${i}`;
    const itemName = `${adjectives[i % adjectives.length]} ${nouns[(i * 3) % nouns.length]} #${i}`;
    labyrinthItems[itemId] = {
        id: itemId,
        name: itemName,
        desc: `Artifact ${i}/67. It vibrates with extreme energy.`,
        type: 'artifact',
        effect: { stat: 'random_stat', amount: i }, 
        sellValue: i * 100,
        rarity: i > 50 ? 'holy' : 'rare'
    };

    // 2. Guardians
    const beastId = `guardian_67_${i}`;
    const beastName = `Guardian of Gate ${i}`;
    const beastEmoji = emojis[i % emojis.length];
    labyrinthBeasts[beastId] = {
        name: beastName,
        emoji: beastEmoji,
        type: i % 2 === 0 ? 'Qliphoth' : 'Keter',
        baseStats: {
            hp: 100 + (i * 50), // HP scales massively: Floor 67 = 3450 HP
            attack: 20 + (i * 5),
            defense: 10 + (i * 3),
            diligence: i * 4
        },
        moves: ['Collapse', 'Gevurah_Rebuke', 'Whisper_Negation'],
        xpYield: 100 * i,
        moneyYield: { perutah: 67 * i }
    };

    // 3. Maps
    const mapId = `labyrinth_${i}`;
    const prev = i === 1 ? 'malkuth_village' : `labyrinth_${i - 1}`;
    const next = i === 67 ? 'malkuth_village' : `labyrinth_${i + 1}`;
    
    // Generate a chaotic grid
    const width = 15 + (i % 10);
    const height = 15 + (i % 10);
    const wall = i > 30 ? '🌫️' : '🧱';
    const floor = i > 30 ? '⬛' : '⬜';
    
    let baseString = '';
    for(let y=0; y<height; y++) {
        let row = '';
        for(let x=0; x<width; x++) {
            if (y===0 || y===height-1 || x===0 || x===width-1) row += wall;
            else if (Math.random() < 0.15) row += wall;
            else row += floor;
        }
        baseString += row.trim() + '\n';
    }

    labyrinthMaps[mapId] = {
        width: width,
        baseLayerString: baseString,
        encounters: {
            [floor]: [
                { id: beastId, levelRange: [50 + i, 60 + i], chance: 0.6 },
                { id: 'feature_creep', levelRange: [60 + i, 70 + i], chance: 0.2 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: 2, targetY: 2, x: 1, y: 1 },
            'next': { type: 'door', emoji: '🌀', targetMap: next, targetX: 1, targetY: 1, x: width-2, y: height-2 },
            'artifact_spot': { 
                type: 'npc', emoji: '🎁', 
                dialogue: { start: [`You found ${itemName}!`, {giveItem: itemId}, "The walls are shifting..."] }, 
                x: Math.floor(width/2), y: Math.floor(height/2) 
            },
            'sign': {
                type: 'npc', emoji: '🪧',
                dialogue: { start: [`"Level ${i} of 67. Abandon all moderation, ye who enter here."`] },
                x: 2, y: 2
            }
        },
        isExtreme: true, // Triggers render effects
        extremeLevel: i // Intensity
    };
}
