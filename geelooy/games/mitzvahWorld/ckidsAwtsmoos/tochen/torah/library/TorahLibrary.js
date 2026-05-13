/**
 * B"H
 * @file TorahLibrary.js
 * @description
 * 🏛️ THE GRAND LIBRARY OF THE AWTSMOOS 🏛️
 * 
 * Chapter 20: The Infinite Scroll.
 * 
 * This is the central aggregator of all holy Torah knowledge in the Mitzvah World.
 * It imports the modular registries of the Chumash, Mishnah, Tanya, and more,
 * providing a unified interface for the Chossid's soul-study.
 */

import { PESUKIM_REBBE_REGISTRY } from './pesukim_rebbe/registry.js';
import { TANYA_REGISTRY } from './tanya/registry.js';
import { PIRKEI_AVOS_REGISTRY } from './pirkei_avos/registry.js';

export const TORAH_LIBRARY = {
    ...PESUKIM_REBBE_REGISTRY,
    ...TANYA_REGISTRY,
    ...PIRKEI_AVOS_REGISTRY
};

/**
 * B"H: Helper to get a passage by ID from anywhere in the library.
 */
export function getPassage(id) {
    return TORAH_LIBRARY[id] || null;
}

/**
 * B"H: Helper to get passages by category.
 */
export function getByCategory(bookName) {
    return Object.values(TORAH_LIBRARY).filter(p => p.book === bookName);
}
