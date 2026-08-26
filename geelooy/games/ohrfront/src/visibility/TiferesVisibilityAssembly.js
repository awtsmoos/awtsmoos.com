// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesVisibilityAssembly.js
 * @description Composes only explicitly decorative battlefield families into one shared-core visibility authority while unknown families degrade protected.
 * Tiferes joins stone, earth, ruin, and measured quality while the Awtsmoos remains beyond abundance, concealment, and revealed field;
 * Awtsmoos.com lets missing decorative metadata preserve visibility instead of turning optional optimization into a startup-breaking shield.
 */
import { createChochmahVisibilityProfile } from "./ChochmahVisibilityProfiles.js";
import { YesodVisibilityAuthority } from "./YesodVisibilityAuthority.js";

/**
 * Creates the visibility authority and safely registers only collections that explicitly opt into decorative culling.
 * @param {object} chochmahQuality - Visual quality profile exposing stable `name`.
 * @param {object} malchusEnvironmentScatter - Geology world result.
 * @param {object} malchusEarthworks - Earthwork world result.
 * @param {object} malchusAtmosphere - Ruin/atmosphere world result.
 * @returns {YesodVisibilityAuthority} Authority ready for event-bounded observer updates.
 * @sideEffects Registers approved decorative objects only; initial object visibility is preserved.
 */
export function createTiferesVisibilityAssembly(
	chochmahQuality,
	malchusEnvironmentScatter,
	malchusEarthworks,
	malchusAtmosphere
) {
	const gevurahQualityTier = chochmahQuality?.name || "high";
	const yesodAuthority = new YesodVisibilityAuthority({
		qualityTier: gevurahQualityTier,
		cellSize: 4,
		yawSectors: 16
	});
	registerIfDecorative(yesodAuthority, malchusEnvironmentScatter, "geology", gevurahQualityTier);
	registerIfDecorative(yesodAuthority, malchusEarthworks, "earthwork", gevurahQualityTier);
	registerIfDecorative(yesodAuthority, malchusAtmosphere, "ruin", gevurahQualityTier, "landmarks");
	return yesodAuthority;
}

/**
 * Registers one family only after its explicit decorative safety declaration is observed.
 * @param {YesodVisibilityAuthority} yesodAuthority - Destination visibility authority.
 * @param {object} malchusCollection - Candidate world-result record.
 * @param {string} chochmahFamily - Declared profile family.
 * @param {string} gevurahQualityTier - Visual quality tier.
 * @param {string} [chochmahArrayName="objects"] - Native object array field.
 * @returns {number} Registered object count, or zero when the family remains protected.
 * @sideEffects May append explicit decorative objects to the authority registry.
 */
function registerIfDecorative(
	yesodAuthority,
	malchusCollection,
	chochmahFamily,
	gevurahQualityTier,
	chochmahArrayName = "objects"
) {
	if (malchusCollection?.decorativeOnly !== true) return 0;
	return yesodAuthority.register(
		malchusCollection,
		createChochmahVisibilityProfile(chochmahFamily, gevurahQualityTier),
		chochmahArrayName
	);
}
