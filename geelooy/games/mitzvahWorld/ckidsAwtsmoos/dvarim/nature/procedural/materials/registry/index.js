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

/**
 * @constant REGISTRY
 * @description Map of material type keys to their data-factory functions.
 */
export const REGISTRY = {
    grass,
    rock,
    bark,
    leaf
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
