// B"H
// js/data/map_parser.js

/**
 * This function processes all raw map data. It converts the map layout from a single
 * string into a 2D array. Most importantly, it repositions 'interactables'
 * from being name-keyed to coordinate-keyed by finding their emoji's position
 * in the baseLayerString. It also cleans the emoji from the map layer to prevent
 * it from being drawn twice.
 */
export function parseAllMaps(rawMaps) {
    const parsedMaps = {};

    for (const mapId in rawMaps) {
        const rawMap = rawMaps[mapId];
        const newMap = { ...rawMap };

        // 1. Parse the baseLayerString into a 2D array of characters.
        const baseLayer = rawMap.baseLayerString
            .trim()
            .split('\n')
            .map(row => Array.from(row.trim())); // Use Array.from for emoji support
        
        newMap.baseLayer = baseLayer;
        // Prepare an empty layer for dynamic effects if needed later.
        newMap.overlayLayer = new Array(baseLayer.length).fill(0).map(() => new Array(baseLayer[0].length).fill(null));

        // 2. Create a lookup table to map emojis back to their original name keys.
        // e.g., { '📜': 'elder_scribe', '👨': 'reuven' }
        const emojiToKeyMap = {};
        if (rawMap.interactables) {
            for (const key in rawMap.interactables) {
                const entity = rawMap.interactables[key];
                if (entity.emoji) {
                    emojiToKeyMap[entity.emoji] = key;
                }
            }
        }

        // 3. Create the new, coordinate-keyed interactables object.
        const newInteractables = {};
        
        // 4. Scan the entire map grid to find the location of each interactable emoji.
        for (let y = 0; y < newMap.baseLayer.length; y++) {
            for (let x = 0; x < newMap.baseLayer[y].length; x++) {
                const tileEmoji = newMap.baseLayer[y][x];
                const entityKey = emojiToKeyMap[tileEmoji]; // Look up the emoji in our map

                // If we found a matching emoji (like '📜')...
                if (entityKey) {
                    const coordKey = `${x},${y}`; // Create the coordinate key: "10,1"
                    
                    // Copy the original data to the new coordinate key.
                    newInteractables[coordKey] = { ...rawMap.interactables[entityKey] };
                    
                    // 5. IMPORTANT: Clear the emoji from the map's base layer.
                    // This prevents the character from being drawn twice (once by the map renderer,
                    // and again by the entity renderer). We replace it with a floor tile.
                    newMap.baseLayer[y][x] = '⬜'; 
                }
            }
        }
        
        // Keep any interactables that don't have an emoji (like a trigger region).
        if(rawMap.interactables) {
            for(const key in rawMap.interactables) {
                if(!rawMap.interactables[key].emoji) {
                     newInteractables[key] = { ...rawMap.interactables[key] };
                }
            }
        }

        newMap.interactables = newInteractables;
        parsedMaps[mapId] = newMap;
    }
    return parsedMaps;
}