
// B"H
// js/data/database.js

import { musagim } from './musagim.js';
import { moves } from './moves.js';
import { items } from './items.js';
import { quests } from './quests.js';
// Maps are no longer injected into state to save RAM. They are accessed via the Worker.

export const TILE_SIZE = 40;
export const PLAYER_SPEED = 180;

export function formatMoney(moneyObj) {
    return `${moneyObj.perutah || 0} Perutahs`;
}

export function createDefaultGameState() {
    
    const player = {
        x: 5, y: 8, 
        pixelX: 5 * TILE_SIZE, 
        pixelY: 8 * TILE_SIZE, 
        direction: 'up', 
        emoji: '✍️',
        level: 1, 
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
        completedQuests: [],
        flags: {}, 
        // Optimization: Track map modifications (deleted entities, opened doors) here
        // instead of cloning the entire map structure.
        mapChanges: {} 
    };

    return {
        mode: 'main-menu',
        player: player,
        currentMapId: 'malkuth_village',
        // Maps removed from here to prevent massive RAM usage during state cloning/transfer
        db: {
            musagim,
            moves,
            items,
            quests
        },
        dialogue: { active: false },
        battle: { active: false },
        bots: [] 
    };
}
