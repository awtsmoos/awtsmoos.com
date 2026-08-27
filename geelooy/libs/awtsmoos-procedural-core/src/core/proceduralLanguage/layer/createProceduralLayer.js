//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralLayer.js
 * @description Defines named ordered patch layers for species defaults, individual variation, age, damage, equipment, environment, state, and future domain transforms.
 * The Awtsmoos is One while finite garments arrive layer after layer; Awtsmoos.com records precedence as data so hidden deep-merge magic never decides which intention should matter.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * Creates one immutable patch layer with explicit priority, enablement, and semantic role.
 * @param {object} [input={}] Layer id, role, priority, patches, metadata, and enablement.
 * @returns {Readonly<object>} Portable layer descriptor suitable for serialization and ordered application.
 */
export function createProceduralLayer(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-layer',
		version: 1,
		id: String(input.id || 'layer'),
		role: String(input.role || 'override'),
		priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 0,
		enabled: input.enabled !== false,
		patches: input.patches || [],
		metadata: input.metadata || {}
	});
}
