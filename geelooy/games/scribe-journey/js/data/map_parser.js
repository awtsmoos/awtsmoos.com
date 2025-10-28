// B"H
// js/data/map_parser.js

/**
 * Parses a map object that uses a string layout.
 * It converts the string into a 2D array for baseLayer and
 * automatically populates x/y coordinates for interactables.
 * @param {object} mapData - The map object with baseLayerString and width.
 * @returns {object} The fully processed map object for the game engine.
 */
function parseMap(mapData) {
    // Trim whitespace and split the string into rows
    const rows = mapData.baseLayerString.trim().split('\n');
    
    // Convert each row string into an array of characters (emojis)
    const baseLayer = rows.map(row => Array.from(row.trim()));

    // Automatically set coordinates for interactables based on their key "x,y"
    if (mapData.interactables) {
        for (const key in mapData.interactables) {
            if (key.includes(',')) {
                const [x, y] = key.split(',').map(Number);
                mapData.interactables[key].x = x;
                mapData.interactables[key].y = y;
            }
        }
    }

    // Create an empty overlay layer of the same dimensions
    const overlayLayer = Array(baseLayer.length).fill(0).map(() => Array(mapData.width).fill(''));

    // Return the processed map object
    return {
        ...mapData,
        baseLayer,
        overlayLayer,
    };
}


/**
 * Processes a collection of map objects through the parser.
 * @param {object} mapCollection - An object where keys are map IDs and values are map data.
 * @returns {object} The collection of fully parsed maps.
 */
export function parseAllMaps(mapCollection) {
    const parsedCollection = {};
    for (const mapId in mapCollection) {
        parsedCollection[mapId] = parseMap(mapCollection[mapId]);
    }
    return parsedCollection;
}