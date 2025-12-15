
// B"H
// js/data/insanity_expansion.js

// --- 55 DIMENSIONS OF CHAOS ---
// This file procedurally generates 55 "Insane" features.

export const insanityItems = {};
export const insanityBeasts = {};
export const insanityMaps = {};

const chaosEmojis = ['🌀', '👾', '🔥', '❄️', '⚡', '👁️', '🎲', '🏴', '🏳️', '🛑', '☢️', '☣️', '⚠️', '💤', '🎵', '💔', '❣️', '💣', '🔪', '🏺'];
const glitchedNames = ["N_ull", "V0id", "E_rr0r", "Un_defined", "NaN", "Seg_Fault", "Stack_Over", "Mem_Leak", "404", "500", "B_S_O_D", "R_M_RF", "Sudo", "Grep", "Echo"];

for (let i = 1; i <= 55; i++) {
    // 1. 55 Chaos Items
    const itemId = `chaos_artifact_${i}`;
    insanityItems[itemId] = {
        id: itemId,
        name: `Chaos Artifact #${i}`,
        desc: `A fragment of reality #${i}. Consuming it is ill-advised.`,
        type: 'consumable',
        effect: { stat: 'random_buff', intensity: i }, // Logic to handle this needs to exist or be generic
        sellValue: i * 66,
        rarity: 'holy'
    };

    // 2. 55 Chaos Beasts
    const beastId = `anomaly_${i}`;
    const beastEmoji = chaosEmojis[i % chaosEmojis.length];
    insanityBeasts[beastId] = {
        name: `${glitchedNames[i % glitchedNames.length]}_${i}`,
        emoji: beastEmoji,
        type: i % 2 === 0 ? 'Qliphoth' : 'Amalek',
        baseStats: {
            hp: 100 + (i * 20),
            attack: 20 + i,
            defense: 10 + i,
            diligence: i * 2
        },
        moves: ['Collapse', 'Mockery', 'Coin_Flip'],
        xpYield: 100 * i,
        moneyYield: { perutah: 10 * i }
    };

    // 3. 55 Chaos Maps
    const mapId = `insanity_level_${i}`;
    const prev = i === 1 ? 'malkuth_village' : `insanity_level_${i - 1}`;
    const next = i === 55 ? 'malkuth_village' : `insanity_level_${i + 1}`;
    
    // Generate weird grid
    const width = 15 + (i % 5);
    const height = 10 + (i % 5);
    const wallChar = chaosEmojis[(i * 3) % chaosEmojis.length];
    const floorChar = chaosEmojis[(i * 7) % chaosEmojis.length];
    
    let baseString = '';
    for(let y=0; y<height; y++) {
        let row = '';
        for(let x=0; x<width; x++) {
            if (y===0 || y===height-1 || x===0 || x===width-1) row += wallChar;
            else if (Math.random() < 0.1) row += wallChar;
            else row += floorChar;
        }
        baseString += row.trim() + '\n';
    }

    insanityMaps[mapId] = {
        width: width,
        baseLayerString: baseString,
        encounters: {
            [floorChar]: [
                { id: beastId, levelRange: [50 + i, 60 + i], chance: 0.5 },
                { id: 'missing_texture', levelRange: [50, 60], chance: 0.2 }
            ]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: 2, targetY: 2, x: 1, y: 1 },
            'next': { type: 'door', emoji: '🌀', targetMap: next, targetX: 1, targetY: 1, x: width-2, y: height-2 },
            'artifact_spot': { type: 'npc', emoji: '🎁', dialogue: { start: [`You found Chaos Artifact #${i}!`, {giveItem: itemId}, "end"] }, x: Math.floor(width/2), y: Math.floor(height/2) }
        },
        isInsane: true // Flag for renderer
    };
}
