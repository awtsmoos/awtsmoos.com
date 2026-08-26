// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentComponents.js
 * @description Dispatches ordered arbitrary creature attachments through the existing renderer-neutral component guide contract.
 * RESPONSIBILITY: normalize public attachment descriptors, invoke focused builders, and allow later attachments to target earlier generated guides.
 * NON-RESPONSIBILITY: this module does not own species defaults, mesh compilation, or material rendering.
 * The Awtsmoos is one while attachments unfold in ordered plurality; Awtsmoos.com lets each new vessel become an anchor for the next without building a second creature engine.
 */

import { createFeatherAttachment } from './FeatherAttachment.js';
import { createHornAttachment } from './HornAttachment.js';
import { createMembraneAttachment } from './MembraneAttachment.js';

const BUILDERS = Object.freeze({
	feather: createFeatherAttachment,
	horn: createHornAttachment,
	membrane: createMembraneAttachment
});

const TYPE_ALIASES = Object.freeze({
	antler: ['horn', 'antler'],
	feathers: ['feather'],
	'feather-row': ['feather'],
	'ibex-horn': ['horn', 'ibex'],
	'ram-horn': ['horn', 'ram'],
	'spiral-horn': ['horn', 'spiral'],
	'unicorn-horn': ['horn', 'unicorn'],
	webbing: ['membrane'],
	'webbed-foot': ['membrane'],
	'webbed-hand': ['membrane']
});

/**
 * Builds an ordered list of arbitrary attachment descriptors.
 * @param {object} options Guides, quality budget, and attachment descriptors.
 * @returns {object} Merged component additions with guides, surface roles, and symmetry lineage.
 */
export function createCreatureAttachmentComponents(options = {}) {
	const result = empty();
	const workingGuides = { ...(options.guides || {}) };
	const attachments = Array.isArray(options.attachments) ? options.attachments : [];
	attachments.forEach((attachment, index) => {
		const descriptor = normalizeDescriptor(attachment, index);
		const builder = BUILDERS[descriptor.type];
		if (!builder) {
			return;
		}
		const created = builder(workingGuides, descriptor, options.quality);
		merge(result, created);
		Object.assign(workingGuides, created.guides || {});
	});
	return result;
}

/** Normalizes type aliases while preserving caller-supplied advanced fields. */
function normalizeDescriptor(attachment, index) {
	const source = { ...(attachment || {}) };
	const requestedType = String(source.type || source.kind || '').toLowerCase();
	const alias = TYPE_ALIASES[requestedType];
	const type = alias?.[0] || requestedType;
	const style = source.style || alias?.[1];
	const mirror = Boolean(source.mirror);
	return {
		...source,
		id: source.id || defaultId(type, index, mirror),
		mirror,
		style,
		type
	};
}

/** Creates a stable generated id that remains compatible with X-plane mirror naming. */
function defaultId(type, index, mirror) {
	const prefix = mirror ? 'left_' : '';
	return `${prefix}attachment_${type || 'component'}_${index + 1}`;
}

/** Merges one builder result into the public component addition contract. */
function merge(target, source) {
	Object.assign(target.guides, source?.guides || {});
	target.surfaceRoles.push(...(source?.surfaceRoles || []));
	target.symmetryPairs.push(...(source?.symmetryPairs || []));
}

/** Returns a fresh mutable accumulator used only during composition. */
function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
