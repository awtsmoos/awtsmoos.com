// B"H
// js/data/map_parser.js

function parseMap(mapData, mapId) {
    if (!mapData || typeof mapData.baseLayerString !== 'string') {
        console.error(`Map Parse Error: Map data for '${mapId}' is invalid or missing 'baseLayerString'.`);
        return { width: 1, height: 1, baseLayer: [['❓']], overlayLayer: [['']], interactables: {} };
    }

    const rows = mapData.baseLayerString.trim().split('\n').map(row => row.trim());
    const baseLayer = rows.map(row => Array.from(row));
    const height = baseLayer.length;
    const width = mapData.width || (baseLayer[0] ? baseLayer[0].length : 0);
    
    const processedInteractables = {};
    const interactableKeys = Object.keys(mapData.interactables || {});

    // First, handle interactables that are defined by a specific coordinate key
    interactableKeys.forEach(key => {
        if (key.includes(',')) {
            const [x, y] = key.split(',').map(Number);
            const entity = mapData.interactables[key];
            entity.x = x;
            entity.y = y;
            processedInteractables[key] = entity;
        }
    });

    // Then, handle non-positioned interactables (like 'start_sequence')
    interactableKeys.forEach(key => {
        if (!key.includes(',')) {
            processedInteractables[key] = mapData.interactables[key];
        }
    });
    
    const overlayLayer = Array(height).fill(0).map(() => Array(width).fill(''));

    return { ...mapData, baseLayer, overlayLayer, interactables: processedInteractables };
}

export function parseAllMaps(mapCollection) {
    const parsedCollection = {};
    for (const mapId in mapCollection) {
        parsedCollection[mapId] = parseMap(mapCollection[mapId], mapId);
    }
    return parsedCollection;
}