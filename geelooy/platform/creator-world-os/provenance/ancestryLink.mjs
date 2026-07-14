// B"H
// Boruch Hashem
// Blessed is He
/** @module AncestryLink @description Records immutable parent-child provenance. */

/** Creates a provenance link and rejects self ancestry. */
export function createAncestryLink(input) {
	const parentId = requiredText(input?.parentId, 'parentId');
	const childId = requiredText(input?.childId, 'childId');
	if (parentId === childId) {
		throw new TypeError('An object cannot be its own ancestor.');
	}
	return Object.freeze({
		parentId,
		childId,
		relation: input?.relation || 'derived-from',
		createdAt: String(input?.createdAt || new Date().toISOString()),
		createdBy: requiredText(input?.createdBy, 'createdBy')
	});
}

/** Detects whether a set of links contains a directed cycle. */
export function hasAncestryCycle(links) {
	const parents = new Map();
	for (const link of links) {
		parents.set(link.childId, link.parentId);
	}
	for (const start of parents.keys()) {
		const seen = new Set();
		let current = start;
		while (parents.has(current)) {
			if (seen.has(current)) {
				return true;
			}
			seen.add(current);
			current = parents.get(current);
		}
	}
	return false;
}

function requiredText(value, name) {
	const text = String(value || '').trim();
	if (!text) {
		throw new TypeError(`${name} is required.`);
	}
	return text;
}
