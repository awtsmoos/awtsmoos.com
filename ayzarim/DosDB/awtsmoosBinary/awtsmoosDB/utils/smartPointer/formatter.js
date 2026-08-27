
// B"H
/**
 * @file formatter.js
 * @description
 *  The Scribe of Appearances (Mar'eh).
 *  
 *  "And the Lord appeared to him..." (Genesis 18:1)
 *  Just as the Infinite Awtsmoos must clothe Itself in appearances so the human 
 *  mind can perceive It without shattering, so too must the raw, resurrected 
 *  entities of the database be clothed before they are written to the logs.
 * 
 *  When a JavaScript Function (active Speech), a Symbol (eternal Name), or a 
 *  massive Binary Buffer (Raw Light) is pulled from the deep void of the disk, 
 *  it is too intense for standard JSON vessels. `JSON.stringify` will return 
 *  `undefined` for a function, leading to catastrophic collapses if not handled. 
 *  This module safely contracts these infinite sparks into readable, safe strings, 
 *  ensuring the observation of reality never destroys it.
 */

/**
 * @function formatManifestation
 * @description 
 *  Examines a newly manifested entity and wraps it in a safe, descriptive string.
 *  Uses highly optimized, data-driven checks to avoid unnecessary overhead.
 * 
 * @param {*} entity The resurrected spark from the database.
 * @returns {string} A safe, contracted representation of the entity.
 */
function formatManifestation(entity) {
    if (entity === undefined) return "Void (Undefined)";
    if (entity === null) return "Ayin (Null)";
    
    if (Buffer.isBuffer(entity)) {
        return `<Binary Light: Buffer ${entity.length} bytes>`;
    }
    
    const type = typeof entity;
    
    if (type === 'function') {
        // A function is active speech, a verb in the grammatical structure of reality.
        return `<Active Speech: Function ${entity.name || 'Anonymous'}>`;
    }
    
    if (type === 'symbol') {
        return `<Eternal Sign: ${entity.toString()}>`;
    }
    
    if (type === 'bigint') {
        return `<Immense Measure: ${entity.toString()}n>`;
    }
    
    try {
        let str = JSON.stringify(entity);
        // If stringify cannot comprehend the entity, fall back to its string representation
        if (str === undefined) str = String(entity);
        return str.length > 50 ? str.substring(0, 50) + "..." : str;
    } catch (e) {
        // When a paradoxical structure (like a circular object) refuses to be flattened.
        return "<Incomprehensible Paradox>";
    }
}

module.exports = { formatManifestation };
