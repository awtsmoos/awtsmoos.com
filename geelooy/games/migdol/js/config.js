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
        projectileType: 'homing',
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
        projectileType: 'homing',
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
        projectileType: 'homing',
        cost: 150,
        baseDamage: 10,
        baseRange: TILE_SIZE * 3,
        baseFireRate: 30, // Very fast
        upgradeCost: { damage: 70, speed: 80, range: 60 },
        maxRange: TILE_SIZE * 4.5,
    },
    'frost': {
        emoji: '❄️',
        projectileEmoji: '🥶',
        projectileType: 'homing',
        cost: 200,
        baseDamage: 5, // Low damage
        baseRange: TILE_SIZE * 2.8,
        baseFireRate: 100,
        upgradeCost: { damage: 80, speed: 90, range: 70 },
        maxRange: TILE_SIZE * 4,
        slowFactor: 0.5, // Reduces enemy speed by 50%
        slowDuration: 120, // for 120 frames (2 seconds)
    },
    'laser': {
        emoji: '⚡',
        projectileEmoji: '─',
        projectileType: 'piercing',
        cost: 300,
        baseDamage: 8, 
        baseRange: TILE_SIZE * 3.5,
        baseFireRate: 10, 
        upgradeCost: { damage: 150, speed: 180, range: 120 },
        maxRange: TILE_SIZE * 5,
        pierceLimit: 5, 
    },
    'chain': {
        emoji: '🔗',
        projectileEmoji: '✨',
        projectileType: 'chaining',
        cost: 275,
        baseDamage: 50,
        baseRange: TILE_SIZE * 3,
        baseFireRate: 120,
        upgradeCost: { damage: 130, speed: 140, range: 110 },
        maxRange: TILE_SIZE * 4.5,
        chainCount: 3, 
        chainRange: TILE_SIZE * 2.5,
    },
    'acid': {
        emoji: '🧪',
        projectileEmoji: '🦠',
        projectileType: 'ground_aoe',
        cost: 220,
        baseDamage: 15, // Damage per tick from the pool
        baseRange: TILE_SIZE * 2.5,
        baseFireRate: 180,
        upgradeCost: { damage: 100, speed: 100, range: 90 },
        maxRange: TILE_SIZE * 4,
        aoeRadius: TILE_SIZE * 1.2,
        aoeDuration: 300, // 5 seconds
    }
};

// Enemy configurations
export const ENEMY_TYPES = {
    'cat': {
        emoji: '🐈‍⬛',
        baseHealth: 50,
        speed: 1.2,
        perutaValue: 5,
        children: null,
    },
    'tiger': {
        emoji: '🐅',
        baseHealth: 55,
        speed: 1.2,
        perutaValue: 10,
        children: { type: 'cat', count: 2 },
    },
    'gorilla': {
        emoji: '🦍',
        baseHealth: 85,
        speed: 0.8,
        perutaValue: 25,
        children: { type: 'tiger', count: 2 },
    },
    'golem': { 
        emoji: '🗿',
        baseHealth: 100,
        speed: 0.6,
        perutaValue: 75,
        children: { type: 'tiger', count: 3 },
        slowResistance: 0.5,
    },
    'armored': {
        emoji: '🛡️',
        baseHealth: 150,
        speed: 0.7,
        perutaValue: 30,
        children: null,
        damageThreshold: 15, // Damage below this is heavily reduced
        damageReduction: 0.8, // Takes only 20% of damage below threshold
    },
    'healer': {
        emoji: '🥬',
        baseHealth: 80,
        speed: 1.0,
        perutaValue: 40,
        children: null,
        healRadius: TILE_SIZE * 2,
        healAmount: 5, // Heals 5 health per tick
        healRate: 60, // Heals once per second
    },
    'flyer': {
        emoji: '🦇',
        baseHealth: 30,
        speed: 1.8, // Very fast
        perutaValue: 8,
        children: null,
    }
};