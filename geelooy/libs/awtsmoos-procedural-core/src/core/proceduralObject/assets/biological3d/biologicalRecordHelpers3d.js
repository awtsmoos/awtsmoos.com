// B"H
// Boruch Hashem
// Blessed is He
/** Shared biological record helpers preserve growth, scale, metadata, and machine identity. */

import { cloneManifestMetadata } from "../../foundation/canonical/cloneManifestMetadata.js";
import { biologicalVector3d } from "./biologicalVectorMath3d.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

export function biologicalRecordId3d(value, label) {
	if (typeof value !== "string" || !ID_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a machine identifier.`);
	}
	return value;
}

export function biologicalGrowthWindow3d(input = {}) {
	const start = Number(input.start ?? 0);
	const end = Number(input.end ?? 1);
	const maturity = Number(input.maturity ?? 1);
	if (![start, end, maturity].every(Number.isFinite)
		|| start < 0 || end < start || maturity < 0 || maturity > 1) {
		throw new TypeError("Biological growth window must be finite, ordered, and normalized.");
	}
	return Object.freeze({ start, end, maturity });
}

export function biologicalScaleVector3d(value = [1, 1, 1]) {
	const scale = biologicalVector3d(value, [1, 1, 1], "Biological scale");
	if (scale.some(component => component <= 0)) {
		throw new TypeError("Biological scale components must be positive.");
	}
	return scale;
}

export function biologicalMetadata3d(value) {
	return cloneManifestMetadata(value ?? {});
}
