// B"H
// js/data/map_parser.js

export function parseAllMaps(rawMaps) {
    const parsedMaps = {};

    for (const mapId in rawMaps) {
        const rawMap = rawMaps[mapId];
        const newMap = { ...rawMap };

        const baseLayer = rawMap.baseLayerString
            .trim()
            .split('\n')
            .map(row => Array.from(row.trim()));

        newMap.baseLayer = baseLayer;
        newMap.overlayLayer = new Array(baseLayer.length).fill(0).map(() => new Array(baseLayer[0].length).fill(null));

        const newInteractables = {};

        // --- THE NEW, CORRECT LOGIC ---
        // Instead of a lookup map, we loop through each defined interactable.
        if (rawMap.interactables) {
            for (const entityKey in rawMap.interactables) {
                const entityData = rawMap.interactables[entityKey];

                // If the entity is meant to be found on the map via its emoji...
                if (entityData.emoji) {
                    let found = false;
                    // We scan the entire map to find its location.
                    for (let y = 0; y < newMap.baseLayer.length; y++) {
                        for (let x = 0; x < newMap.baseLayer[y].length; x++) {
                            // If we find a matching emoji that hasn't been claimed yet...
                            if (newMap.baseLayer[y][x] === entityData.emoji) {
                                const coordKey = `${x},${y}`;
                                
                                // Create the new interactable at this coordinate.
                                newInteractables[coordKey] = { ...entityData, x, y };
                                
                                // Erase the emoji from the map to prevent duplicates.
                                newMap.baseLayer[y][x] = '⬜';
                                found = true;
                                break; // Stop searching for this entity.
                            }
                        }
                        if (found) break;
                    }
                } else {
                    // If an entity has no emoji, we just copy it over (e.g., for event triggers).
                    newInteractables[entityKey] = entityData;
                }
            }
        }

        newMap.interactables = newInteractables;
        parsedMaps[mapId] = newMap;
    }
    return parsedMaps;
}