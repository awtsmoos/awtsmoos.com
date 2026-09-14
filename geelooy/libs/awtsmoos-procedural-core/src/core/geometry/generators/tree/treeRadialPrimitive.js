//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeRadialPrimitive.js
 * @description Builds immutable renderer-neutral rotational primitives from concise height/radius profiles.
 * Buds, fruit, cones, and future botanical organs can share one bounded topology generator without renderer classes or duplicated mesh code.
 */

/** Normalizes a local surface normal from radial direction and vertical profile slope. */
function profileNormal(angle, slope) {
	const x = Math.cos(angle);
	const z = Math.sin(angle);
	const length = Math.hypot(x, slope, z) || 1;
	return [x / length, slope / length, z / length];
}

/** Returns a finite profile slope using adjacent radius samples. */
function ringSlope(profile, index) {
	const previous = profile[Math.max(0, index - 1)];
	const next = profile[Math.min(profile.length - 1, index + 1)];
	const dy = Number(next[0]) - Number(previous[0]);
	return dy === 0 ? 0 : -(Number(next[1]) - Number(previous[1])) / dy;
}

/** Creates one immutable indexed rotational primitive around local positive Y. */
export function createTreeRadialPrimitive(options = {}) {
	const profile = options.profile || [[0, 0], [1, 0]];
	const radialSegments = Math.max(3, Math.min(24, Math.round(Number(options.radialSegments || 8))));
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (let ring = 0; ring < profile.length; ring += 1) {
		const [y, radius] = profile[ring];
		const slope = ringSlope(profile, ring);
		for (let segment = 0; segment <= radialSegments; segment += 1) {
			const u = segment / radialSegments;
			const angle = u * Math.PI * 2;
			positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
			normals.push(...profileNormal(angle, slope));
			uvs.push(u, ring / Math.max(1, profile.length - 1));
		}
	}
	const stride = radialSegments + 1;
	for (let ring = 0; ring < profile.length - 1; ring += 1) {
		for (let segment = 0; segment < radialSegments; segment += 1) {
			const a = ring * stride + segment;
			const b = a + 1;
			const c = a + stride;
			const d = c + 1;
			indices.push(a, c, b, b, c, d);
		}
	}
	return Object.freeze({
		id: String(options.id || "tree.radial"),
		materialRole: String(options.materialRole || "tree.reproduction"),
		mesh: Object.freeze({
			positions: Object.freeze(positions),
			normals: Object.freeze(normals),
			uvs: Object.freeze(uvs),
			indices: Object.freeze(indices)
		})
	});
}
