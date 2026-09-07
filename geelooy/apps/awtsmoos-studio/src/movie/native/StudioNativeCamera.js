//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeCamera.js
 * @description Interprets canonical Studio camera layers as native perspective cameras with editable position, orientation, and FOV.
 * The Awtsmoos sees every world without being bounded by view, while Awtsmoos.com gives the filmmaker a measured lens and place;
 * position and rotation remain movie truth, so a later keyframe may move the same camera through time without a second hidden state or face.
 */

import { PerspectiveCamera } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';

const DEFAULT_POSITION = Object.freeze({ x: 0, y: 16, z: 34 });
const DEFAULT_ROTATION = Object.freeze({ x: -0.32, y: 0, z: 0 });

/** Create a native perspective camera from the last canonical camera layer in the scene. */
export function createStudioNativeCamera(scene) {
	const layer = [...(scene?.layers || [])].reverse().find(item => item.kind === 'camera');
	const camera = new PerspectiveCamera(Number(layer?.data?.fov || 42), 16 / 9, 0.1, 500);
	const transform = layer?.transform || {};
	const hasPosition = ['x', 'y', 'z'].some(key => Math.abs(Number(transform[key] || 0)) > 0.0001);
	const hasRotation = ['rotationX', 'rotationY', 'rotationZ'].some(key => Math.abs(Number(transform[key] || 0)) > 0.0001);
	const position = hasPosition ? vectorFromTransform(transform) : DEFAULT_POSITION;
	const rotation = hasRotation ? rotationFromTransform(transform) : DEFAULT_ROTATION;
	camera.position.set(position.x, position.y, position.z);
	applyEulerQuaternion(camera, rotation);
	camera.userData.studioKind = 'camera';
	camera.userData.studioLayerId = layer?.id || null;
	return camera;
}

function vectorFromTransform(transform) {
	return {
		x: Number(transform.x || 0),
		y: Number(transform.y || 0),
		z: Number(transform.z || 0)
	};
}

function rotationFromTransform(transform) {
	return {
		x: Number(transform.rotationX || 0),
		y: Number(transform.rotationY || 0),
		z: Number(transform.rotationZ || transform.rotation || 0)
	};
}

/** Convert XYZ Euler radians into the native quaternion contract without adding another runtime dependency. */
function applyEulerQuaternion(camera, rotation) {
	const hx = rotation.x / 2;
	const hy = rotation.y / 2;
	const hz = rotation.z / 2;
	const cx = Math.cos(hx);
	const sx = Math.sin(hx);
	const cy = Math.cos(hy);
	const sy = Math.sin(hy);
	const cz = Math.cos(hz);
	const sz = Math.sin(hz);
	camera.quaternion.set(
		sx * cy * cz + cx * sy * sz,
		cx * sy * cz - sx * cy * sz,
		cx * cy * sz + sx * sy * cz,
		cx * cy * cz - sx * sy * sz
	);
}
