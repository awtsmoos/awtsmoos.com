
// B"H
// js/procedural/map_generator.js

// This module procedurally generates "Tractate" dungeons AND "Tower" floors.

const WALL = '🧱';
const FLOOR = '⬜';
const ENTRANCE = '🚪';
const CHEST = '🏺';
const ENEMY_SPAWN = '⚠️';
const UP_STAIRS = '🆙';
const DOWN_STAIRS = '⏬';

export function generateTractateMap(seed, level, type = 'tractate') {
    const width = 20 + Math.floor(Math.random() * 10);
    const height = 20 + Math.floor(Math.random() * 10);
    
    // 1. Initialize Grid
    let grid = new Array(height).fill(null).map(() => new Array(width).fill(WALL));

    // 2. Cellular Automata / Random Walk for Rooms
    let x = Math.floor(width/2);
    let y = Math.floor(height/2);
    const maxSteps = 100 + (level * 20);
    
    for(let i=0; i<maxSteps; i++) {
        grid[y][x] = FLOOR;
        const dir = Math.floor(Math.random() * 4);
        if(dir===0 && y > 1) y--;
        if(dir===1 && y < height-2) y++;
        if(dir===2 && x > 1) x--;
        if(dir===3 && x < width-2) x++;
    }

    // 3. Place Interactables
    const interactables = {};
    const encounters = {
        '⚠️': []
    };

    // Determine Theme based on level/type
    let enemyPool = [];
    if (type === 'tower') {
        enemyPool = ['infinite_loop', 'null_pointer', 'missing_texture', 'feature_creep'];
        // Scale difficulty with floor number
        // Just use modulo to cycle basic mobs + bugs
        if(level % 2 === 0) enemyPool.push('clay_golem');
        if(level % 3 === 0) enemyPool.push('ember_spirit');
    } else {
        enemyPool = ['clay_golem', 'dust_mite'];
        if(level > 5) enemyPool = ['ember_spirit', 'drawn_water_elemental', 'enduring_vine'];
        if(level > 10) enemyPool = ['silent_syllogism', 'automaton_guard', 'glass_beaker'];
        if(level > 20) enemyPool = ['structural_limit', 'paradox_loop', 'hollow_crown'];
    }

    // Fill encounter list
    enemyPool.forEach(id => {
        encounters['⚠️'].push({ id, levelRange: [level, level+3], chance: 1/enemyPool.length });
    });

    // Populate Grid items
    let placedEntrance = false;
    let placedExit = false;

    for(let r=1; r<height-1; r++) {
        for(let c=1; c<width-1; c++) {
            if(grid[r][c] === FLOOR) {
                const roll = Math.random();
                if(!placedEntrance && roll < 0.1) {
                    if (type === 'tower') {
                        grid[r][c] = DOWN_STAIRS;
                        const target = level === 1 ? 'tower_lobby' : `tower_floor_${level-1}`;
                        interactables[`${c},${r}`] = { type: 'door', emoji: DOWN_STAIRS, targetMap: target, targetX: 1, targetY: 1 };
                    } else {
                        grid[r][c] = ENTRANCE;
                        interactables[`${c},${r}`] = { type: 'door', emoji: ENTRANCE, targetMap: 'malkuth_village', targetX: 10, targetY: 10 }; 
                    }
                    placedEntrance = true;
                } else if(!placedExit && roll < 0.05) {
                    if (type === 'tower') {
                        if (level < 1234) {
                            grid[r][c] = UP_STAIRS; 
                            interactables[`${c},${r}`] = { type: 'door', emoji: UP_STAIRS, targetMap: `tower_floor_${level+1}`, targetX: 1, targetY: 1 };
                        } else {
                            grid[r][c] = '👑'; // The Top!
                            interactables[`${c},${r}`] = { type: 'npc', emoji: '👑', dialogue: { start: ["You reached Feature #1234! The Tower is conquered!", {giveItem: 'spark_tohu_1234'}, "end"] } };
                        }
                    } else {
                        grid[r][c] = '⏬'; 
                        interactables[`${c},${r}`] = { type: 'npc', emoji: '⏬', dialogue: { start: ["You descend deeper into the Tractate..."] } }; 
                    }
                    placedExit = true;
                } else if(roll < 0.05) {
                    grid[r][c] = CHEST;
                    if(type === 'tower') {
                        // Drop one of the 1234 procedural sparks based on level
                        const sparkId = `spark_tohu_${level}`;
                        interactables[`${c},${r}`] = { type: 'npc', emoji: CHEST, pickup: sparkId };
                    } else {
                        interactables[`${c},${r}`] = { type: 'npc', emoji: CHEST, dialogue: { start: ["You found a lost Tosefta!", {giveItem: 'ink_of_potential'}, "end"] } };
                    }
                } else if(roll < 0.08) {
                    grid[r][c] = ENEMY_SPAWN; // Encounter tile
                }
            }
        }
    }

    // Force entrance if missing
    if(!placedEntrance) {
        grid[Math.floor(height/2)][Math.floor(width/2)] = type==='tower' ? DOWN_STAIRS : ENTRANCE;
        const tMap = type==='tower' ? (level===1?'tower_lobby':`tower_floor_${level-1}`) : 'malkuth_village';
        interactables[`${Math.floor(width/2)},${Math.floor(height/2)}`] = { type: 'door', emoji: type==='tower'?DOWN_STAIRS:ENTRANCE, targetMap: tMap, targetX: 10, targetY: 10 };
    }
    
    // Force Exit if missing (essential for tower)
    if(!placedExit && type === 'tower') {
         // Find a floor spot
         for(let r=height-2; r>0; r--) {
             for(let c=width-2; c>0; c--) {
                 if(grid[r][c] === FLOOR) {
                     grid[r][c] = UP_STAIRS;
                     interactables[`${c},${r}`] = { type: 'door', emoji: UP_STAIRS, targetMap: `tower_floor_${level+1}`, targetX: 1, targetY: 1 };
                     placedExit = true;
                     break;
                 }
             }
             if(placedExit) break;
         }
    }

    // Return format compatible with map_parser/maps.js
    return {
        baseLayer: grid,
        overlayLayer: new Array(height).fill(null).map(() => new Array(width).fill(null)),
        interactables: interactables,
        encounters: encounters,
        width: width
    };
}
