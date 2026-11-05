// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioScene3dApi.test.mjs
 * @description Proves durable transforms and raw vertex edits pass through project history and frame reapplication.
 * The Awtsmoos renews whole object and single point through one covenant; Awtsmoos.com verifies
 * manual and agent operations share runtime, canonical JSON, reload behavior, and reversible commit labels.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieScene3dAuthoring } from '../../movie/MovieScene3dAuthoringRuntime.js';
import { createMovieStudioScene3dDomain } from '../../movie/MovieStudioApiScene3d.js';

function vector(x, y, z) {
	return {
		x, y, z,
		set(nextX, nextY, nextZ) {
			Object.assign(this, { x: nextX, y: nextY, z: nextZ });
		}
	};
}

function fixture() {
	const position = {
		array: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
		count: 3,
		needsUpdate: false
	};
	const mesh = {
		geometry: { attributes: { position }, userData: {} },
		isMesh: true
	};
	const model = {
		position: vector(0, 0, 0),
		quaternion: {
			w: 1, x: 0, y: 0, z: 0,
			set(x, y, z, w) { Object.assign(this, { w, x, y, z }); }
		},
		scale: vector(1, 1, 1),
		traverse(callback) { callback(mesh); },
		userData: {}
	};
	const session = {
		project: {
			authoring3d: {
				models: [{ id: 'hero', target: 'player' }]
			}
		},
		runtime: { model },
		time: 0
	};
	session.commits = [];
	session.commands = {
		commitProject(project, label) {
			session.commits.push({ label, previous: session.project });
			session.project = project;
		}
	};
	session.seek = () => {
		applyMovieScene3dAuthoring(
			model,
			session.project.authoring3d.models[0]
		);
	};
	return { mesh, model, position, session };
}

test('scene3d transform is committed and survives frame reapplication', () => {
	const { model, session } = fixture();
	const api = createMovieStudioScene3dDomain(session);
	const result = api.transform({
		position: [2, 3, 4],
		rotation: [0, Math.PI / 2, 0],
		scale: [2, 2, 2]
	});
	assert.equal(session.commits[0].label, 'Transform 3D object');
	assert.deepEqual(session.project.authoring3d.models[0].manualTransform.position, [2, 3, 4]);
	assert.deepEqual(result.position, [2, 3, 4]);
	model.position.set(99, 99, 99);
	session.seek();
	assert.deepEqual([model.position.x, model.position.y, model.position.z], [2, 3, 4]);
});

test('scene3d raw vertex edits are committed and survive buffer reset', () => {
	const { position, session } = fixture();
	const api = createMovieStudioScene3dDomain(session);
	api.mode('edit');
	api.selectMesh(0);
	api.selectVertices([0, 2]);
	api.writeVertices([{ index: 0, value: [5, 6, 7] }]);
	assert.equal(session.commits.at(-1).label, 'Edit 3D vertices');
	assert.deepEqual(session.project.authoring3d.models[0].vertexEdits[0], {
		index: 0,
		meshIndex: 0,
		value: [5, 6, 7]
	});
	api.moveVertices([0, 2], [1, 0, -1]);
	assert.equal(session.commits.at(-1).label, 'Move 3D vertices');
	position.array.set([0, 0, 0, 1, 0, 0, 0, 1, 0]);
	session.seek();
	assert.deepEqual([...position.array.slice(0, 3)], [6, 6, 6]);
	assert.deepEqual([...position.array.slice(6, 9)], [1, 1, -1]);
});
