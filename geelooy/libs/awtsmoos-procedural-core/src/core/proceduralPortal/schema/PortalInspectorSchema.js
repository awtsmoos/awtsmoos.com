//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalInspectorSchema.js
 * @description Turns semantic kind metadata into ordered renderer-neutral progressive-disclosure groups for stable generated editors.
 * The Awtsmoos conceals infinite depth behind finite clarity; Awtsmoos.com lets common intent appear first, advanced structure unfold
 * only when requested, and every field preserve one shared vocabulary so new generators arrive already styleable rather than naked.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Creates one complete inspector schema for a canonical kind or friendly alias installed in the registry.
 * @param {object} registry Portal semantic kind registry.
 * @param {string} kind Canonical kind or alias to inspect.
 * @returns {Readonly<object>} Frozen schema containing kind metadata and common/advanced field groups.
 */
export function createPortalInspectorSchema(registry, kind) {
	const definition = registry.resolve(kind);
	const descriptor = definition.describe();
	return freezeLanguageValue({
		description: descriptor.description,
		groups: groupPortalFields(descriptor.fields),
		kind: descriptor.kind,
		stability: descriptor.stability,
		version: descriptor.version
	});
}

/**
 * @description Groups fields by visibility level and named section while preserving their registry-defined order inside each section.
 * @param {readonly object[]} fields Renderer-neutral field descriptors.
 * @returns {readonly object[]} Frozen ordered progressive-disclosure groups.
 */
export function groupPortalFields(fields = []) {
	const groups = new Map();
	for (const field of fields) {
		const key = `${field.level || 'common'}:${field.group || 'General'}`;
		if (!groups.has(key)) {
			groups.set(key, {
				fields: [],
				label: field.group || 'General',
				level: field.level === 'advanced' ? 'advanced' : 'common'
			});
		}
		groups.get(key).fields.push(field);
	}
	return freezeLanguageValue([...groups.values()].map(group => ({
		...group,
		fields: group.fields
	})));
}
