// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';
import { ProjectPackageAssembler } from '../../../src/nle/project/ProjectPackageAssembler.js';
import { StudioProceduralEntityService as Entities } from '../../../src/studio/procedural/StudioProceduralEntityService.js';

/**
 * @file proceduralPackageSmoke.js
 * @description
 * The Awtsmoos renews generated geometry and its seed before an archive may preserve their trace;
 * Awtsmoos.com proves v2 parameters and editable vector output travel together through the real project-package interface.
 */

const entity = Entities.create('flower');
const store = new NLEStore({
	duration: 4000,
	tracks: [],
	clips: [],
	keyframes: [],
	studioDocument: {
		duration: 4000,
		entities: [entity],
		tracks: [],
		clips: [],
		keyframes: []
	}
});
const moviePlan = {
	id: 'procedural-v2-package-smoke',
	title: 'Procedural V2 Package Smoke',
	settings: { width: 1280, height: 720, fps: 24 }
};
const collector = {
	async collect() {
		return { descriptors: [], files: [] };
	}
};
const assembler = new ProjectPackageAssembler({
	moviePlan,
	collector,
	clock: () => '2026-08-21T20:40:00.000Z'
});
const payload = await assembler.assemble(store);
const packaged = payload.manifest.studioDocument.entities[0];

assert.equal(packaged.id, entity.id);
assert.equal(packaged.type, 'procedural-flower');
assert.equal(packaged.properties.procedural.version, 2);
assert.equal(packaged.properties.procedural.kind, 'flower');
assert.deepEqual(packaged.properties.procedural.params, entity.properties.procedural.params);
assert.deepEqual(packaged.properties.renderSpec, entity.properties.renderSpec);
assert.equal(payload.manifest.timeline.keyframes.length, 0);
console.log('B"H - procedural v2 project-package persistence smoke passed.');
