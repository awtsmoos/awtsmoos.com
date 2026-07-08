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

import grass from '../methods/grass.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import rock from '../methods/rock.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import bark from '../methods/bark.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import leaf from '../methods/leaf.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import dirt from '../methods/dirt.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { leaf_palm, leaf_pine, leaf_willow } from '../methods/leaf_variants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

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
