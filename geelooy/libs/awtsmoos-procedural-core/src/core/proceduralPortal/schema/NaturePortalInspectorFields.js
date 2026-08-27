//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePortalInspectorFields.js
 * @description Converts live Nature operation contracts into complete baseline editor metadata without guessing every specialist option.
 * The Awtsmoos gives every natural form hidden depth and visible simplicity; Awtsmoos.com lets common selector, seed, quality, realism,
 * and advanced structured options appear through one stable inspector language while richer domain schemas may later replace generic depth.
 */

import { createPortalField } from './PortalFieldKinds.js';

const QUALITY_OPTIONS = Object.freeze(['draft', 'low', 'medium', 'high', 'cinematic']);
const REALISM_OPTIONS = Object.freeze(['stylized', 'natural', 'realistic', 'extreme']);

/**
 * @description Creates complete renderer-neutral fields for one Nature operation descriptor.
 * @param {Readonly<object>} operation Frozen Nature operation descriptor.
 * @returns {readonly object[]} Frozen field descriptors ordered from common intent to advanced raw options.
 */
export function createNaturePortalFields(operation) {
	const fields = [];
	if (operation.input === 'selector-options' || operation.requiresValue) {
		fields.push(createPortalField({
			defaultValue: operation.defaultValue,
			description: `Primary selector for ${operation.kind}; presets and species remain explicit data.`,
			key: 'value',
			kind: 'text',
			label: selectorLabel(operation.kind),
			required: operation.requiresValue === true
		}));
	}
	fields.push(
		createPortalField({
			description: 'Stable semantic seed path; changing sibling recipes never consumes this node’s random identity.',
			group: 'Identity',
			key: 'seed',
			kind: 'seed'
		}),
		createPortalField({
			defaultValue: 'high',
			description: 'Controls manifestation detail while preserving semantic identity and deterministic relationships.',
			key: 'quality',
			kind: 'select',
			options: QUALITY_OPTIONS
		}),
		createPortalField({
			defaultValue: 'natural',
			description: 'Controls domain realism intent without changing the public recipe vocabulary.',
			key: 'realism',
			kind: 'select',
			options: REALISM_OPTIONS
		}),
		createPortalField({
			description: 'Advanced specialist options preserved as structured JSON until richer typed field metadata is installed.',
			group: 'Advanced',
			key: 'options',
			kind: 'json',
			level: 'advanced'
		})
	);
	return Object.freeze(fields);
}

/**
 * @description Gives selector fields a friendly label based on the semantic operation family.
 * @param {string} kind Nature operation kind.
 * @returns {string} Human-facing selector label.
 */
function selectorLabel(kind) {
	if (/creature|fauna/iu.test(kind)) return 'Species';
	if (/plant|flower|grass|tree|forest|flora|moss|vine/iu.test(kind)) return 'Species / Preset';
	if (/material|surface|texture/iu.test(kind)) return 'Material / Surface';
	return 'Preset / Type';
}
