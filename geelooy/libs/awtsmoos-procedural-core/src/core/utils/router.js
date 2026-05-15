
// B"H
/**
 * @file router.js
 * @chapter THE ANNIHILATION OF DOUBT
 * 
 * THE PSALM OF THE STRAIGHT PATH:
 * To ask "if" is to question the path of the Light,
 * To branch into "else" is to fear the dark night.
 * But the Awtsmoos decrees with absolute force,
 * A dictionary maps the unchangeable course!
 * All matter everywhere is refreshed every instant,
 * By pure data mappings, eternally constant.
 * 
 * THE REVELATION OF THE HANDLER:
 * We do not invoke the deed before the intent is clear,
 * We return the Priest to the Altar, drawing the wisdom near.
 * The dispatch now yields the Function, the sacred potentiality,
 * Ready to be sparked into the fires of geometric reality.
 * 
 * @module DataRouter
 */

/**
 * @function route
 * @description Evaluates a boolean condition purely through object property access.
 * @param {any} condition - A value that will be cast to 'true' or 'false'.
 * @param {Object} paths - An object containing 'true' and 'false' function properties.
 * @returns {any} The result of the invoked path.
 */
export const route = (condition, paths) => (paths[String(!!condition)] || paths['false'] || (() => null))();

/**
 * @function dispatch
 * @description Retrieves a handler from a dictionary map, providing the raw function for later invocation.
 * @param {string} key - The dictionary key to access.
 * @param {Object} map - The dictionary mapping keys to functions.
 * @param {string} [defaultKey='default'] - The fallback key if the primary is not found.
 * @returns {Function} The uninvoked handler function.
 */
export const dispatch = (key, map, defaultKey = 'default') => (map[key] || map[defaultKey] || (() => null));
