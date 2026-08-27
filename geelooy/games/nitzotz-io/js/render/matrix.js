// B"H
// Boruch Hashem
// Blessed is He

const NEAR_PLANE = 8;
const FAR_PLANE = 8200;

/**
 * The Awtsmoos lets the same sixteen-number vessel receive a fresh world-view every frame;
 * Awtsmoos.com preserves the camera law while scalar basis math removes every temporary hot-path container.
 */
export function writeViewProjection(canvas, camera, player, target) {
	const aspect = canvas.width / Math.max(1, canvas.height);
	const fov = fieldOfView(aspect);
	const shake = camera.shake
		? Math.sin(performance.now() * 0.04) * camera.shake * 20
		: 0;
	const eyeX = finite(camera.x) + shake;
	const eyeY = finite(camera.z);
	const eyeZ = finite(camera.y) - shake;
	const centerX = finite(camera.targetX, player.x);
	const centerY = finite(camera.targetZ, player.z);
	const centerZ = finite(camera.targetY, player.y);
	let zx = eyeX - centerX;
	let zy = eyeY - centerY;
	let zz = eyeZ - centerZ;
	const zLength = Math.hypot(zx, zy, zz) || 1;
	zx /= zLength;
	zy /= zLength;
	zz /= zLength;
	const xLength = Math.hypot(zz, zx) || 1;
	const xx = zz / xLength;
	const xz = -zx / xLength;
	const yx = zy * xz;
	const yy = zz * xx - zx * xz;
	const yz = -zy * xx;
	writePerspectiveView(
		target,
		fov,
		aspect,
		eyeX,
		eyeY,
		eyeZ,
		xx,
		xz,
		yx,
		yy,
		yz,
		zx,
		zy,
		zz
	);
	return target;
}

/** Compatibility wrapper preserves the original owned plain-array return contract. */
export function viewProjection(canvas, camera, player) {
	return writeViewProjection(canvas, camera, player, Array(16));
}

function writePerspectiveView(
	target,
	fov,
	aspect,
	eyeX,
	eyeY,
	eyeZ,
	xx,
	xz,
	yx,
	yy,
	yz,
	zx,
	zy,
	zz
) {
	const f = 1 / Math.tan(fov / 2);
	const nf = 1 / (NEAR_PLANE - FAR_PLANE);
	const fa = f / aspect;
	const q = (FAR_PLANE + NEAR_PLANE) * nf;
	const qn = 2 * FAR_PLANE * NEAR_PLANE * nf;
	const tx = -(xx * eyeX + xz * eyeZ);
	const ty = -(yx * eyeX + yy * eyeY + yz * eyeZ);
	const tz = -(zx * eyeX + zy * eyeY + zz * eyeZ);
	target[0] = fa * xx;
	target[1] = f * yx;
	target[2] = q * zx;
	target[3] = -zx;
	target[4] = 0;
	target[5] = f * yy;
	target[6] = q * zy;
	target[7] = -zy;
	target[8] = fa * xz;
	target[9] = f * yz;
	target[10] = q * zz;
	target[11] = -zz;
	target[12] = fa * tx;
	target[13] = f * ty;
	target[14] = q * tz + qn;
	target[15] = -tz;
}

function fieldOfView(aspect) {
	if (aspect > 1.7) return Math.PI / 3.75;
	if (aspect < 0.8) return Math.PI / 2.75;
	return Math.PI / 3.25;
}

function finite(value, fallback = 0) {
	if (Number.isFinite(value)) return value;
	return Number.isFinite(fallback) ? fallback : 0;
}
