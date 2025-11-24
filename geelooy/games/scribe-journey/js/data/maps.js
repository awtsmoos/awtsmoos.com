// B"H
// js/data/maps.js

import { malkuthMaps } from './maps/malchus.js';
import { cavernMaps } from './maps/caverns.js';
import { sefirotMaps } from './maps/sefiros.js';
import { parseAllMaps } from './map_parser.js';

// Combine all imported map objects into one
const allMaps = {
    ...malkuthMaps,
    ...cavernMaps,
    ...sefirotMaps,
    // ...import and spread future map files here
};

// Parse all maps to convert strings to arrays and process interactables
export const maps = parseAllMaps(allMaps);