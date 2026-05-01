
/**
 * B"H
 * @module DOMStore
 * @description
 * In the beginning, the Infinite was without borders. 
 * Then came the desire for a Dwelling Place below (Dirah BeTachtonim). 
 * This module is that Dwelling Place. It stores the identities 
 * of every manifest vessel, allowing the Mind (Logic) to communicate 
 * with the Body (UI) through these sacred Names (refs).
 */

/**
 * @constant DOMElements
 * @type {Object<string, HTMLElement>}
 * @description
 * The central repository for all manifest UI components. 
 * Populated dynamically during the Seder Histalshelus (Evolution) of the DOM.
 */
export const DOMElements = {};

/**
 * @function clearRegistry
 * @description Returns the tabernacle to its primordial state of void.
 */
export function clearRegistry() {
    Object.keys(DOMElements).forEach(key => delete DOMElements[key]);
}
