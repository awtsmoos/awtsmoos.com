/**
 * B"H
 * @file PassageLevel.js
 * @description THE PARDES PROGRESSION ENGINE
 * 
 * Determines which level of a passage a player has access to
 * based on their current Madreiga (spiritual level).
 * 
 * The journey: Pshat → Remez → Drush → Sod
 * As Madreiga rises, deeper meanings unlock, each more powerful.
 */

export const PARDES_LEVELS = ['pshat', 'remez', 'drush', 'sod'];

export const PARDES_COLORS = {
    pshat: '#a0522d',  // Earth brown
    remez: '#4169e1',  // Royal blue
    drush: '#ff4500',  // Fire orange
    sod:   '#9400d3'   // Deep violet
};

export const PARDES_ICONS = {
    pshat: 'P', remez: 'R', drush: 'D', sod: 'S'
};

/**
 * @function getActiveLevel
 * @description Returns the deepest PaRDeS level the player can use for a passage.
 * @param {Object} passage - The passage with pardes object
 * @param {number} madreiga - The player's current Madreiga level
 * @returns {string} The active PaRDeS level key ('pshat', 'remez', etc.)
 */
export function getActiveLevel(passage, madreiga) {
    let active = 'pshat';
    for (const level of PARDES_LEVELS) {
        if (passage.pardes[level] && madreiga >= passage.pardes[level].unlockMadreiga) {
            active = level;
        }
    }
    return active;
}

/**
 * @function getPassageStats
 * @description Returns the actual battle stats for a passage at the player's madreiga.
 * @param {Object} passage
 * @param {number} madreiga
 * @returns {Object} { level, power, effect, text, unlocked[] }
 */
export function getPassageStats(passage, madreiga) {
    const level = getActiveLevel(passage, madreiga);
    const data = passage.pardes[level];
    
    const unlocked = PARDES_LEVELS.filter(l =>
        passage.pardes[l] && madreiga >= passage.pardes[l].unlockMadreiga
    );
    
    const nextLocked = PARDES_LEVELS.find(l =>
        passage.pardes[l] && madreiga < passage.pardes[l].unlockMadreiga
    );

    return {
        level,
        power:  data.power,
        effect: data.effect,
        text:   data.text,
        unlocked,
        nextLocked,
        nextUnlockAt: nextLocked ? passage.pardes[nextLocked].unlockMadreiga : null
    };
}

/**
 * @function buildBattleMove
 * @description Constructs a full battle-ready move from a passage at a given madreiga.
 * @param {Object} passage
 * @param {number} madreiga
 * @returns {Object} Ready-to-use battle move
 */
export function buildBattleMove(passage, madreiga) {
    const stats = getPassageStats(passage, madreiga);
    return {
        id:          passage.id + '_' + stats.level,
        name:        passage.name,
        level:       stats.level,
        power:       stats.power,
        accuracy:    passage.pardes[stats.level]?.accuracy ?? 90,
        effect:      stats.effect,
        damageType:  passage.damageType,
        icon:        passage.icon,
        text:        stats.text,
        pardesData:  stats,
        author:      passage.author,
        source:      passage.text
    };
}
