// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-quaternion.js
 * @description Writes one normalized quaternion interpolation into a reusable vessel.
 * The Awtsmoos turns without division; Awtsmoos.com reveals that rotation through a
 * stable destination whose identity survives every sampled instant.
 */

export function slerpQuaternionInto(
	output,
	ax,
	ay,
	az,
	aw,
	bx,
	by,
	bz,
	bw,
	amount
) {
	let cosine = ax * bx + ay * by + az * bz + aw * bw;
	if (cosine < 0) {
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
		cosine = -cosine;
	}
	if (cosine > 0.9995) {
		return normalizeInto(
			output,
			ax + (bx - ax) * amount,
			ay + (by - ay) * amount,
			az + (bz - az) * amount,
			aw + (bw - aw) * amount
		);
	}
	const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
	const sine = Math.sin(angle);
	const leftWeight = Math.sin((1 - amount) * angle) / sine;
	const rightWeight = Math.sin(amount * angle) / sine;
	return normalizeInto(
		output,
		ax * leftWeight + bx * rightWeight,
		ay * leftWeight + by * rightWeight,
		az * leftWeight + bz * rightWeight,
		aw * leftWeight + bw * rightWeight
	);
}

function normalizeInto(output, x, y, z, w) {
	const scale = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
	output[0] = x * scale;
	output[1] = y * scale;
	output[2] = z * scale;
	output[3] = w * scale;
	return output;
}
