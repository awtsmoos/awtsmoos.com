// B"H
// js/data/database.js

import { musagim } from './musagim.js';
import { moves } from './moves.js';
import { items } from './items.js';
import { quests } from './quests.js';
import { maps } from './maps.js'; // This now imports the fully parsed maps

// --- CORE CONSTANTS - DEFINED AND EXPORTED HERE ---
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 180;

// Helper function for formatting money display
export function formatMoney(moneyObj) {
    return `${moneyObj.perutah || 0} Perutahs`;
}

// --- GAME STATE ASSEMBLY ---
export function createDefaultGameState() {
    
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

    return {
        mode: 'main-menu',
        player: player,
        currentMapId: 'malkuth_village',
        maps: maps,
        db: { musagim, moves, items, quests },
        dialogue: { active: false },
        battle: { active: false },
    };
}