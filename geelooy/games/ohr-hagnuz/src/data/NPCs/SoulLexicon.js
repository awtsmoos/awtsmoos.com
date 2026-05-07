
/**
 * B"H
 * @module SoulLexicon
 * @chapter The Breath of Life (Nishmat Chaim)
 */
export const SoulLexicon = {
    // Interactive Sages and Souls
    '📜': { isSoul: true, category: 'SAGE' },
    '👳': { isSoul: true, category: 'TRAINER' },
    '📖': { isSoul: true, category: 'LIBRARIAN' },
    '🪔': { isSoul: true, category: 'MYSTIC' },
    '🔨': { isSoul: true, category: 'ARTISAN' },
    '⚖': { isSoul: true, category: 'PHILOSOPHER' },
    '⚔': { isSoul: true, category: 'ENEMY' },
    
    // Animal Souls (Nefesh HaBehamit)
    '🐺': { isSoul: true, category: 'ANIMAL' },
    '🐍': { isSoul: true, category: 'ANIMAL' },
    '🐂': { isSoul: true, category: 'ANIMAL' },
    '🦁': { isSoul: true, category: 'ANIMAL' },
    '🦅': { isSoul: true, category: 'ANIMAL' },

    // Non-Soul Symbols for validation
    '1': { isSoul: false },
    '🌿': { isSoul: false },
    'T': { isSoul: false },
    'W': { isSoul: false },
    'H': { isSoul: false }
};
