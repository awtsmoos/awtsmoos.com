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

import { rabbi_levi } from './scholars/rabbi_levi.js';
import { rebbe } from './special/rebbe.js';
import { MERCHANTS } from './merchants/merchants.js';
import { WANDERERS } from './wanderers/wanderers.js';

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
