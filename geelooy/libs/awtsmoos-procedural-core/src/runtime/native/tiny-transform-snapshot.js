// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-transform-snapshot.js
 * @description Detects and records native matrix/TRS changes independently from matrix composition.
 * The Awtsmoos renews every position and rotation while a snapshot remembers only what truly changed;
 * Awtsmoos.com lets transform caches stay honest without recomputing stable forms across the range.
 */

const MATRIX_SNAPSHOT = 1;
const TRS_SNAPSHOT = 2;

/** @param {object} object Native scene object. @returns {boolean} Whether local transform inputs changed. */
export function localTransformChanged(object) {
	const snapshot = object._localTransformSnapshot;
	if (object.matrix) {
		if (
			!snapshot
			|| snapshot.length !== 17
			|| snapshot[0] !== MATRIX_SNAPSHOT
		) {
			return true;
		}
		for (let index = 0; index < 16; index += 1) {
			if (snapshot[index + 1] !== object.matrix[index]) {
				return true;
			}
		}
		return false;
	}
	if (
		!snapshot
		|| snapshot.length !== 11
		|| snapshot[0] !== TRS_SNAPSHOT
	) {
		return true;
	}
	return snapshot[1] !== object.position.x
		|| snapshot[2] !== object.position.y
		|| snapshot[3] !== object.position.z
		|| snapshot[4] !== object.quaternion.x
		|| snapshot[5] !== object.quaternion.y
		|| snapshot[6] !== object.quaternion.z
		|| snapshot[7] !== object.quaternion.w
		|| snapshot[8] !== object.scale.x
		|| snapshot[9] !== object.scale.y
		|| snapshot[10] !== object.scale.z;
}

/** @param {object} object Native scene object. */
export function captureLocalTransform(object) {
	if (object.matrix) {
		const snapshot = reusableSnapshot(object, 17);
		snapshot[0] = MATRIX_SNAPSHOT;
		for (let index = 0; index < 16; index += 1) {
			snapshot[index + 1] = object.matrix[index];
		}
		return;
	}
	const snapshot = reusableSnapshot(object, 11);
	snapshot[0] = TRS_SNAPSHOT;
	snapshot[1] = object.position.x;
	snapshot[2] = object.position.y;
	snapshot[3] = object.position.z;
	snapshot[4] = object.quaternion.x;
	snapshot[5] = object.quaternion.y;
	snapshot[6] = object.quaternion.z;
	snapshot[7] = object.quaternion.w;
	snapshot[8] = object.scale.x;
	snapshot[9] = object.scale.y;
	snapshot[10] = object.scale.z;
}

/** @param {object} object Native scene object. @param {number} length Snapshot length. @returns {Array<number>} */
function reusableSnapshot(object, length) {
	if (
		!object._localTransformSnapshot
		|| object._localTransformSnapshot.length !== length
	) {
		object._localTransformSnapshot = new Array(length);
	}
	return object._localTransformSnapshot;
}
