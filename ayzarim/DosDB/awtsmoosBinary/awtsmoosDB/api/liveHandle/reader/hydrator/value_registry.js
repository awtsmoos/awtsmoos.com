
// B"H
/**
 * @file value_registry.js
 * @description
 *  =============================================================================
 *  CHAPTER 4: THE HOLY REGISTRY OF EMANATIONS
 *  =============================================================================
 *  "He restores my soul; He guides me in paths of righteousness for His name's sake."
 *  
 *  This file unites the distinct pillars of Hydration (Scalars, Magnitudes, 
 *  Substances, Complex Structures) into a single, omniscient mapping.
 *  There are no 'switch' statements here. The incoming Type ID instantly 
 *  locates its exact ritual of resurrection.
 */

const scalars = require('./scalars.js');
const magnitudes = require('./magnitudes.js');
const substances = require('./substances.js');
const complex = require('./complex.js');

const ValueRegistry = {
    ...scalars,
    ...magnitudes,
    ...substances,
    ...complex
};

module.exports = ValueRegistry;
