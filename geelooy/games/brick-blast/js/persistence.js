// B"H
import { dbGet, dbSet } from './db.js';

/**
 * This module is the sacred Scribe of Persistence. It records the player's eternal progress
 * into the browser's memory (IndexedDB), ensuring that their spiritual wealth (Perutas)
 * and acquired powers are never lost between sessions. All its functions are now asynchronous.
 */

// --- Cache for frequently accessed, startup-critical data ---
const cache = {
    apiKeys: undefined,
};

/**
 * A divine rite of awakening. This must be called at the dawn of the application
 * to load the most sacred scrolls into a readily accessible cache, preventing
 * delays in later communion.
 */
export async function loadInitialData() {
    const [apiKeys] = await Promise.all([
        getItem('ai_api_keys', {})
    ]);
    cache.apiKeys = apiKeys;
}

// --- Helper Functions ---

async function getItem(key, defaultValue) {
    try {
        const value = await dbGet(key);
        // IndexedDB returns undefined for missing keys
        return value !== undefined ? value : defaultValue;
    } catch (e) {
        console.error("Error reading from the sacred scrolls of IndexedDB", e);
        return defaultValue;
    }
}

async function setItem(key, value) {
    try {
        await dbSet(key, value);
    } catch (e) {
        console.error("Error writing to the sacred scrolls of IndexedDB", e);
    }
}

// --- Perutas ---

export async function getPerutas() {
    return await getItem('perutas', 0);
}

export async function setPerutas(amount) {
    // The Awtsmoos allows debt. There is no floor of zero anymore.
    await setItem('perutas', Math.floor(amount));
}

export async function addPerutas(amount) {
    const current = await getPerutas();
    await setPerutas(current + amount);
}

export async function spendPerutas(amount) {
    const current = await getPerutas();
    // One cannot spend what one does not have, even if one is in debt.
    if (current >= amount) {
        await setPerutas(current - amount);
        return true;
    }
    return false;
}

// --- Best Scores & Records ---

export async function getBestScores() {
    return await getItem('best_scores', {});
}

export async function setBestScore(levelId, stars) {
    const scores = await getBestScores();
    if (!scores[levelId] || stars > scores[levelId]) {
        scores[levelId] = stars;
        await setItem('best_scores', scores);
    }
}

export async function getLevelRecord(levelId) {
    const records = await getItem('level_records', {});
    const record = records[levelId] || {};
    // Ensure structure exists even if record is partial
    return {
        stars: record.stars || 0,
        time: record.time !== undefined ? record.time : Infinity
    };
}

export async function saveLevelRecord(levelId, stars, time) {
    const records = await getItem('level_records', {});
    const prev = records[levelId] || { stars: 0, time: Infinity };
    
    // We update if:
    // 1. Stars are better
    // 2. Stars are equal but Time is better
    
    // Note: If Stars are better, we accept the time even if it's worse, because
    // a high-star run is qualitatively superior in the game's logic.
    // However, for "improvement" checks in the game logic, we might want to be strict.
    // Here, we just save the "Best Run".
    
    let isNewBest = false;
    
    if (stars > prev.stars) {
        isNewBest = true;
    } else if (stars === prev.stars && time < prev.time) {
        isNewBest = true;
    }

    if (isNewBest) {
        records[levelId] = { stars, time };
        await setItem('level_records', records);
        
        // Sync with best_scores for UI compatibility
        await setBestScore(levelId, stars);
    }
    
    return isNewBest;
}

export async function getHighScore() {
    return await getItem('high_score', 0);
}

export async function setHighScore(score) {
    await setItem('high_score', score);
}


// --- Upgrades & Inventory ---

export async function getBallUpgradeLevel() {
    return await getItem('ball_upgrade_level', 0);
}
export async function incrementBallUpgradeLevel() {
    const level = await getBallUpgradeLevel();
    await setItem('ball_upgrade_level', level + 1);
}
export async function decrementBallUpgradeLevel() {
    const level = await getBallUpgradeLevel();
    if (level > 0) {
        await setItem('ball_upgrade_level', level - 1);
    }
}

export async function getPerutaMagnetLevel() {
    return await getItem('peruta_magnet_level', 0);
}
export async function incrementPerutaMagnetLevel() {
    const level = await getPerutaMagnetLevel();
    await setItem('peruta_magnet_level', level + 1);
}
export async function decrementPerutaMagnetLevel() {
    const level = await getPerutaMagnetLevel();
    if (level > 0) {
        await setItem('peruta_magnet_level', level - 1);
    }
}

