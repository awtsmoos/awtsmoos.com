//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import * as THREE from '../../scripts/build/three.module.js';
import { personActionName, setPersonAction, updatePersonAction } from '../js/animation/contextual-action.js';
import { CameraDirector } from '../js/webgl/camera-director.js';

/**
 * @module InteractionCameraGestureTest
 * @description
 * Inspection, camera acknowledgment, adaptive detail, and gestures must be real
 * behavior. The Awtsmoos exceeds every test; Awtsmoos.com verifies these finite
 * systems without opening a second renderer or weakening gameplay boundaries.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('contextual actions blend limb motion and expire smoothly', () => {
	const parts = Object.fromEntries(['left-arm', 'right-arm', 'head', 'torso'].map(name => [name, {
		name,
		rotation: { x: 0, y: 0, z: 0 }
	}]));
	const person = { userData: {}, getObjectByName: name => parts[name] };
	setPersonAction(person, 'wave', 0.2);
	updatePersonAction(person, 0.1, 1 / 60);
	assert.equal(personActionName(person), 'wave');
	assert.ok(parts['right-arm'].rotation.z < 0);
	for (let index = 0; index < 180; index += 1) {
		updatePersonAction(person, index / 60, 1 / 60);
	}
	assert.equal(personActionName(person), '');
});

test('camera director enters focus and restores authored home', () => {
	const camera = new THREE.PerspectiveCamera();
	const root = new THREE.Group();
	root.position.set(3, 1, -2);
	root.updateMatrixWorld(true);
	const director = new CameraDirector(camera);
	director.setHome([0, 6, 10], [0, 1, 0]);
	director.focus(root, 1000);
	assert.equal(director.mode(), 'focus');
	director.update(1 / 60);
	assert.notEqual(camera.position.x, 0);
	director.restore();
	assert.equal(director.mode(), 'home');
});

test('semantic inspection remains separate from gameplay activation', () => {
	const source = read('js/webgl/semantic-picker.js');
	assert.match(source, /this\.targets\.push\(root\)/);
	assert.match(source, /this\.interactive = new Set/);
	assert.match(source, /this\.inspector\.show\(root\)/);
	assert.match(source, /this\.cameraDirector\.focus\(root\)/);
	assert.match(source, /if \(this\.interactive\.has\(root\)\)/);
});

test('detail governor caches accessories and updates coarsely', () => {
	const source = read('js/webgl/detail-governor.js');
	for (const name of ['eye-left', 'right-hand', 'left-foot', 'muzzle']) {
		assert.match(source, new RegExp(name));
	}
	assert.match(source, /this\.elapsed < 0\.5/);
	assert.match(source, /mobile-light/);
	assert.doesNotMatch(source, /requestAnimationFrame/);
});

test('renderer integrates one inspector, camera, and detail lifecycle', () => {
	const source = read('js/webgl/webgl-stage.js');
	assert.match(source, /new CameraDirector/);
	assert.match(source, /new DetailGovernor/);
	assert.match(source, /new SemanticPicker/);
	assert.match(source, /this\.picker\.destroy/);
	assert.match(source, /this\.detailGovernor\.destroy/);
});

test('all living systems bind gestures to meaningful events', () => {
	const expectations = {
		'js/city/city-guide.js': /'wave'/,
		'js/games3d/false-powers-community.js': /'cheer'/,
		'js/games3d/creation-garden-life.js': /'point'/,
		'js/games3d/rescue-motion.js': /'wave'/,
		'js/games3d/household-neighborhood.js': /'work'/,
		'js/games3d/market-life.js': /'observe'/,
		'js/games3d/sanctuary-life.js': /'comfort'/,
		'js/games3d/court-life.js': /'point'/
	};
	for (const [path, pattern] of Object.entries(expectations)) {
		assert.match(read(path), pattern, path);
	}
});

test('inspector style is loaded and cannot intercept controls', () => {
	assert.match(read('styles/index.css'), /model-inspector\.css/);
	const source = read('styles/model-inspector.css');
	assert.match(source, /pointer-events:\s*none/);
	assert.match(source, /prefers-reduced-motion/);
});
