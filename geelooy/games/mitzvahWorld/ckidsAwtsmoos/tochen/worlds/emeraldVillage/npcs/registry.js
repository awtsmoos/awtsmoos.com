/**
 * B"H
 * @file registry.js
 * @description
 * 👥 THE CONGREGATION REGISTRY 👥
 * 
 * Aggregates all modular NPC files into a single holy collection.
 * Interior NPCs (merchants, scholars, special) have a propertyId.
 * Outdoor NPCs (wanderers) have a position.
 */

import { rabbi_levi } from './scholars/rabbi_levi.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { rebbe } from './special/rebbe.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { MERCHANTS } from './merchants/merchants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { WANDERERS } from './wanderers/wanderers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * B"H: Interior NPCs are bound to properties by propertyId.
 */
export const NPC_REGISTRY = [
    rabbi_levi,
    rebbe,
    ...MERCHANTS
];

/**
 * B"H: Outdoor wandering/standing NPCs with world positions.
 */
export const WANDERER_REGISTRY = WANDERERS;
