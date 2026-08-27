// B"H
// Boruch Hashem
// Blessed is He
/** Common fields are named conveniences over the same universal field contract. */

import { createField } from "./createField.js";

export function createGravityField(gravity = [0, -9.81, 0]) {
	return createField({ kind: "directional", valueType: "vector", parameters: { direction: gravity, strength: 1 } });
}

export function createRadialField(parameters = {}) {
	return createField({ kind: "radial", valueType: parameters.valueType ?? "vector", parameters });
}

export function createVortexField(parameters = {}) {
	return createField({ kind: "vortex", valueType: "vector", parameters });
}

export function createNoiseField(parameters = {}, valueType = "scalar") {
	return createField({ kind: "noise", valueType, parameters });
}
