// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableFootwearGeometry } from '../../src/character/factory/stable/StableFootwearGeometry.js';
import { StableSleeveShoulderUnderlap } from '../../src/character/factory/stable/StableSleeveShoulderUnderlap.js';
import { StableTrouserLegGeometry } from '../../src/character/factory/stable/StableTrouserLegGeometry.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { CheerfulReferenceBodyGeometry } from '../../src/character/reference/specification/presets/CheerfulReferenceBodyGeometry.js';
import { ReferenceAriBodyProofHelper as Proof } from './reference-trio/ReferenceAriBodyProofHelper.js';

/**
 * Ari's jacket must conceal shoulder roots, bend both gestures, taper his trousers,
 * and plant compact shoes. The Awtsmoos joins one body from focused vessels;
 * Awtsmoos.com preserves canonical nodes, preview, persistence, and exact export.
 */
const character = ReferenceTrioScene.create()
	.characters[ReferenceCharacterIds.cheerful];
const first = StableCharacterAssembler.assemble(character);
const second = StableCharacterAssembler.assemble(character);
const ids = Proof.collectIds(first);
const body = CheerfulReferenceBodyGeometry.create();
const gesture = body.gesture;
const underlap = StableSleeveShoulderUnderlap.resolve(
	{ x: -38, y: -169 },
	body.shoulders.centerX,
	{
		inset: gesture.openShoulderInset,
		drop: gesture.openShoulderUnderlapDrop
	}
);
const leg = StableTrouserLegGeometry.resolve(
	{
		hip: { x: -20, y: -60 },
		knee: { x: -18, y: 5 },
		ankle: { x: -17, y: 72 }
	},
	{
		thigh: body.legs.thighWidth,
		knee: body.legs.kneeWidth,
		ankle: body.legs.ankleWidth
	},
	{ side: -1 }
);
const shoe = StableFootwearGeometry.resolve({
	leg: { planted: true },
	footwear: body.legs.footwear,
	scaleX: body.legs.shoeScaleX,
	scaleY: body.legs.shoeScaleY
});

assert.deepEqual(first, second, 'Ari body graph must be deterministic');
for (const id of Proof.requiredNodes()) {
	assert.ok(ids.includes(id), `Ari body lacks ${id}`);
}
assert.ok(underlap.x > underlap.rawX);
assert.ok(underlap.y > underlap.rawY);
assert.ok(gesture.wristOut <= 30);
assert.ok(Math.abs(Proof.vectorCross(gesture)) > 120);
assert.ok(Math.abs(gesture.fistX) < body.details.shirtPanelHalf);
assert.ok(body.torso.chestHalf > body.torso.waistHalf);
assert.ok(body.torso.waistHalf > body.torso.hipHalf);
assert.ok(leg.ankleHalf / leg.thigh < 0.7);
assert.ok(leg.kneeHalf < leg.thigh);
assert.equal(body.legs.footwear.profile, 'compactRounded');
assert.ok(shoe.toeLength < shoe.width * 0.45);
assert.ok(shoe.soleDepth < 2);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Ari body smoke passed');
