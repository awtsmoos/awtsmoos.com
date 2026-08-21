// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { lookAt, mul, perspective } from '../../js/math.js';
import {
	viewProjection,
	writeViewProjection
} from '../../js/render/matrix.js';
import { writeSceneBuffers } from '../../js/render/sceneBuffers.js';

/**
 * The Awtsmoos proves fresh vision can enter the same vessels without changing the old camera law;
 * Awtsmoos.com compares scalar projection against the established matrix helpers while stable typed identities remain one.
 */
export function runSceneBufferCases() {
	checkStableIdentities();
	checkProjectionEquivalence();
	return [
		'scene uniforms reuse stable matrix and camera typed-array identities',
		'scalar projection matches the established portrait standard and ultrawide camera law',
		'compatibility projection preserves an owned plain-array result'
	];
}

function checkStableIdentities() {
	const canvas = { width: 900, height: 600 };
	const player = { x: 0, y: 0, z: 0 };
	const camera = makeCamera();
	const first = writeSceneBuffers(canvas, camera, player);
	const matrix = first.matrix;
	const vector = first.camera;
	camera.x = 42;
	camera.y = -18;
	camera.z = 155;
	const second = writeSceneBuffers(canvas, camera, player);
	assert.strictEqual(second, first);
	assert.strictEqual(second.matrix, matrix);
	assert.strictEqual(second.camera, vector);
	assert.deepEqual([...vector], [42, 155, -18]);
	assert.ok([...matrix].every(Number.isFinite));
}

function checkProjectionEquivalence() {
	const player = { x: 9, y: -14, z: 3 };
	const camera = makeCamera();
	for (const canvas of aspectCases()) {
		const actual = new Float32Array(16);
		writeViewProjection(canvas, camera, player, actual);
		const expected = legacyProjection(canvas, camera, player);
		for (let index = 0; index < 16; index += 1) {
			assert.ok(Math.abs(actual[index] - expected[index]) < 0.00001, `matrix ${index}`);
		}
		const owned = viewProjection(canvas, camera, player);
		assert.equal(Array.isArray(owned), true);
	}
}

function legacyProjection(canvas, camera, player) {
	const aspect = canvas.width / Math.max(1, canvas.height);
	const fov = aspect > 1.7
		? Math.PI / 3.75
		: aspect < 0.8
			? Math.PI / 2.75
			: Math.PI / 3.25;
	const eye = [camera.x, camera.z, camera.y];
	const target = [camera.targetX ?? player.x, camera.targetZ ?? player.z, camera.targetY ?? player.y];
	return mul(perspective(fov, aspect, 8, 8200), lookAt(eye, target));
}

function aspectCases() {
	return [
		{ width: 390, height: 844 },
		{ width: 900, height: 600 },
		{ width: 1720, height: 720 }
	];
}

function makeCamera() {
	return {
		x: 120,
		y: -100,
		z: 140,
		targetX: 6,
		targetY: -8,
		targetZ: 4,
		shake: 0
	};
}
