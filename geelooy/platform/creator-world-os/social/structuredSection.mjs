// B"H
// Boruch Hashem
// Blessed is He
/** @module StructuredSection @description Creates nested, addressable sections for rich objects. */
import { stableObjectId } from '../core/stableObjectId.mjs';
import { assertSafeText } from './composerPayload.mjs';

/** Creates one recursively structured section. */
export function createStructuredSection(input) {
	const owner = String(input?.owner || '').trim();
	const title = String(input?.title || '').trim();
	const body = assertSafeText(input?.body || '');
	if (!owner || !title) {
		throw new TypeError('Structured section requires owner and title.');
	}
	const children = (input?.children || []).map(child => {
		return createStructuredSection({ ...child, owner });
	});
	return Object.freeze({
		id: input?.id || stableObjectId('section', owner, input?.seed || title),
		title,
		body,
		level: Math.max(1, Number(input?.level || 1)),
		children: Object.freeze(children),
		metadata: Object.freeze({ ...(input?.metadata || {}) })
	});
}

/** Flattens nested sections without losing parent order. */
export function flattenSections(sections) {
	return sections.flatMap(section => [section, ...flattenSections(section.children || [])]);
}
