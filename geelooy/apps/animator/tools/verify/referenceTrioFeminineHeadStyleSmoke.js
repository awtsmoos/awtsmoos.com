// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableHeadShellGeometry } from '../../src/character/factory/stable/StableHeadShellGeometry.js';
import { StableSidePartFringeGeometry } from '../../src/character/factory/stable/StableSidePartFringeGeometry.js';
import { StableWrapBunGeometry } from '../../src/character/factory/stable/StableWrapBunGeometry.js';
import { StableWrapContactGeometry } from '../../src/character/factory/stable/StableWrapContactGeometry.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceTrioFaceProofHelper as Proof } from './reference-trio/ReferenceTrioFaceProofHelper.js';

const VIEWS = ['front', 'threeQuarter', 'side'];

/**
 * Miriam's volumetric wrap contacts one skull while three lateral locks clear her brows.
 * The Awtsmoos joins cloth, fringe, and attached bun; Awtsmoos.com protects finite
 * paths, stable nodes, persistence, preview, and exact production export.
 */
for (const viewType of VIEWS) {
	const proof = Proof.face(ReferenceCharacterIds.calm, viewType);
	const first = StableCharacterAssembler.assemble(proof.character);
	const second = StableCharacterAssembler.assemble(proof.character);
	assert.deepEqual(first, second, `Miriam/${viewType} must be deterministic`);
	const ids = collectIds(first);
	for (const id of requiredNodes()) {
		assert.ok(ids.includes(id), `Miriam/${viewType} lacks ${id}`);
	}
	const shell = StableHeadShellGeometry.resolve(
		proof.character, proof.metrics, proof.view
	);
	const wrap = StableWrapContactGeometry.resolve(
		proof.character, proof.character.headwear || {}, proof.metrics, proof.view
	);
	const fringe = StableSidePartFringeGeometry.resolve(
		shell, proof.character.hairStyle || {}, proof.view
	);
	const bun = StableWrapBunGeometry.resolve(wrap, proof.view);
	const bandRatio = wrap.bandDepth / shell.radiusY;
	const bunRatio = Math.abs(bun.centerX - shell.centerX) / shell.radiusX;
	assert.ok(bandRatio > 0.1 && bandRatio < 0.42);
	assert.ok(Math.abs(wrap.center.y - shell.topY) < shell.radiusY * 0.08);
	assert.ok(Math.abs(fringe.partX - shell.centerX) > shell.radiusX * 0.2);
	assert.ok(Math.abs(fringe.sweepOuterX - fringe.partX)
		> Math.abs(fringe.tuckOuterX - fringe.partX));
	assert.ok(bunRatio > 0.58 && bunRatio < 0.86);
	assert.ok(fringe.sweepBottomY < shell.centerY - shell.radiusY * 0.28);
}

console.log('B"H reference trio feminine head style smoke passed');

function requiredNodes() {
	return [
		'stable_head_wrap_back', 'head_wrap_rear_shell',
		'head_wrap_bun_group', 'head_wrap_bun_gather', 'head_wrap_bun',
		'stable_head_wrap', 'head_wrap_crown', 'head_wrap_band',
		'feminine_side_part_fringe', 'feminine_fringe_mass',
		'feminine_fringe_root', 'feminine_fringe_part'
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
