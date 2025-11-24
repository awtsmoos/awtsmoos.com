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
    },
    'netzach_victory': {
        name: 'Netzach Victory',
        path: [
            { x: 1, y: 11 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 11 },
            { x: 5, y: 11 }, { x: 5, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 11 },
            { x: 9, y: 11 }, { x: 9, y: 1 }, { x: 11, y: 1 }, { x: 11, y: 11 },
            { x: 13, y: 11 }, { x: 13, y: 0 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'malchus_kingdom': {
        name: 'Malchus Kingdom',
        path: [
            { x: 0, y: 2 }, { x: 14, y: 2 }, { x: 14, y: 10 }, { x: 1, y: 10 },
            { x: 1, y: 5 }, { x: 16, y: 5 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'gilgul_cycle': {
        name: 'Gilgul Cycle',
        path: [
            { x: 0, y: 1 }, { x: 14, y: 1 }, { x: 14, y: 10 }, { x: 2, y: 10 },
            { x: 2, y: 3 }, { x: 12, y: 3 }, { x: 12, y: 8 }, { x: 4, y: 8 },
            { x: 4, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 16, y: 6 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'tiferes_beauty': {
        name: 'Tiferes Beauty',
        path: [
            { x: 8, y: 0 }, { x: 8, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 8 },
            { x: 14, y: 8 }, { x: 14, y: 4 }, { x: 9, y: 4 }, { x: 9, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'daas_knowledge': {
        name: 'Daas Knowledge',
        path: [
            { x: 0, y: 6 }, { x: 3, y: 6 }, { x: 3, y: 2 }, { x: 6, y: 2 },
            { x: 6, y: 6 }, { x: 9, y: 6 }, { x: 9, y: 2 }, { x: 12, y: 2 },
            { x: 12, y: 10 }, { x: 2, y: 10 }, { x: 2, y: 8 }, { x: 16, y: 8 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'gevurah_strength': {
        name: 'Gevurah Strength',
        path: [
            { x: 0, y: 1 }, { x: 13, y: 1 }, { x: 13, y: 3 }, { x: 2, y: 3 },
            { x: 2, y: 5 }, { x: 13, y: 5 }, { x: 13, y: 7 }, { x: 2, y: 7 },
            { x: 2, y: 9 }, { x: 13, y: 9 }, { x: 13, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'hod_splendor': {
        name: 'Hod Splendor',
        path: [
            { x: 1, y: 0 }, { x: 1, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 1 },
            { x: 10, y: 1 }, { x: 10, y: 5 }, { x: 15, y: 5 }, { x: 15, y: 10 },
            { x: 10, y: 10 }, { x: 10, y: 7 }, { x: 6, y: 7 }, { x: 6, y: 10 },
            { x: 0, y: 10 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'keter_crown': {
        name: 'Keter Crown',
        path: [
            { x: 8, y: 0 }, { x: 8, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 5 },
            { x: 13, y: 5 }, { x: 13, y: 2 }, { x: 9, y: 2 }, { x: 9, y: 8 },
            { x: 6, y: 8 }, { x: 6, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'binah_understanding': {
        name: 'Binah Understanding',
        path: [
            { x: 1, y: 11 }, { x: 1, y: 1 }, { x: 14, y: 1 }, { x: 14, y: 5 },
            { x: 4, y: 5 }, { x: 4, y: 8 }, { x: 14, y: 8 }, { x: 14, y: 11 },
            { x: 16, y: 11 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'chesed_mercy': {
        name: 'Chesed Mercy',
        path: [
            { x: 0, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 2 }, { x: 11, y: 2 },
            { x: 11, y: 10 }, { x: 5, y: 10 }, { x: 5, y: 7 }, { x: 16, y: 7 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'chochmah_wisdom': {
        name: 'Chochmah Wisdom',
        path: [
            { x: 8, y: 0 }, { x: 8, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 1 },
            { x: 6, y: 1 }, { x: 6, y: 8 }, { x: 14, y: 8 }, { x: 14, y: 3 },
            { x: 10, y: 3 }, { x: 10, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'merkabah_chariot': {
        name: 'Merkabah Chariot',
        path: [
            { x: 0, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 4 }, { x: 2, y: 4 },
            { x: 2, y: 8 }, { x: 6, y: 8 }, { x: 6, y: 10 }, { x: 10, y: 10 },
            { x: 10, y: 8 }, { x: 14, y: 8 }, { x: 14, y: 4 }, { x: 10, y: 4 },
            { x: 10, y: 1 }, { x: 16, y: 1 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'pardes_orchard': {
        name: 'Pardes Orchard',
        path: [
            { x: 0, y: 1 }, { x: 15, y: 1 }, { x: 15, y: 11 }, { x: 1, y: 11 },
            { x: 1, y: 3 }, { x: 13, y: 3 }, { x: 13, y: 9 }, { x: 3, y: 9 },
            { x: 3, y: 5 }, { x: 11, y: 5 }, { x: 11, y: 7 }, { x: 8, y: 7 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'atziluth_emanation': {
        name: 'Atziluth Emanation',
        path: [
            { x: 0, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 1 }, { x: 13, y: 1 },
            { x: 13, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 3 }, { x: 6, y: 3 },
            { x: 6, y: 8 }, { x: 13, y: 8 }, { x: 13, y: 11 }, { x: 3, y: 11 },
            { x: 3, y: 8 }, { x: 0, y: 8 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'tzimtzum_constriction': {
        name: 'Tzimtzum Constriction',
        path: [
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 11 }, { x: 3, y: 11 },
            { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 11 }, { x: 7, y: 11 },
            { x: 7, y: 2 }, { x: 14, y: 2 }, { x: 14, y: 11 }, { x: 12, y: 11 },
            { x: 12, y: 4 }, { x: 8, y: 4 }, { x: 8, y: 12 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'olam_haba': {
        name: 'Olam HaBa',
        path: [
            { x: 0, y: 11 }, { x: 15, y: 11 }, { x: 15, y: 9 }, { x: 1, y: 9 },
            { x: 1, y: 7 }, { x: 15, y: 7 }, { x: 15, y: 5 }, { x: 1, y: 5 },
            { x: 1, y: 3 }, { x: 15, y: 3 }, { x: 15, y: 1 }, { x: 1, y: 1 },
            { x: 1, y: 0 }
        ],
        gridWidth: 16,
        gridHeight: 12
    },
    'ein_sof_infinite': {
        name: 'Ein Sof Infinite',
        path: [
            { x: 0, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 3 }, { x: 1, y: 3 },
            { x: 1, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 7 }, { x: 1, y: 7 },
            { x: 1, y: 9 }, { x: 7, y: 9 }, { x: 7, y: 11 }, { x: 9, y: 11 },
            { x: 9, y: 9 }, { x: 15, y: 9 }, { x: 15, y: 7 }, { x: 9, y: 7 },
            { x: 9, y: 5 }, { x: 15, y: 5 }, { x: 15, y: 3 }, { x: 9, y: 3 },
            { x: 9, y: 1 }, { x: 16, y: 1 }
        ],
        gridWidth: 16,
        gridHeight: 12
    }
};

// Tower configurations
export const TOWER_TYPES = {
    'shooter': {
        emoji: '🚀',
        projectileEmoji: 'hebrew',
        projectileType: 'homing',
        cost: 75,
        baseDamage: 20,
        baseRange: TILE_SIZE * 2.5,
        baseFireRate: 100,
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
        slowFactor: 0.5,
        slowDuration: 120,
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
        baseDamage: 15, // Damage per tick
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
    // --- Tier 1 ---
    'cat': {
        emoji: '🐈‍⬛',
        baseHealth: 40,
        speed: 1.2,
        perutaValue: 5,
        children: null,
    },
    'flyer': {
        emoji: '🦇',
        baseHealth: 30,
        speed: 1.8,
        perutaValue: 8,
        children: null,
    },
    'imp': {
        emoji: '😈',
        baseHealth: 25,
        speed: 2.2,
        perutaValue: 3,
        children: null,
    },

    // --- Tier 2 ---
    'tiger': {
        emoji: '🐅',
        baseHealth: 55,
        speed: 1.2,
        perutaValue: 10,
        children: { type: 'cat', count: 2 },
    },
    'snake': {
        emoji: '🐍',
        baseHealth: 35,
        speed: 1.4,
        perutaValue: 6,
        children: { type: 'imp', count: 3 },
    },
    'healer': {
        emoji: '🥬',
        baseHealth: 80,
        speed: 1.0,
        perutaValue: 40,
        children: null,
        healRadius: TILE_SIZE * 2,
        healAmount: 5,
        healRate: 60,
    },

    // --- Tier 3 ---
    'fox': {
        emoji: '🦊',
        baseHealth: 65,
        speed: 1.5,
        perutaValue: 12,
        children: { type: 'snake', count: 3 },
    },
    'gorilla': {
        emoji: '🦍',
        baseHealth: 85,
        speed: 0.8,
        perutaValue: 25,
        children: { type: 'tiger', count: 3 },
    },
    'armored': {
        emoji: '🛡️',
        baseHealth: 150,
        speed: 0.7,
        perutaValue: 30,
        children: null,
        damageThreshold: 15,
        damageReduction: 0.8,
    },
    'wraith': {
        emoji: '👻',
        baseHealth: 120,
        speed: 1.1,
        perutaValue: 25,
        children: null,
        slowResistance: 0.6,
    },

    // --- Tier 4 ---
    'crocodile': {
        emoji: '🐊',
        baseHealth: 130,
        speed: 0.9,
        perutaValue: 22,
        children: { type: 'fox', count: 4 },
    },
    'golem': {
        emoji: '🗿',
        baseHealth: 120,
        speed: 0.6,
        perutaValue: 75,
        children: { type: 'gorilla', count: 5 },
        slowResistance: 0.5,
    },
    'cloner': {
        emoji: '🧬',
        baseHealth: 90,
        speed: 0.9,
        perutaValue: 20,
        children: { type: 'cloner_child', count: 2 },
    },
    'cloner_child': {
        emoji: '🦠',
        baseHealth: 45,
        speed: 1.0,
        perutaValue: 10,
        children: { type: 'cloner_grandchild', count: 2 },
    },
    'cloner_grandchild': {
        emoji: '🔬',
        baseHealth: 20,
        speed: 1.1,
        perutaValue: 5,
        children: null,
    },

    // --- Tier 5 (Bosses) ---
    'brute': {
        emoji: '👹',
        baseHealth: 600,
        speed: 0.3,
        perutaValue: 80,
        children: null,
        slowResistance: 0.3,
    },
    'elephant': {
        emoji: '🐘',
        baseHealth: 300,
        speed: 0.4,
        perutaValue: 60,
        children: { type: 'golem', count: 5 },
    },
    'leviathan': {
        emoji: '🐉',
        baseHealth: 1000,
        speed: 0.5,
        perutaValue: 200,
        children: { type: 'crocodile', count: 8 },
        slowResistance: 0.4,
        damageThreshold: 10,
        damageReduction: 0.3,
    }
};