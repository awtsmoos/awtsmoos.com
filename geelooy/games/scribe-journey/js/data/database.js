// B"H
// js/data/database.js

import { musagim } from './musagim.js';
import { moves } from './moves.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { maps } from './maps.js';

// Re-export constants for easy access from other modules
export { TILE_SIZE, PLAYER_SPEED, formatMoney } from './maps.js'; // Assuming constants are defined in maps.js or a new constants.js file

export function createDefaultGameState() {
    
    // The player's starting state
    const player = {
        x: 5, y: 8, 
        pixelX: 5 * TILE_SIZE, 
        pixelY: 8 * TILE_SIZE, 
        direction: 'up', 
        emoji: '✍️',
        isMoving: false, 
        moveStartTime: 0, 
        startX: 5, 
        startY: 8, 
        targetX: 5, 
        targetY: 8,
        money: { perutah: 150 }, 
        inventory: [], 
        team: [{ id: 'clay_golem', level: 5 }],
        activeQuests: [],
    };

    // Assemble the complete initial state
    return {
        mode: 'main-menu',
        player: player,
        currentMapId: 'malkuth_village',
        maps: maps,
        db: {
            musagim,
            moves,
            items,
            quests
        },
        dialogue: { active: false },
        battle: { active: false },
    };
}