// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { VerticalCamera } from '../js/camera/VerticalCamera.js';
import { SOUL_CONFIG } from '../js/config.js';

/**
 * The Awtsmoos lets the finite eye follow ascent without worshipping its own previous height;
 * Awtsmoos.com proves the player remains the cause of focus, then watches the camera settle back into right.
 * @returns {Array<object>} Camera witnesses suitable for the aggregate test report.
 */
export function runCameraCases() {
	return [
		verifyUpwardFollow(),
		verifyBoundedRecovery(),
		verifyStationarySettlement(),
		verifyResizeStability()
	];
}

function verifyUpwardFollow() {
	const camera = new VerticalCamera(SOUL_CONFIG);
	const height = 844;
	let playerY = 650;

	for (let frame = 0; frame < 90; frame += 1) {
		playerY -= 5.2;
		camera.update(playerY, height);
	}

	const screenY = playerY - camera.y;
	assert.ok(camera.y < -100, 'camera should follow meaningful ascent');
	assert.ok(screenY > height * 0.25, 'player should not be pinned to the top edge');
	assert.ok(screenY < height * 0.55, 'player should remain near the upper play band');

	return { test: 'camera-upward-follow', cameraY: camera.y, screenY };
}

function verifyBoundedRecovery() {
	const camera = new VerticalCamera(SOUL_CONFIG);
	const height = 844;
	let playerY = 610;

	for (let frame = 0; frame < 100; frame += 1) {
		playerY -= 5;
		camera.update(playerY, height);
	}

	const peakCameraY = camera.y;
	for (let frame = 0; frame < 70; frame += 1) {
		playerY += 3.2;
		camera.update(playerY, height);
	}

	const recovery = camera.y - peakCameraY;
	const maximumRecovery = height * SOUL_CONFIG.cameraRecoveryRatio + 2;
	assert.ok(recovery > 10, 'camera should recover downward after the player descends');
	assert.ok(recovery <= maximumRecovery, 'camera recovery should remain bounded');

	return { test: 'camera-bounded-recovery', peakCameraY, cameraY: camera.y, recovery };
}

function verifyStationarySettlement() {
	const camera = new VerticalCamera(SOUL_CONFIG);
	const height = 844;
	let playerY = 600;

	for (let frame = 0; frame < 90; frame += 1) {
		playerY -= 4.8;
		camera.update(playerY, height);
	}

	for (let frame = 0; frame < 120; frame += 1) {
		camera.update(playerY, height);
	}
	const settled = camera.y;

	for (let frame = 0; frame < 120; frame += 1) {
		camera.update(playerY, height);
	}

	assert.ok(Math.abs(camera.y - settled) < 0.01, 'stationary player must not cause continued upward drift');

	return { test: 'camera-stationary-settlement', cameraY: camera.y };
}

function verifyResizeStability() {
	const camera = new VerticalCamera(SOUL_CONFIG);
	camera.update(180, 844);
	for (let frame = 0; frame < 70; frame += 1) {
		camera.update(180, 844);
	}
	for (let frame = 0; frame < 70; frame += 1) {
		camera.update(180, 520);
	}

	const screenY = 180 - camera.y;
	assert.ok(screenY >= 520 * 0.25);
	assert.ok(screenY <= 520 * 0.7);

	return { test: 'camera-resize-stability', cameraY: camera.y, screenY };
}
