// B"H
// Boruch Hashem
// Blessed is He
/** Fixed-point mass and momentum reveal floating velocity without changing the atomic source. */

export function normalizeFixedPointGrid3d(input) {
	const values = input?.values;
	const layout = input?.layout;
	const scale = Number(input?.fixedPointScale ?? 1024);
	if (!(values instanceof Int32Array)) {
		throw new TypeError("Fixed-point grid normalization requires Int32Array values.");
	}
	if (!layout || values.length !== layout.cellCount * 4) {
		throw new RangeError("Fixed-point grid values must match the declared cell count.");
	}
	if (!Number.isFinite(scale) || scale <= 0) {
		throw new TypeError("Fixed-point scale must be positive and finite.");
	}
	const normalized = new Float32Array(values.length);
	for (let cell = 0; cell < layout.cellCount; cell += 1) {
		const offset = cell * 4;
		const mass = values[offset];
		if (mass <= 0) continue;
		normalized[offset] = values[offset + 1] / mass;
		normalized[offset + 1] = values[offset + 2] / mass;
		normalized[offset + 2] = values[offset + 3] / mass;
		normalized[offset + 3] = mass / scale;
	}
	return Object.freeze({
		schema: "awtsmoos.normalized-grid-velocity-3d",
		layout,
		values: normalized
	});
}
