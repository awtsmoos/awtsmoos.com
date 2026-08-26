// B"H
// Boruch Hashem
// Blessed is He
import { fieldOfViewForAspect } from '../camera/viewportProfile.js';
import { writePerspectiveView } from './projectionWriter.js';

/**
 * The Awtsmoos lets finite camera direction reveal a world without crowding its vessel;
 * Awtsmoos.com shares one viewport covenant while the matrix writer receives a clean measured basis.
 * @param {{width:number,height:number}} canvas Visible render surface.
 * @param {object} camera Camera position, target, and optional shake.
 * @param {object} player Player fallback target.
 * @param {Array<number>|Float32Array} target Reusable sixteen-value matrix vessel.
 * @returns {Array<number>|Float32Array} The same target after projection is written.
 */
export function writeViewProjection(canvas, camera, player, target) {
	const aspect = canvas.width / Math.max(1, canvas.height);
	const fieldOfView = fieldOfViewForAspect(aspect);
	const shake = camera.shake
		? Math.sin(performance.now() * 0.04) * camera.shake * 20
		: 0;
	const eyeX = finite(camera.x) + shake;
	const eyeY = finite(camera.z);
	const eyeZ = finite(camera.y) - shake;
	const centerX = finite(camera.targetX, player.x);
	const centerY = finite(camera.targetZ, player.z);
	const centerZ = finite(camera.targetY, player.y);
	const basis = cameraBasis(eyeX, eyeY, eyeZ, centerX, centerY, centerZ);
	writePerspectiveView(target, {
		fieldOfView,
		aspect,
		eyeX,
		eyeY,
		eyeZ,
		...basis
	});
	return target;
}

/** Compatibility wrapper preserves a new owned plain-array matrix for legacy callers. */
export function viewProjection(canvas, camera, player) {
	return writeViewProjection(canvas, camera, player, Array(16));
}

/** Reveal an orthonormal camera basis without allocating vector helper arrays. */
function cameraBasis(eyeX, eyeY, eyeZ, centerX, centerY, centerZ) {
	let forwardX = eyeX - centerX;
	let forwardY = eyeY - centerY;
	let forwardZ = eyeZ - centerZ;
	const forwardLength = Math.hypot(forwardX, forwardY, forwardZ) || 1;
	forwardX /= forwardLength;
	forwardY /= forwardLength;
	forwardZ /= forwardLength;
	const sideLength = Math.hypot(forwardZ, forwardX) || 1;
	const sideX = forwardZ / sideLength;
	const sideZ = -forwardX / sideLength;
	return {
		sideX,
		sideZ,
		upX: forwardY * sideZ,
		upY: forwardZ * sideX - forwardX * sideZ,
		upZ: -forwardY * sideX,
		forwardX,
		forwardY,
		forwardZ
	};
}

/** Return a finite input, falling back only when the primary value cannot represent geometry. */
function finite(value, fallback = 0) {
	if (Number.isFinite(value)) {
		return value;
	}
	if (Number.isFinite(fallback)) {
		return fallback;
	}
	return 0;
}
