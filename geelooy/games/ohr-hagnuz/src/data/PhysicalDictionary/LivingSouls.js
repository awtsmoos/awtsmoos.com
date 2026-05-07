
/**
 * B"H
 * @file LivingSouls.js
 * @chapter The Breath of Life
 */
export const LivingSouls = {
    // Sages & NPCs
    '📜': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'ELDER_ALEPH', type: 'NPC', color: '#4caf50' },
    '👁️': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'WATCHMAN', type: 'NPC', color: '#00b0ff' },
    '✒️': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'MERCHANT_SCRIBE', type: 'NPC', color: '#00e5ff' },
    '🧵': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'MERCHANT_TAILOR', type: 'NPC', color: '#ff80ab' },
    '🔨': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'ARTISAN_DALET', type: 'NPC', color: '#795548' },
    '🍞': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'MERCHANT_BAKER', type: 'NPC', color: '#ffb300' },
    '💎': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'MERCHANT_JEWELER', type: 'NPC', color: '#e040fb' },
    '🕯️': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'GENERAL_STORE', type: 'NPC', color: '#ffd54f' },
    '🌱': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'GARDENER_TET', type: 'NPC', color: '#8bc34a' },
    '🛡': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'SHIELD_CHET', type: 'NPC', color: '#607d8b' },
    '👳': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'TRAINER_ELDER', type: 'NPC', color: '#ffffff' },
    '🧔': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'RABBI_HEY', type: 'NPC', color: '#ffffff' },
    '👑': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'KING_MALCHUS', type: 'NPC', color: '#ffd54f' },
    '💂': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'ROYAL_GUARD', type: 'NPC', color: '#d32f2f' },
    '🎓': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'ROYAL_SCHOLAR', type: 'NPC', color: '#3f51b5' },
    '🤲': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'BEGGAR', type: 'NPC', color: '#a1887f' },
    '🎻': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_SAGE', eid: 'MUSICIAN', type: 'NPC', color: '#ff5252' },

    // Opponents
    '⚖': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_PHILOSOPHER', eid: 'PHILOSOPHER_BEIS', type: 'NPC', isEnemy: true, color: '#1e88e5' },
    '⚔': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ENEMY', eid: 'GUARDIAN', type: 'NPC', isEnemy: true, color: '#b71c1c' },
    
    // Beasts
    '🐺': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'WOLF_INSTINCT', type: 'NPC', isEnemy: true, color: '#9e9e9e' },
    '🐍': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'SNAKE_DECEIT', type: 'NPC', isEnemy: true, color: '#4caf50' },
    '🐂': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'OX_STUBBORN', type: 'NPC', isEnemy: true, color: '#8d6e63' },
    '🦁': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'LION_FIRE', type: 'NPC', isEnemy: true, color: '#ffb300' },
    '🦅': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'EAGLE_AIR', type: 'NPC', isEnemy: true, color: '#5d4037' },
    '🐆': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'PANTHER_WILD', type: 'NPC', isEnemy: true, color: '#212121' },
    '🦌': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'DEER_PEACE', type: 'NPC', color: '#ffab91' },
    '🐑': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'SHEPHERD_SHEEP', type: 'NPC', color: '#ffffff' },
    '🐲': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'DRAGON_PRIDE', type: 'NPC', isEnemy: true, color: '#d32f2f' },
    '🦂': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'SCORPION_CRUELTY', type: 'NPC', isEnemy: true, color: '#4e342e' },
    '🕷': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'SPIDER_TRAP', type: 'NPC', isEnemy: true, color: '#1a1a1a' },
    '🦉': { t: 'G_GRASS_FLAT', solid: true, obj: 'NPC_ANIMAL', eid: 'OWL_WISDOM', type: 'NPC', color: '#bcaaa4' },
    
    // Bosses
    '🐋': { t: 'G_WATER',      solid: true, obj: 'NPC_ANIMAL', eid: 'LEVIATHAN_DEEP', type: 'NPC', isEnemy: true, color: '#01579b' },
    '🦣': { t: 'G_MOUNTAIN',   solid: true, obj: 'NPC_ANIMAL', eid: 'BEHEMOTH_EARTH', type: 'NPC', isEnemy: true, color: '#3e2723' },
    '⛄': { t: 'G_SNOW',       solid: true, obj: 'NPC_ANIMAL', eid: 'GOLEM_ICE',      type: 'NPC', isEnemy: true, color: '#e0f7fa' }
};
