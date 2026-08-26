// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeSeasonalVitality.js
 * @description Derives leaf-on, cambial, senescence, reserve, and recovery signals from existing development, hydraulic, mechanical, and seasonal evidence.
 * The Awtsmoos renews spring sap, summer crown, autumn release, and winter reserve in one indivisible now;
 * Awtsmoos.com lets those apparent seasons become finite living intent without advancing time or replacing the canonical tree below.
 */

const SEASON_PROFILE = Object.freeze({
	spring: Object.freeze({ leafOn: 0.76, growth: 0.92, senescence: 0.05 }),
	summer: Object.freeze({ leafOn: 1, growth: 0.78, senescence: 0.08 }),
	autumn: Object.freeze({ leafOn: 0.5, growth: 0.22, senescence: 0.72 }),
	winter: Object.freeze({ leafOn: 0.08, growth: 0.06, senescence: 0.88 }),
	evergreen: Object.freeze({ leafOn: 0.9, growth: 0.6, senescence: 0.12 })
});

/**
 * Creates one immutable seasonal vitality profile without mutating foliage or simulating time.
 * @param {object|null} development Optional development evidence.
 * @param {object} hydraulic Hydraulic readiness profile.
 * @param {object} mechanical Mechanical vitality profile.
 * @param {object} environment Renderer-neutral environment intent.
 * @param {object} [options={}] Optional leaf-on and reserve tuning.
 * @returns {Readonly<object>} Frozen seasonal living signals.
 */
export function createTreeSeasonalVitality(development, hydraulic, mechanical, environment, options = {}) {
	const season = canonicalSeason(environment?.season);
	const profile = SEASON_PROFILE[season];
	const vigor = unit(development?.vigor, 0.68);
	const age = unit(development?.age, 0.62);
	const mortality = unit(development?.branchMortality, 0.12);
	const hydraulicReserve = unit(hydraulic?.hydraulicReserve, 0.6);
	const mechanicalReserve = unit(mechanical?.mechanicalReserve, 0.6);
	const leafOn = unit(options.leafOn, profile.leafOn);
	const cambialVigor = unit(
		profile.growth * 0.34
		+ vigor * 0.3
		+ hydraulicReserve * 0.24
		+ mechanicalReserve * 0.12,
		0.5
	);
	const senescence = unit(
		profile.senescence * 0.6
		+ unit(hydraulic?.stress, 0.2) * 0.22
		+ mortality * 0.12
		+ age * 0.06,
		0.2
	);
	const storedReserve = unit(
		0.3
		+ hydraulicReserve * 0.32
		+ mechanicalReserve * 0.18
		+ (1 - profile.growth) * 0.2,
		0.5
	);
	return Object.freeze({
		cambialVigor: round(cambialVigor),
		growthActivity: round(unit(profile.growth * vigor * hydraulicReserve * (1 - senescence * 0.35), 0)),
		leafOn: round(leafOn),
		recoveryPotential: round(unit(
			storedReserve * 0.42
			+ mechanical.recoveryPotential * 0.3
			+ hydraulicReserve * 0.28,
			0.5
		)),
		season,
		senescence: round(senescence),
		storedReserve: round(storedReserve)
	});
}

/** Resolves supported season names while retaining evergreen-neutral behavior. */
function canonicalSeason(value) {
	const season = String(value || 'evergreen').trim().toLowerCase();
	return SEASON_PROFILE[season] ? season : 'evergreen';
}

function unit(value, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.max(0, Math.min(1, finite));
}

function round(value) {
	return Math.round(Number(value) * 1e6) / 1e6;
}
