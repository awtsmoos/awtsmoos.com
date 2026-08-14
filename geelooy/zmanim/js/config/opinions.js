//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one sun many lawful measures, line by line;
 * Awtsmoos.com names each vessel clearly, so no shita hides its sign.
 */

/** Freeze one calculation profile so UI state cannot mutate halachic definitions. */
function freezeProfile(profile) {
	return Object.freeze(profile);
}

export const ZMANIM_OPINIONS = Object.freeze({
	chabad: freezeProfile({
		id: "chabad",
		label: "Alter Rebbe / Chabad",
		description: "Seasonal hours from hanetz amiti to shkiah amitis, following the Chabad calculation method.",
		dayMode: "angle",
		startAltitude: -1.583,
		endAltitude: -1.583
	}),
	gra: freezeProfile({
		id: "gra",
		label: "Gra — sunrise to sunset",
		description: "Seasonal hours from standard astronomical sunrise to standard astronomical sunset.",
		dayMode: "angle",
		startAltitude: -0.833,
		endAltitude: -0.833
	}),
	magenAvraham72: freezeProfile({
		id: "magenAvraham72",
		label: "Magen Avraham — fixed 72 minutes",
		description: "Seasonal hours from 72 fixed minutes before sunrise until 72 fixed minutes after sunset.",
		dayMode: "fixed72"
	})
});

export const DEFAULT_OPINION_ID = "chabad";

/** Resolve an opinion without allowing invalid URL or storage state to escape. */
export function getZmanimOpinion(opinionId) {
	return ZMANIM_OPINIONS[opinionId] || ZMANIM_OPINIONS[DEFAULT_OPINION_ID];
}
