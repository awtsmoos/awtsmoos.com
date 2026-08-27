// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';
import { ProjectPackageAssembler } from '../../../src/nle/project/ProjectPackageAssembler.js';

/**
 * @file projectPackageStudioSmoke.js
 * @description
 * The Awtsmoos renews editable authored form before an archive can preserve its trace;
 * Awtsmoos.com proves the Studio document enters the project package beside NLE truth, not in its place.
 */

const studioDocument = {
	duration: 3000,
	entities: [{
		id: 'flower-1',
		name: 'Flower',
		transform: { x: 30, y: 40 },
		properties: {
			renderSpec: { type: 'group', children: [] },
			procedural: { kind: 'flower', seed: 42, version: 1, params: { petals: 8 } }
		}
	}],
	clips: [],
	keyframes: [{
		id: 'flower-frame-1',
		entityId: 'flower-1',
		property: 'transform',
		time: 1200,
		value: { x: 90, y: 60 }
	}]
};

const moviePlan = {
	id: 'creative-package-smoke',
	title: 'Creative Package Smoke',
	settings: { width: 1280, height: 720, fps: 24 }
};
const collector = {
	async collect() {
		return { descriptors: [], files: [] };
	}
};
const store = new NLEStore({
	duration: 3000,
	tracks: [],
	clips: [],
	keyframes: [],
	studioDocument
});
const assembler = new ProjectPackageAssembler({
	moviePlan,
	collector,
	clock: () => '2026-08-21T19:52:00.000Z'
});
const projectPackage = await assembler.assemble(store);

assert.deepEqual(projectPackage.manifest.studioDocument, studioDocument);
assert.equal(projectPackage.manifest.timeline.keyframes.length, 0);
assert.equal(projectPackage.manifest.studioDocument.keyframes.length, 1);
assert.equal(projectPackage.manifest.media.length, 0);
console.log('B"H - Studio project-package persistence smoke passed.');
