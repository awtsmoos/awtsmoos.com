//B"H

// TILE_SIZE is now a base unit. The canvas will scale it.
export const TILE_SIZE = 50;

// Game maps
export const MAPS = {
    'sefiros': {
        name: 'Sefiros Path',
        path: [
            { x: 0, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 2 }, { x: 8, y: 2 },
            { x: 8, y: 9 }, { x: 5, y: 9 }, { x: 5, y: 7 }, { x: 13, y: 7 },
            { x: 13, y: 4 }, { x: 16, y: 4 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'yesod': {
        name: 'Yesod Foundation',
        path: [
            { x: 2, y: 0 }, { x: 2, y: 6 }, { x: 7, y: 6 }, { x: 7, y: 3 },
            { x: 12, y: 3 }, { x: 12, y: 10 }, { x: 4, y: 10 }, { x: 4, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    }
};

// Tower configurations
export const TOWER_TYPES = {
    'shooter': {
    
        emoji: '🚀',
        projectileEmoji: '•',
        cost: 100,
        baseDamage: 20,
        baseRange: TILE_SIZE * 2.5,
        baseFireRate: 80, // 1 shot per 80 frames
        upgradeCost: { damage: 50, speed: 60, range: 40 },
        maxRange: TILE_SIZE * 4,
    },
    'splash': {
        emoji: '🧨',
        projectileEmoji: '💣',
        cost: 250,
        baseDamage: 40,
        baseRange: TILE_SIZE * 2,
        baseFireRate: 150,
        upgradeCost: { damage: 120, speed: 130, range: 100 },
        maxRange: TILE_SIZE * 3,
        splashRadius: TILE_SIZE * 1.5,
    },
    
    'slicer': {
        emoji: '🗡️',
        projectileEmoji: '→',
        cost: 150,
        baseDamage: 10,
        baseRange: TILE_SIZE * 3,
        baseFireRate: 30, // Very fast
        upgradeCost: { damage: 70, speed: 80, range: 60 },
        maxRange: TILE_SIZE * 4.5,
    },
    'frost': { // New Tower
        emoji: '❄️',
        projectileEmoji: '🥶',
        cost: 200,
        baseDamage: 5, // Low damage
        baseRange: TILE_SIZE * 2.8,
        baseFireRate: 100,
        upgradeCost: { damage: 80, speed: 90, range: 70 },
        maxRange: TILE_SIZE * 4,
        slowFactor: 0.5, // Reduces enemy speed by 50%
        slowDuration: 120, // for 120 frames (2 seconds)
    }
};

// Enemy configurations
export const ENEMY_TYPES = {
    'cat': {
        emoji: '🐈‍⬛',
        baseHealth: 50, // Reverted to 50 to make them easier
        speed: 1.2,
        perutaValue: 5,
        children: null,
    },
    'gorilla': {
        emoji: '🦍',
        baseHealth: 300,
        speed: 0.8,
        perutaValue: 15,
        children: { type: 'cat', count: 2 },
    },
    'tiger': {
        emoji: '🐅',
        baseHealth: 75,
        speed: 1.5,
        perutaValue: 10,
        children: null,
    },
    'golem': { // New Enemy
        emoji: '🗿',
        baseHealth: 500,
        speed: 0.6,
        perutaValue: 25,
        children: null,
        slowResistance: 0.5, // Slows are 50% less effective
    }
};