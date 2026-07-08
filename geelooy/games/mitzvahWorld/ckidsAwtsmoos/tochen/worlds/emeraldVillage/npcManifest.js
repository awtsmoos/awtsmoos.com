/**
 * B"H
 * @file npcManifest.js
 * @description THE VAST CONGREGATION OF SOULS
 * Master Exporter for all modular NPCs — both interior and outdoor.
 */

import { NPC_REGISTRY, WANDERER_REGISTRY } from './npcs/registry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * B"H: Interior NPCs bound to properties.
 */
export const NPC_MANIFEST = NPC_REGISTRY;

/**
 * B"H: Outdoor wandering NPCs with world positions.
 */
export const WANDERING_NPCS = WANDERER_REGISTRY;
