// B"H
// js/data/map_parser.js

/**

This is the definitive map parser for "The Scribe's Journey".

Its one and only job is to take the raw map data, which is easy for a human to write,

and transform it into a structure that the game engine can read efficiently.

THE CORE PROBLEM THIS SOLVES:

When multiple interactables share the same emoji (like two houses '🏠' or two people '👨'),

a simple lookup isn't enough. This parser solves that by processing interactables in the

exact order they are written in the map file. It finds the first available emoji for the

first entity, "claims" it, and then moves on to the next. This is the only way to

guarantee that the first '👨' on the map corresponds to the first '👨' in the data file.
*/
export function parseAllMaps(rawMaps) {
// This object will hold all the fully processed maps.
const parsedMaps = {};

// We begin by looping through every map defined in our game (e.g., 'malkuth_village').
for (const mapId in rawMaps) {
const rawMap = rawMaps[mapId];
const newMap = { ...rawMap }; // Create a new object to hold the parsed version.


// --- STEP 1: Convert the Map String into a Live, Modifiable Grid ---
 // The `baseLayerString` is great for design, but useless for the game engine.
 // We convert it into a 2D array of characters (a grid) that we can change.
 const grid = rawMap.baseLayerString
     .trim()
     .split('\n')
     .map(row => Array.from(row.trim())); // `Array.from` correctly handles emojis.

 // Initialize the final data structures for the new map.
 newMap.baseLayer = grid; // The grid we just created.
 newMap.overlayLayer = new Array(grid.length).fill(0).map(() => new Array(grid[0].length).fill(null));
 newMap.interactables = {}; // This will be populated with coordinate-keyed entities.

 // If a map happens to have no interactables, we can skip the complex logic.
 if (!rawMap.interactables) {
     parsedMaps[mapId] = newMap;
     continue; // Go to the next map.
 }

 // --- STEP 2: Sequentially Find and Place Each Interactable ---
 // This is the most critical part of the entire file.
 // We loop through the interactables in the order they were defined in the source file.
 for (const entityKey in rawMap.interactables) {
     const entityData = rawMap.interactables[entityKey];

     // We only need to find things that are physically represented by an emoji.
     if (entityData.emoji) {
         let foundOnMap = false;

         // Scan the entire grid from top-left (y=0, x=0) to bottom-right.
         for (let y = 0; y < grid.length; y++) {
             for (let x = 0; x < grid[y].length; x++) {

                 // Check if the character on the grid matches the entity's emoji.
                 if (grid[y][x] === entityData.emoji) {
                     
                     // --- SUCCESS! We found a match. ---

                     // a) Create the coordinate key that the game engine will look for (e.g., "3,4").
                     const coordKey = `${x},${y}`;
                     
                     // b) Add the entity's data to our new `interactables` object, keyed by its location.
                     //    We also inject the x/y coordinates directly into the object for the renderer.
                     newMap.interactables[coordKey] = { ...entityData, x, y };
                     
                     // c) THIS IS THE FIX: "Claim" the spot. We erase the emoji from the grid
                     //    by replacing it with a floor tile. This prevents any other entity
                     //    (like the second '👨') from finding this same spot again.
                     grid[y][x] = '⬜'; 
                     
                     // d) Set a flag and break out of the loops. We've found our entity,
                     //    so we can stop scanning for it and move on to the next one in the list.
                     foundOnMap = true;
                     break; 
                 }
             }
             if (foundOnMap) {
                 break;
             }
         }
     } else {
         // If an entity has no emoji, it's a non-physical trigger or data source.
         // We just copy it over directly.
         newMap.interactables[entityKey] = entityData;
     }
 }

 // --- STEP 3: Finalize the Parsed Map ---
 // The newmap object is now complete and correctly structured.
 // We add it to our collection of parsed maps.
 parsedMaps[mapId] = newMap;

}

// Finally, return the collection of all perfectly parsed maps.
return parsedMaps;
}

