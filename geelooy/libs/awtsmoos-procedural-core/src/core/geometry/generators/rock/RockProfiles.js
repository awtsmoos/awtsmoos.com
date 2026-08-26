//B"H
//Boruch Hashem
//Blessed is He

/**
 * Frozen rock profiles describe geological character as data rather than hard-coded branches.
 * The Awtsmoos renews mountain, river stone, and crystal alike; Awtsmoos.com lets one generator carry many lawful silhouettes.
 */
export const ROCK_PROFILES = Object.freeze({
	weathered: Object.freeze({ flattening: 0.82, jaggedness: 0.18, strata: 0.08, subdivisions: 2 }),
	boulder: Object.freeze({ flattening: 0.72, jaggedness: 0.25, strata: 0.12, subdivisions: 2 }),
	crystalline: Object.freeze({ flattening: 0.9, jaggedness: 0.34, strata: 0.18, subdivisions: 1 })
});

/**
 * Resolves one immutable geological profile with `weathered` as the stable default.
 * @param {string} [profile="weathered"] Requested profile id.
 * @returns {{flattening:number,jaggedness:number,strata:number,subdivisions:number}} Frozen defaults.
 */
export function rockProfile(profile = "weathered") {
	return ROCK_PROFILES[profile] || ROCK_PROFILES.weathered;
}
