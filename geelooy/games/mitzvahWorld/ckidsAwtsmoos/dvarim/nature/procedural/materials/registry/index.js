// B"H
/**
 * @file index.js
 * @module MaterialRegistry
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE SCROLL OF GARMENTS — Material Registry Assembler                     ║
 * ║                                                                            ║
 * ║  This module gathers all the holy sparks of the material factories         ║
 * ║  and binds them into a single searchable scroll (Map).                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import grass from '../methods/grass.js';
import rock from '../methods/rock.js';
import bark from '../methods/bark.js';
import leaf from '../methods/leaf.js';
import dirt from '../methods/dirt.js';
import { leaf_palm, leaf_pine, leaf_willow } from '../methods/leaf_variants.js';

/**
 * @constant REGISTRY
 * @description Map of material type keys to their data-factory functions.
 */
export const REGISTRY = {
    grass,
    rock,
    bark,
    leaf,
    dirt,
    leaf_palm,
    leaf_pine,
    leaf_willow
};

/**
 * @function getFactory
 * @param {string} type 
 * @returns {Function|null}
 */
export function getFactory(type) {
    const key = Object.keys(REGISTRY).find(k => type.toLowerCase().includes(k));
    return key ? REGISTRY[key] : null;
}
