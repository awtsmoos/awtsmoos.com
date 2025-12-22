
// B"H
// js/procedural/biome_data.js

export const BIOMES = {
    PLAINS: { 
        tile: '🌾', floor: '⬜', obstacles: ['🌳', '🪨', '🌻'], 
        mobs: ['clay_golem', 'wild_boar', 'leket_gleaner', 'kilayim_chimera'],
        rareMobs: ['tam_ox']
    },
    FOREST: { 
        tile: '🌳', floor: '🌿', obstacles: ['🌲', '🪵', '🍄'], 
        mobs: ['enduring_vine', 'orlah_fruit', 'wild_boar', 'swarm_of_bees'],
        rareMobs: ['rhythmic_dancer']
    },
    DESERT: { 
        tile: '🏜️', floor: '🟨', obstacles: ['🌵', '🐪', '🪨'], 
        mobs: ['dust_mite', 'snake_of_doubt', 'shmita_rest'],
        rareMobs: ['hollow_crown']
    },
    MOUNTAIN: { 
        tile: '⛰️', floor: '🪨', obstacles: ['🌋', '🧗', '🦅'], 
        mobs: ['obsidian_golem', 'peah_guardian', 'strict_liner'],
        rareMobs: ['ember_spirit']
    },
    OCEAN: { 
        tile: '🌊', floor: '🟦', obstacles: ['🚤', '🦈', '🏝️'], 
        mobs: ['benevolent_stream', 'drawn_water_elemental', 'river_of_understanding'],
        rareMobs: ['white_lion']
    },
    VOID: {
        tile: '⬛', floor: '🌑', obstacles: ['🕸️', '🕷️', '💀'],
        mobs: ['broken_vessel', 'hollow_crown', 'stagnant_mire'],
        rareMobs: ['false_god']
    }
};

export function getBiomeForCoordinate(x, y) {
    // A simple noise-like function for determinism
    const distance = Math.sqrt(x*x + y*y);
    const noise = Math.abs(Math.sin(x * 0.1) * Math.cos(y * 0.1));
    
    if (distance < 2) return 'PLAINS'; // Spawn area
    if (distance > 50) return 'VOID'; // Deep world

    if (x > 10) return 'OCEAN'; // East is water (Chesed)
    if (x < -10) return 'MOUNTAIN'; // West is fire/mountain (Gevurah)
    if (y > 10) return 'FOREST'; // South is Earth/Netzach
    if (y < -10) return 'DESERT'; // North is Air/Hod

    // Mix in between
    if (noise > 0.7) return 'FOREST';
    if (noise > 0.4) return 'PLAINS';
    return 'DESERT';
}
