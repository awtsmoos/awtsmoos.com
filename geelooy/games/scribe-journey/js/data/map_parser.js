// B"H
// js/data/map_parser.js

/**
 * Parses a map object that uses a string layout.
 * NEW: It now automatically locates interactable emojis in the string
 * and assigns their coordinates, eliminating manual errors.
 * @param {object} mapData - The map object with baseLayerString.
 * @returns {object} The fully processed map object for the game engine.
 */
function parseMap(mapData) {
    const rows = mapData.baseLayerString.trim().split('\n').map(row => row.trim());
    const height = rows.length;
    const width = rows[0]?.length || 0;

    const baseLayer = rows.map(row => Array.from(row));
    const processedInteractables = {};

    // Auto-detect interactable positions
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = baseLayer[y][x];
            // Find an interactable whose emoji matches the character on the map
            const matchingKey = Object.keys(mapData.interactables || {}).find(key => {
                const entity = mapData.interactables[key];
                return entity.emoji === char && !entity.x; // Find one that hasn't been placed yet
            });

            if (matchingKey) {
                const entity = mapData.interactables[matchingKey];
                entity.x = x;
                entity.y = y;
                // Move it to a coordinate-based key for engine use
                processedInteractables[`${x},${y}`] = entity;
                delete mapData.interactables[matchingKey]; // Remove the old key
            }
        }
    }

    // Add back any non-emoji interactables like 'start_sequence'
    Object.assign(processedInteractables, mapData.interactables);
    
    const overlayLayer = Array(height).fill(0).map(() => Array(width).fill(''));

    return {
        ...mapData,
        baseLayer,
        overlayLayer,
        interactables: processedInteractables,
    };
}


export function parseAllMaps(mapCollection) {
    const parsedCollection = {};
    for (const mapId in mapCollection) {
        parsedCollection[mapId] = parseMap(mapCollection[mapId]);
    }
    return parsedCollection;
}