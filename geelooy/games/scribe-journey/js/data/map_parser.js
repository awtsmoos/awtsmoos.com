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

        const emojiToKeyMap = {};
        if (rawMap.interactables) {
            for (const key in rawMap.interactables) {
                const entity = rawMap.interactables[key];
                if (entity.emoji) {
                    emojiToKeyMap[entity.emoji] = key;
                }
            }
        }

        const newInteractables = {};
        for (let y = 0; y < newMap.baseLayer.length; y++) {
            for (let x = 0; x < newMap.baseLayer[y].length; x++) {
                const tileEmoji = newMap.baseLayer[y][x];
                const entityKey = emojiToKeyMap[tileEmoji];

                if (entityKey) {
                    const coordKey = `${x},${y}`;
                    // --- THIS IS THE UPGRADE ---
                    // We now add the x and y coordinates directly into the object
                    newInteractables[coordKey] = {
                        ...rawMap.interactables[entityKey],
                        x: x,
                        y: y
                    };
                    
                    newMap.baseLayer[y][x] = '⬜'; 
                }
            }
        }
        
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