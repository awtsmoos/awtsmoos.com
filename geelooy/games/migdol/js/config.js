//B"H

// Game canvas and grid settings
export const TILE_SIZE = 50;
export const CANVAS_WIDTH = TILE_SIZE * 16;
export const CANVAS_HEIGHT = TILE_SIZE * 12;

// The path enemies will follow. Co-ordinates are in grid units.
export const ENEMY_PATH = [
    { x: 0, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 2 }, { x: 8, y: 2 },
    { x: 8, y: 9 }, { x: 5, y: 9 }, { x: 5, y: 7 }, { x: 13, y: 7 },
    { x: 13, y: 4 }, { x: 16, y: 4 }
];

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
    }
};

// Enemy configurations
export const ENEMY_TYPES = {
    'cat': {
        emoji: '🐈‍⬛',
        baseHealth: 80,
        speed: 1.2,
        perutaValue: 5,
        children: null, // No smaller enemies when defeated
    },
    'gorilla': {
        emoji: '🦍',
        baseHealth: 300,
        speed: 0.8,
        perutaValue: 15,
        // Spawns two cats on defeat
        children: { type: 'cat', count: 2 },
    },
    'tiger': {
        emoji: '🐅',
        baseHealth: 150,
        speed: 2.0, // Very fast
        perutaValue: 10,
        children: null,
    },
};