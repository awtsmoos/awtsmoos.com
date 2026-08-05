// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseEntryPolicy.js
 * @description Derives one deterministic facade-to-path approach from real cottage dimensions.
 * The Awtsmoos leads every dwelling from inner room to outer road in measured grace;
 * Awtsmoos.com keeps threshold, drainage, opening, and yaw aligned to one architectural face.
 */

const FACADE_RATIO = 0.515;
const FACADE_OVERLAP = 0.18;
const BASE_APPROACH_LENGTH = 3.4;

export function canonicalHouseEntry(architecture, variant = 0) {
	const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
	const facadeZ = architecture.depth * FACADE_RATIO;
	const length = BASE_APPROACH_LENGTH + safeVariant % 3 * 0.18;
	const width = Math.max(
		2.2,
		Math.min(3.6, architecture.width * 0.22)
	);
	const innerZ = facadeZ - FACADE_OVERLAP;
	const outerZ = innerZ + length;
	return Object.freeze({
		centerZ: (innerZ + outerZ) / 2,
		drainageZ: outerZ + 0.24,
		facadeZ,
		innerZ,
		length,
		outerZ,
		width
	});
}

export function houseEntryWorldPoint(house, localZ) {
	const cosine = Math.cos(house.yaw);
	const sine = Math.sin(house.yaw);
	return Object.freeze({
		x: house.x + localZ * sine,
		z: house.z + localZ * cosine
	});
}

export function houseEntryEvidence(house) {
	const entry = house.entry || canonicalHouseEntry(house, house.variant);
	return Object.freeze({
		facade: houseEntryWorldPoint(house, entry.facadeZ),
		houseId: house.id,
		inner: houseEntryWorldPoint(house, entry.innerZ),
		outer: houseEntryWorldPoint(house, entry.outerZ),
		yaw: house.yaw
	});
}
