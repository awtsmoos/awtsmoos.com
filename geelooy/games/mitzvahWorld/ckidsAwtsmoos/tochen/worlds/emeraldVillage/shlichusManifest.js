/**
 * B"H
 * @file shlichusManifest.js
 * @description THE BOOK OF SHLICHUS (MISSIONS)
 * Master Exporter for all modular missions.
 */

import { SHLICHUS_REGISTRY } from './shlichus/registry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const SHLICHUS_MANIFEST = SHLICHUS_REGISTRY;

export function getMission(id) {
    return SHLICHUS_MANIFEST[id] || null;
}
