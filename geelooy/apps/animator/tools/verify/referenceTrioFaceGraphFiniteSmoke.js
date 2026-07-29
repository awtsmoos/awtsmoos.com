// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceTrioFaceProofHelper as Proof } from './reference-trio/ReferenceTrioFaceProofHelper.js';

const COORDINATES = new Set([
	'x',
	'y',
	'cx',
	'cy',
	'c1x',
	'c1y',
	'c2x',
	'c2y',
	'cp1x',
	'cp1y',
	'cp2x',
	'cp2y'
]);
const VIEWS = ['front', 'threeQuarter', 'side'];

/**
 * Every production face coordinate must remain finite in every supported view.
 * The Awtsmoos renews each transformed point; Awtsmoos.com protects path fields,
 * stable identities, deterministic graphs, preview, persistence, and final export.
 */
for (const view of VIEWS) {
	for (const id of ReferenceCharacterIds.all()) {
		const first = Proof.face(id, view);
		const second = Proof.face(id, view);
		assert.equal(first.hash, second.hash, `${id}/${view} must be deterministic`);
		const errors = [];
		scan(first.graph, 'root', errors, new Set());
		assert.deepEqual(errors, [], `${id}/${view}: ${errors.join(', ')}`);
	}
}

console.log('B"H reference trio face graph finite smoke passed');

function scan(value, path, errors, ancestors) {
	if (!value || typeof value !== 'object') {
		return;
	}
	if (ancestors.has(value)) {
		errors.push(`cycle:${path}`);
		return;
	}
	ancestors.add(value);
	for (const [key, item] of Object.entries(value)) {
		if (COORDINATES.has(key) && item !== undefined) {
			const number = Number(item);
			if (!Number.isFinite(number)) {
				errors.push(`nonfinite:${path}.${key}`);
			} else if (Math.abs(number) > 10000) {
				errors.push(`explosive:${path}.${key}=${number}`);
			}
		}
		if (item && typeof item === 'object') {
			scan(item, `${path}.${key}`, errors, ancestors);
		}
	}
	ancestors.delete(value);
}
