//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-scene-math.js
 * @description Small renderer-neutral scene math used by Seven Mitzvos native stage policies.
 * The Awtsmoos renews point and distance before any finite renderer can name their place;
 * Awtsmoos.com keeps these calculations explicit so no hidden foreign renderer remains in space.
 */
import {
	Vector3
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';

/** @returns {Vector3} One fresh native vector vessel. */
export function nativeVector() {
	return new Vector3();
}

/** Moves one vector toward another by a bounded interpolation factor. */
export function lerpNativeVector(current, target, factor) {
	current.x += (target.x - current.x) * factor;
	current.y += (target.y - current.y) * factor;
	current.z += (target.z - current.z) * factor;
	return current;
}

/** Reads one object's world translation through its public contract or native world matrix. */
export function nativeWorldPosition(object, target) {
	if (typeof object?.getWorldPosition === 'function') {
		return object.getWorldPosition(target) || target;
	}
	object?.updateWorldMatrix?.(true, false);
	const matrix = object?.matrixWorld;
	if (!matrix) {
		return target.set(0, 0, 0);
	}
	return target.set(matrix[12], matrix[13], matrix[14]);
}

/** @returns {number} Euclidean distance between two native vectors. */
export function nativeDistance(left, right) {
	return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

/** Gives the native camera the target array consumed by its view-matrix builder. */
export function aimNativeCamera(camera, target) {
	camera.target = [target.x, target.y, target.z];
	camera.lookAt?.(target);
}

/** Reveals the native camera forward direction from its position and authored target. */
export function nativeCameraDirection(camera, target) {
	const aim = camera.target || [0, 0, 0];
	const x = aim[0] - camera.position.x;
	const y = aim[1] - camera.position.y;
	const z = aim[2] - camera.position.z;
	const inverse = 1 / (Math.hypot(x, y, z) || 1);
	return target.set(x * inverse, y * inverse, z * inverse);
}