export async function getDivineForesightLevel() {
    return await getItem('divine_foresight_level', 0);
}
export async function incrementDivineForesightLevel() {
    const level = await getDivineForesightLevel();
    await setItem('divine_foresight_level', level + 1);
}
// Note: Divine Foresight is not sellable, so no decrement function.

export async function getRapidFireLevel() {
    return await getItem('rapid_fire_level', 0);
}
export async function incrementRapidFireLevel() {
    const level = await getRapidFireLevel();
    await setItem('rapid_fire_level', level + 1);
}
export async function decrementRapidFireLevel() {
    const level = await getRapidFireLevel();
    if (level > 0) {
        await setItem('rapid_fire_level', level - 1);
    }
}

export async function getPaddleSizeLevel() {
    return await getItem('paddle_size_level', 0);
}
export async function incrementPaddleSizeLevel() {
    const level = await getPaddleSizeLevel();
    await setItem('paddle_size_level', level + 1);
}
export async function decrementPaddleSizeLevel() {
    const level = await getPaddleSizeLevel();
    if (level > 0) {
        await setItem('paddle_size_level', level - 1);
    }
}

export async function getPerutaInterestLevel() {
    return await getItem('peruta_interest_level', 0);
}
export async function incrementPerutaInterestLevel() {
    const level = await getPerutaInterestLevel();
    await setItem('peruta_interest_level', level + 1);
}
export async function decrementPerutaInterestLevel() {
    const level = await getPerutaInterestLevel();
    if (level > 0) {
        await setItem('peruta_interest_level', level - 1);
    }
}

export async function getCriticalStrikeLevel() {
    return await getItem('critical_strike_level', 0);
}
export async function incrementCriticalStrikeLevel() {
    const level = await getCriticalStrikeLevel();
    await setItem('critical_strike_level', level + 1);
}
export async function decrementCriticalStrikeLevel() {
    const level = await getCriticalStrikeLevel();
    if (level > 0) {
        await setItem('critical_strike_level', level - 1);
    }
}


export async function getInventory() {
    return await getItem('inventory', {});
}
export async function getPowerUpCount(powerUpId) {
    const inventory = await getInventory();
    return inventory[powerUpId] || 0;
}
export async function addPowerUp(powerUpId, count) {
    const inventory = await getInventory();
    inventory[powerUpId] = (inventory[powerUpId] || 0) + count;
    await setItem('inventory', inventory);
}
export async function usePowerUp(powerUpId) {
    const inventory = await getInventory();
    if (inventory[powerUpId] && inventory[powerUpId] > 0) {
        inventory[powerUpId]--;
        await setItem('inventory', inventory);
        return true;
    }
    return false;
}
export async function removePowerUp(powerUpId, count) {
    const inventory = await getInventory();
    if (inventory[powerUpId] && inventory[powerUpId] >= count) {
        inventory[powerUpId] -= count;
        await setItem('inventory', inventory);
        return true;
    }
    return false;
}

// --- Custom Levels ---
export async function getCustomLevels() {
    return await getItem('custom_levels', []);
}
export async function saveCustomLevel(levelData) {
    const levels = await getCustomLevels();
    const existingIndex = levels.findIndex(l => l.id === levelData.id);
    if (existingIndex > -1) {
        levels[existingIndex] = levelData;
    } else {
        levels.push(levelData);
    }
    await setItem('custom_levels', levels);
}
export async function deleteCustomLevel(levelId) {
    let levels = await getCustomLevels();
    levels = levels.filter(l => l.id !== levelId);
    await setItem('custom_levels', levels);
}

// --- AI Generator Settings ---

async function getApiKeys() {
    if (cache.apiKeys === undefined) {
        console.warn("Persistence cache not warmed. Performing fallback read for API keys.");
        await loadInitialData();
    }
    return cache.apiKeys || {};
}

export async function getApiKeyForProvider(providerId) {
    const keys = await getApiKeys();
    return keys[providerId] || '';
}

export async function setApiKeyForProvider(providerId, key) {
    const keys = await getApiKeys();
    if (key) {
        keys[providerId] = key;
    } else {
        delete keys[providerId];
    }
    cache.apiKeys = keys;
    await setItem('ai_api_keys', keys);
}

export async function getAiModelForProvider(providerId) {
    const models = await getItem('ai_models', {});
    return models[providerId] || '';
}

export async function setAiModelForProvider(providerId, model) {
    const models = await getItem('ai_models', {});
    models[providerId] = model;
    await setItem('ai_models', models);
}