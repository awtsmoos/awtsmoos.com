// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableHeadShellGeometry } from '../../src/character/factory/stable/StableHeadShellGeometry.js';
import { StableKippahGeometry } from '../../src/character/factory/stable/StableKippahGeometry.js';
import { StableMaleHairlineGeometry } from '../../src/character/factory/stable/StableMaleHairlineGeometry.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceTrioFaceProofHelper as Proof } from './reference-trio/ReferenceTrioFaceProofHelper.js';

const VIEWS = ['front', 'threeQuarter', 'side'];
const MALES = [ReferenceCharacterIds.cheerful, ReferenceCharacterIds.skeptical];
const FIELDS = new Set([
	'x', 'y', 'cx', 'cy', 'c1x', 'c1y', 'c2x', 'c2y',
	'cp1x', 'cp1y', 'cp2x', 'cp2y'
]);

/**
 * Production hair must reveal forehead while each kippah contacts the living skull.
 * The Awtsmoos joins crown and cloth; Awtsmoos.com protects finite paths, stable
 * identities, deterministic preview, persistence, and exact production export.
 */
for (const viewType of VIEWS) {
	for (const id of MALES) {
		const proof = Proof.face(id, viewType);
		const first = StableCharacterAssembler.assemble(proof.character);
		const second = StableCharacterAssembler.assemble(proof.character);
		assert.deepEqual(first, second, `${id}/${viewType} must be deterministic`);
		const ids = collectIds(first);
		for (const nodeId of requiredNodes()) {
			assert.ok(ids.includes(nodeId), `${id}/${viewType} lacks ${nodeId}`);
		}
		const shell = StableHeadShellGeometry.resolve(
			proof.character, proof.metrics, proof.view
		);
		const hairline = StableMaleHairlineGeometry.resolve(
			shell, proof.character.hairStyle || {}, proof.view
		);
		const kippah = StableKippahGeometry.resolve(
			proof.character, proof.metrics, proof.view
		);
		assert.ok(hairline.band < shell.radiusY * 0.06);
		assert.ok(hairline.centerY < hairline.shoulderY);
		assert.ok(kippah.radiusX < shell.radiusX * 0.5);
		assert.ok(kippah.rise < shell.radiusY * 0.1);
		assert.ok(Math.abs(kippah.y - shell.topY) < shell.radiusY * 0.12);
		const errors = [];
		scan(first, 'root', errors, new Set());
		assert.deepEqual(errors, [], `${id}/${viewType}: ${errors.join(', ')}`);
	}
}

const ari = measures(ReferenceCharacterIds.cheerful);
const dovid = measures(ReferenceCharacterIds.skeptical);
assert.ok(dovid.kippah.radiusX < ari.kippah.radiusX);
assert.ok(dovid.hairline.width < ari.hairline.width);
assert.ok(dovid.kippah.rise < ari.kippah.rise);

console.log('B"H reference trio head style smoke passed');

function measures(id) {
	const proof = Proof.face(id, 'front');
	const shell = StableHeadShellGeometry.resolve(
		proof.character, proof.metrics, proof.view
	);
	return {
		hairline: StableMaleHairlineGeometry.resolve(
			shell, proof.character.hairStyle || {}, proof.view
		),
		kippah: StableKippahGeometry.resolve(
			proof.character, proof.metrics, proof.view
		)
	};
}

function requiredNodes() {
	return [
		'natural_male_hair_back', 'natural_male_crown',
		'natural_male_hairline_layer', 'natural_male_hairline',
		'natural_male_hairline_edge', 'stable_kippah',
		'kippah_mass', 'kippah_contact_seam'
	];
}

function collectIds(value, result = []) {
	if (!value || typeof value !== 'object') return result;
	if (typeof value.id === 'string') result.push(value.id);
	for (const item of Object.values(value)) {
		if (item && typeof item === 'object') collectIds(item, result);
	}
	return result;
}

function scan(value, path, errors, ancestors) {
	if (!value || typeof value !== 'object') return;
	if (ancestors.has(value)) { errors.push(`cycle:${path}`); return; }
	ancestors.add(value);
	for (const [key, item] of Object.entries(value)) {
		if (FIELDS.has(key) && item !== undefined && !Number.isFinite(Number(item))) {
			errors.push(`nonfinite:${path}.${key}`);
		}
		if (item && typeof item === 'object') scan(item, `${path}.${key}`, errors, ancestors);
	}
	ancestors.delete(value);
}
