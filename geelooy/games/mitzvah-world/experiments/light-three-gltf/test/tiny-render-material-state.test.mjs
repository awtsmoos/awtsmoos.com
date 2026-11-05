// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-material-state.test.mjs
 * @description Fuzzes the allocation-free RenderMaterialState against a literal
 * reference copy of the historic allocating snapshot comparison. Every upload
 * or skip decision, counter, and stored-truth field must match on every step,
 * including external program-switch resets of `previous`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RenderMaterialState,
	renderMaterialSnapshot
} from '../tiny-render-material-state.js';

function referenceDecisions(sequence) {
	let previous = null;
	const decisions = [];
	for (const step of sequence) {
		if (step.reset) {
			previous = null;
			decisions.push('reset');
			continue;
		}
		const next = renderMaterialSnapshot(step.mesh, step.buffers);
		const same = previous !== null
			&& Object.keys(next).every(key => previous[key] === next[key]);
		decisions.push(same ? 'skip' : 'upload');
		if (!same) previous = next;
	}
	return decisions;
}

function seededRandom(seed) {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

function randomMesh(random) {
	const material = {};
	if (random() < 0.8) {
		material.color = [
			Math.round(random() * 4) / 4,
			Math.round(random() * 4) / 4,
			Math.round(random() * 4) / 4,
			1
		];
	}
	if (random() < 0.3) material.opacity = Math.round(random() * 2) / 2;
	if (random() < 0.3) material.alphaCutoff = Math.round(random() * 2) / 2;
	if (random() < 0.3) material.emissiveStrength = Math.round(random() * 3);
	if (random() < 0.2) material.alphaMode = random() < 0.5 ? 'MASK' : 'BLEND';
	if (random() < 0.2) material.doubleSided = true;
	const mesh = { material, userData: {} };
	if (random() < 0.4) {
		mesh.userData.AwtsmoosYardGrass = {
			reactsToPlayer: random() < 0.5,
			windStrength: Math.round(random() * 10) / 100,
			windGust: Math.round(random() * 2) / 2,
			windFlutter: Math.round(random() * 2) / 2,
			wetness: Math.round(random() * 2) / 2,
			playerReaction: Math.round(random() * 2) / 2,
			interactionRadius: 1 + Math.round(random() * 3)
		};
	}
	return mesh;
}

test('B"H allocation-free state matches the historic snapshot decisions', () => {
	const random = seededRandom(613613);
	const sequence = [];
	for (let index = 0; index < 600; index += 1) {
		if (random() < 0.06) {
			sequence.push({ reset: true });
			continue;
		}
		// Repeat the previous mesh often: material runs are the common case.
		const reuse = sequence.length && random() < 0.45;
		const prior = reuse
			? [...sequence].reverse().find(step => step.mesh)
			: null;
		sequence.push({
			mesh: prior ? prior.mesh : randomMesh(random),
			buffers: { mode: random() < 0.85 ? 4 : 0 }
		});
	}
	const expected = referenceDecisions(sequence);
	const state = new RenderMaterialState();
	state.beginFrame({ materialStateSkips: 0, materialStateUploads: 0 });
	const actual = [];
	for (const step of sequence) {
		if (step.reset) {
			state.previous = null;
			actual.push('reset');
			continue;
		}
		actual.push(state.needsUpload(step.mesh, step.buffers) ? 'upload' : 'skip');
	}
	assert.deepEqual(actual, expected);
	assert.equal(
		state.uploads,
		expected.filter(decision => decision === 'upload').length
	);
	assert.equal(
		state.skips,
		expected.filter(decision => decision === 'skip').length
	);
});

test('B"H a repeated identical draw uploads once then skips', () => {
	const state = new RenderMaterialState();
	const stats = { materialStateSkips: 0, materialStateUploads: 0 };
	state.beginFrame(stats);
	const mesh = { material: { color: [0.2, 0.4, 0.6, 1] }, userData: {} };
	assert.equal(state.needsUpload(mesh, { mode: 4 }), true);
	assert.equal(state.needsUpload(mesh, { mode: 4 }), false);
	assert.equal(state.needsUpload(mesh, { mode: 4 }), false);
	assert.equal(stats.materialStateUploads, 1);
	assert.equal(stats.materialStateSkips, 2);
	mesh.material.color = [0.9, 0.4, 0.6, 1];
	assert.equal(state.needsUpload(mesh, { mode: 4 }), true);
	state.previous = null;
	assert.equal(state.needsUpload(mesh, { mode: 4 }), true);
});
