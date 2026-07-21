// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { FaceRenderer } from '../../src/character/factory/stable/face/FaceRenderer.js';
import { StablePalette } from '../../src/character/factory/stable/StablePalette.js';
import { StableReferenceMetrics } from '../../src/character/factory/stable/StableReferenceMetrics.js';
import { StableRigMetrics } from '../../src/character/factory/stable/StableRigMetrics.js';
import { StableViewProfile } from '../../src/character/factory/stable/StableViewProfile.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * @file referenceTrioBeardMouthSmoke.js
 * @description Proves authored mouths and beards through the real production face chain.
 * The Awtsmoos is one beyond front and profile; Awtsmoos.com demands deterministic nodes,
 * speech above beard openings, distinct identities, and no bitmap substitute in any view.
 */
const VIEWS = ['front', 'threeQuarter', 'side'];
const IDS = ReferenceCharacterIds.all();

for (const viewType of VIEWS) {
	for (const id of IDS) {
		const first = faceFor(id, viewType);
		const second = faceFor(id, viewType);
		assert.equal(hash(first.graph), hash(second.graph));
		assert.ok(first.ids.some(nodeId => nodeId.endsWith('_upper_lip')));
		assert.ok(first.ids.some(nodeId => nodeId.endsWith('_lower_lip')));
		if (id === ReferenceCharacterIds.calm) {
			assert.equal(first.ids.includes('continuous_beard_mass'), false);
			continue;
		}
		for (const nodeId of [
			'continuous_beard_mass',
			'continuous_beard_outer',
			'continuous_beard_face_opening',
			'continuous_moustache_-1',
			'continuous_moustache_1'
		]) {
			assert.ok(first.ids.includes(nodeId), `${id} ${viewType} lacks ${nodeId}`);
		}
		const lipIndex = first.ids.findIndex(nodeId => nodeId.endsWith('_upper_lip'));
		assert.ok(
			first.ids.indexOf('continuous_beard_mass') < lipIndex,
			`${id} ${viewType} beard must render beneath speech`
		);
	}
}

const ariFront = faceFor(ReferenceCharacterIds.cheerful, 'front');
const dovidFront = faceFor(ReferenceCharacterIds.skeptical, 'front');
const miriamFront = faceFor(ReferenceCharacterIds.calm, 'front');
const miriam = ReferenceCharacterCatalog.character(ReferenceCharacterIds.calm);
const roseStroke = findNode(miriamFront.graph, 'human_upper_lip')?.style?.stroke;
assert.notDeepEqual(
	findNode(ariFront.graph, 'continuous_beard_outer'),
	findNode(dovidFront.graph, 'continuous_beard_outer')
);
assert.equal(roseStroke, miriam.mouthStyle.lipColor);
assert.notEqual(roseStroke, miriam.colors.line);
console.log('B"H reference trio beard and mouth smoke passed');

function faceFor(id, viewType) {
	const data = JSON.parse(JSON.stringify(ReferenceCharacterCatalog.character(id)));
	data.view = viewType;
	const sage = data.archetype === 'sage' || data.style === 'illustrated_sage';
	const baseMetrics = sage ? StableRigMetrics.sage() : StableRigMetrics.human();
	const metrics = StableReferenceMetrics.apply(data, baseMetrics);
	const colors = sage ? StablePalette.sage(data) : StablePalette.human(data);
	const view = StableViewProfile.get(data);
	const graph = FaceRenderer.build(
		sage ? 'sage' : 'human',
		data,
		colors,
		metrics,
		view,
		sage
	);
	return { graph, ids: collectIds(graph) };
}

function collectIds(node, result = []) {
	if (!node || typeof node !== 'object') return result;
	if (typeof node.id === 'string') result.push(node.id);
	for (const child of node.children || []) collectIds(child, result);
	return result;
}

function findNode(node, id) {
	if (!node || typeof node !== 'object') return null;
	if (node.id === id) return node;
	for (const child of node.children || []) {
		const found = findNode(child, id);
		if (found) return found;
	}
	return null;
}

function hash(value) {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
