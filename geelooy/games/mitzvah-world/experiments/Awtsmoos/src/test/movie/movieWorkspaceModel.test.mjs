// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieWorkspaceModel.test.mjs
 * @description Proves workspace panels and material-node source updates share one model.
 * The Awtsmoos renews one film as timeline, graph, cast, rig, and sequence;
 * Awtsmoos.com keeps editor changes immutable until the compiler accepts them.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieProject } from '../../movie/MovieProjectCompiler.js';
import {
	createMovieWorkspaceModel,
	updateMaterialNode
} from '../../movie/MovieWorkspaceModel.js';

function source() {
	return {
		cameraRigs: [{ id: 'customRig', fromOffset: [0, 2, 8], toOffset: [0, 2, 4] }],
		characters: [{ id: 'villager', costume: { garment: '#123456' } }],
		duration: 6,
		fps: 24,
		materialGraphs: [{
			edges: [{ from: 'color', input: 'color', to: 'out' }],
			id: 'material-one',
			nodes: [
				{ id: 'color', type: 'color', value: '#ff0000' },
				{ id: 'out', type: 'output' }
			]
		}],
		resolution: { height: 180, width: 320 },
		sequences: [{
			id: 'nested',
			tracks: [{ id: 'crowd', target: 'villager', type: 'crowd', clips: [{ duration: 3, start: 0 }] }]
		}],
		tracks: [
			{ id: 'nested-use', type: 'sequence', clips: [{ duration: 3, sequenceId: 'nested', start: 0 }] },
			{ id: 'camera', type: 'camera', clips: [{ anchor: {}, duration: 6, rig: 'customRig', start: 0 }] }
		]
	};
}

test('workspace model reflects compiled tracks and source production documents', () => {
	const compiled = compileMovieProject(source());
	const model = createMovieWorkspaceModel(compiled);
	assert.equal(model.characters.length, 1);
	assert.equal(model.sequences.length, 1);
	assert.equal(model.cameraRigs[0].uses, 1);
	assert.equal(model.graphs.length, 1);
	assert.equal(model.timeline.some(track => track.type === 'crowd'), true);
	assert.match(model.json, /material-one/);
});

test('material node editing returns a new source document', () => {
	const original = source();
	const updated = updateMaterialNode(original, 'material-one', 'color', '"#00ff00"');
	assert.equal(original.materialGraphs[0].nodes[0].value, '#ff0000');
	assert.equal(updated.materialGraphs[0].nodes[0].value, '#00ff00');
	assert.equal(compileMovieProject(updated).materialPresets['material-one'].color, '#00ff00');
});
