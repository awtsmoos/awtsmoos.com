// B"H
// js/data/map_parser.js

/**
 * Parses a single map object from a string layout into a game-ready format.
 * This new version is robust and handles errors gracefully.
 * @param {object} mapData - The map object with a 'baseLayerString'.
 * @param {string} mapId - The ID of the map, for logging errors.
 * @returns {object} The fully processed map object.
 */
function parseMap(mapData, mapId) {
    // --- ROBUSTNESS CHECK ---
    // If the map data is invalid or missing the crucial string, stop and warn.
    if (!mapData || typeof mapData.baseLayerString !== 'string') {
        console.error(`Map Parse Error: Map data for '${mapId}' is invalid or missing 'baseLayerString'.`);
        // Return a small, empty, safe map to prevent the game from crashing.
        return {
            width: 1,
            height: 1,
            baseLayer: [['❓']],
            overlayLayer: [['']],
            interactables: {}
        };
    }

    const rows = mapData.baseLayerString.trim().split('\n').map(row => row.trim());
    const baseLayer = rows.map(row => Array.from(row));
    const height = baseLayer.length;
    const width = mapData.width || (baseLayer[0] ? baseLayer[0].length : 0);
    
    const processedInteractables = {};

    // --- SMARTER INTERACTABLE PLACEMENT ---
    
    // 1. Place entities that are defined by an emoji on the map.
    const interactableKeys = Object.keys(mapData.interactables || {});
    const placedKeys = new Set();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const charOnMap = baseLayer[y][x];
            
            // Find an interactable that has this emoji and hasn't been placed yet.
            const matchingKey = interactableKeys.find(key => {
                const entity = mapData.interactables[key];
                return entity && entity.emoji === charOnMap && !placedKeys.has(key);
            });

            if (matchingKey) {
                const entity = mapData.interactables[matchingKey];
                entity.x = x;
                entity.y = y;
                processedInteractables[`${x},${y}`] = entity;
                placedKeys.add(matchingKey); // Mark this one as placed.
            }
        }
    }

    // 2. Add any remaining interactables that DON'T have an emoji (like 'start_sequence').
    // These are treated as invisible event triggers.
    interactableKeys.forEach(key => {
        if (!placedKeys.has(key)) {
            processedInteractables[key] = mapData.interactables[key];
        }
    });
    
    const overlayLayer = Array(height).fill(0).map(() => Array(width).fill(''));

    return {
        ...mapData,
        baseLayer,
        overlayLayer,
        interactables: processedInteractables,
    };
}

/**
 * Processes a collection of map objects through the new robust parser.
 * @param {object} mapCollection - An object where keys are map IDs.
 * @returns {object} The collection of fully parsed maps.
 */
export function parseAllMaps(mapCollection) {
    const parsedCollection = {};
    for (const mapId in mapCollection) {
        // Pass the mapId to the parser for better error messages.
        parsedCollection[mapId] = parseMap(mapCollection[mapId], mapId);
    }
    return parsedCollection;
}