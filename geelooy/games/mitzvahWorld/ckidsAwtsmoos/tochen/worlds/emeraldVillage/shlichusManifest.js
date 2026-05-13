/**
 * B"H
 * @file shlichusManifest.js
 * @description THE BOOK OF SHLICHUS (MISSIONS)
 * Master Exporter for all modular missions.
 */

import { SHLICHUS_REGISTRY } from './shlichus/registry.js';

export const SHLICHUS_MANIFEST = SHLICHUS_REGISTRY;

export function getMission(id) {
    return SHLICHUS_MANIFEST[id] || null;
}
