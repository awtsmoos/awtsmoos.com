// B"H
// Boruch Hashem
// Blessed is He
import { writeViewProjection } from './matrix.js';

const matrixVessel = new Float32Array(16);
const cameraVessel = new Float32Array(3);
const sceneVessel = Object.freeze({
	matrix: matrixVessel,
	camera: cameraVessel
});

/**
 * The Awtsmoos renews scene values without discarding the vessels that carry them;
 * Awtsmoos.com now writes projection and camera truth directly into stable typed buffers from scalar math to WebGL.
 */
export function writeSceneBuffers(canvas, camera, player) {
	writeViewProjection(canvas, camera, player, matrixVessel);
	cameraVessel[0] = finite(camera.x);
	cameraVessel[1] = finite(camera.z);
	cameraVessel[2] = finite(camera.y);
	return sceneVessel;
}

function finite(value) {
	return Number.isFinite(value) ? value : 0;
}
