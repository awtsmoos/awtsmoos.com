
// B"H
// js/procedural/world_generator.js

import { BIOMES, getBiomeForCoordinate } from './biome_data.js';

const CHUNK_SIZE = 40; // 40x40 tiles = 1600 tiles per chunk.
const TILE_SIZE = 40; // Pixels

export function generateChunk(worldX, worldY) {
    const biomeType = getBiomeForCoordinate(worldX, worldY);
    const biome = BIOMES[biomeType];
    
    // 1. Init Grid
    let grid = new Array(CHUNK_SIZE).fill(null).map(() => new Array(CHUNK_SIZE).fill(biome.floor));
    const interactables = {};
    const encounters = {};

    // 2. Terrain Generation (Cellular Automata lite)
    for(let y=0; y<CHUNK_SIZE; y++) {
        for(let x=0; x<CHUNK_SIZE; x++) {
            // Edges are open to allow travel, but corners might be blocked
            const isEdge = x===0 || x===CHUNK_SIZE-1 || y===0 || y===CHUNK_SIZE-1;
            
            if(!isEdge && Math.random() < 0.15) {
                const obstacle = biome.obstacles[Math.floor(Math.random() * biome.obstacles.length)];
                grid[y][x] = obstacle;
            }
        }
    }

    // 3. Encounters
    // Map the floor tile to the biome mobs
    encounters[biome.floor] = biome.mobs.map(id => ({
        id, levelRange: [Math.abs(worldX + worldY) + 1, Math.abs(worldX + worldY) + 5], chance: 0.2
    }));

    // 4. Points of Interest (NPCs, Structures)
    // Chance for a structure based on coordinate hash
    const seed = Math.abs((worldX * 73856093) ^ (worldY * 19349663));
    const hasVillage = (seed % 20) === 0;
    const hasRuins = (seed % 15) === 0;
    const hasRareChest = (seed % 50) === 0;

    if(hasVillage) {
        // Place a small settlement
        const cx = Math.floor(CHUNK_SIZE/2);
        const cy = Math.floor(CHUNK_SIZE/2);
        grid[cy][cx] = '🏠';
        interactables[`${cx},${cy}`] = { 
            type: 'npc', emoji: '🏠', 
            dialogue: { start: [`Welcome to the settlement of ${getGeneratedName(seed)}.`, "We survive out here by the grace of the Omnipresent."] } 
        };
        // Add a trader
        grid[cy+1][cx] = '🛒';
        interactables[`${cx},${cy+1}`] = { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["Rare goods from the wilds!"] } };
    }

    if(hasRuins) {
        const rx = 10 + (seed % 20);
        const ry = 10 + ((seed * 2) % 20);
        grid[ry][rx] = '🏛️';
        interactables[`${rx},${ry}`] = { 
            type: 'npc', emoji: '🏛️', 
            dialogue: { start: ["Ancient ruins of a forgotten Tractate...", {giveItem: 'sefer_fragment_aleph'}, "You found a fragment!"] } 
        };
    }

    if(hasRareChest) {
        const cx = 5 + (seed % 30);
        const cy = 5 + ((seed * 3) % 30);
        grid[cy][cx] = '💎';
        interactables[`${cx},${cy}`] = {
            type: 'npc', emoji: '💎',
            dialogue: { start: ["You found a rare artifact!", {giveItem: 'shofar_ram'}, "end"] }
        };
    }

    // 5. Procedural NPCs
    const numNPCs = seed % 4;
    for(let i=0; i<numNPCs; i++) {
        let nx, ny;
        do {
            nx = Math.floor(Math.random() * (CHUNK_SIZE-2)) + 1;
            ny = Math.floor(Math.random() * (CHUNK_SIZE-2)) + 1;
        } while(grid[ny][nx] !== biome.floor);
        
        grid[ny][nx] = '👤';
        interactables[`${nx},${ny}`] = {
            type: 'npc', emoji: '👤',
            dialogue: { start: [generateNPCDialogue(seed + i)] }
        };
    }


    return {
        id: `world_${worldX}_${worldY}`,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE,
        baseLayer: grid,
        overlayLayer: new Array(CHUNK_SIZE).fill(null).map(() => new Array(CHUNK_SIZE).fill(null)),
        interactables: interactables,
        encounters: encounters,
        worldX: worldX,
        worldY: worldY
    };
}

function getGeneratedName(seed) {
    const syllables = ['Bet', 'Gimel', 'Dalet', 'He', 'Vav', 'Zayin', 'Chet', 'Tet', 'Yud', 'Kaf'];
    return syllables[seed % 10] + "-" + syllables[(seed * 2) % 10];
}

function generateNPCDialogue(seed) {
    const lines = [
        "I saw a Kilayim Chimera yesterday. Terrifying.",
        "They say the Red Heifer grazes in the mountains to the west.",
        "I lost my Kli in the ocean. Chesed is overwhelming there.",
        "Have you studied the laws of Zeraim? The land needs rest.",
        "My grandfather told me of a city built of pure sapphire.",
        "Don't eat the fruit of the first three years!",
        "The borders of this world... do they ever end?"
    ];
    return lines[seed % lines.length];
}
