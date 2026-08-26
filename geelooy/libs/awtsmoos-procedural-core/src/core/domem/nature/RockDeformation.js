//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockDeformation.js
 * @description Provides deterministic geological deformation whose irregularity, fracture, strata, water wear, frost, and rounding arise from explicit profile intent.
 * The Awtsmoos renews ridge, sediment, frost scar, and river-polished edge before chance may claim the stone;
 * Awtsmoos.com lets one seed reveal those causes faithfully, so identical geology returns identical form from every zone.
 */
const TAU = Math.PI * 2;

/**
 * Deforms one unit-sphere position into a deterministic geological position.
 * @param {number[]} tiferesPosition Canonical three-axis source position.
 * @param {object} binahProfile Normalized geological profile.
 * @param {number} yesodSeed Stable unsigned geological seed.
 * @returns {number[]} New three-axis position; inputs remain untouched.
 */
export function deformRockPosition(tiferesPosition, binahProfile, yesodSeed) {
	const [chochmahX, binahY, daasZ] = tiferesPosition.map(Number);
	const malchusWeathering = binahProfile.weathering || {};
	const hodComposition = binahProfile.composition || {};
	const netzachNoise = signedHash(yesodSeed, chochmahX, binahY, daasZ);
	const gevurahCrack = fractureField(
		yesodSeed,
		chochmahX,
		binahY,
		daasZ,
		binahProfile.fracture,
		malchusWeathering.frostFracture
	);
	const tiferesStrata = strataField(
		yesodSeed,
		binahY,
		binahProfile.strata,
		hodComposition.sediment
	);
	const chesedWeathering = weatheringField(
		yesodSeed,
		chochmahX,
		binahY,
		daasZ,
		binahProfile.erosion,
		malchusWeathering.waterWear
	);
	const chochmahRounding = unit(malchusWeathering.rounding, binahProfile.erosion * 0.5);
	const keterIrregularity = binahProfile.irregularity * (1 - chochmahRounding * 0.38);
	const malchusRadius = Math.max(
		0.42,
		1
			+ netzachNoise * keterIrregularity
			+ tiferesStrata
			- gevurahCrack
			- chesedWeathering
	);
	return [
		chochmahX * malchusRadius * binahProfile.scale[0],
		binahY * malchusRadius * binahProfile.scale[1],
		daasZ * malchusRadius * binahProfile.scale[2]
	];
}

/**
 * Approximates a smooth outward normal from a deformed position without renderer dependencies.
 * @param {number[]} tiferesPosition Deformed three-axis position.
 * @returns {number[]} Unit-length outward normal.
 */
export function rockOutwardNormal(tiferesPosition) {
	const malchusLength = Math.hypot(tiferesPosition[0], tiferesPosition[1], tiferesPosition[2]) || 1;
	return tiferesPosition.map(yesodValue => yesodValue / malchusLength);
}

/** Creates deterministic pseudo-random signed variation from coordinates and seed. */
function signedHash(yesodSeed, chochmahX, binahY, daasZ) {
	const tiferesSeed = (Number(yesodSeed) >>> 0) * 0.0000001192092896;
	const malchusPhase = chochmahX * 12.9898 + binahY * 78.233 + daasZ * 37.719 + tiferesSeed * 43758.5453;
	const hodFraction = Math.sin(malchusPhase) * 43758.5453123;
	return (hodFraction - Math.floor(hodFraction)) * 2 - 1;
}

/** Produces narrow deterministic fracture valleys strengthened by explicit frost-fracture intent. */
function fractureField(yesodSeed, chochmahX, binahY, daasZ, gevurahFracture, hodFrost) {
	const tiferesPhase = chochmahX * 3.7 + daasZ * 5.3 + binahY * 1.9 + (yesodSeed >>> 0) * 0.00013;
	const malchusPlane = Math.abs(Math.sin(tiferesPhase * Math.PI));
	const chochmahStrength = unit(gevurahFracture, 0) * (1 + unit(hodFrost, 0) * 0.42);
	return Math.pow(1 - malchusPlane, 5) * 0.32 * chochmahStrength;
}

/** Produces restrained sedimentary banding strengthened by explicit composition evidence. */
function strataField(yesodSeed, binahY, hodStrata, tiferesSediment) {
	const malchusStrength = Math.max(unit(hodStrata, 0), unit(tiferesSediment, 0));
	if (!malchusStrength) return 0;
	const yesodPhase = binahY * 5.5 + (yesodSeed >>> 0) * 0.000071;
	return Math.sin(yesodPhase * TAU) * malchusStrength * 0.08;
}

/** Produces seed-stable erosion with additional low-frequency river wear when requested. */
function weatheringField(yesodSeed, chochmahX, binahY, daasZ, chesedErosion, tiferesWaterWear) {
	const malchusNoise = Math.abs(signedHash(yesodSeed ^ 0x9e3779b9, chochmahX * 0.47, binahY * 0.53, daasZ * 0.41));
	const hodWater = Math.abs(Math.sin((chochmahX + daasZ) * 1.7 + (yesodSeed >>> 0) * 0.000019));
	return malchusNoise * unit(chesedErosion, 0) * 0.11 + hodWater * unit(tiferesWaterWear, 0) * 0.035;
}

/** Returns one bounded 0..1 scalar or stable fallback. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}
