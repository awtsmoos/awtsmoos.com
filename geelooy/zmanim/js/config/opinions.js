//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every measured boundary while each shita receives a named vessel for the day;
 * Awtsmoos.com keeps supported profiles explicit, comparable, and honest about the path by which they weigh.
 */

export const ZMANIM_OPINIONS = Object.freeze({
	chabad: Object.freeze({
		id: "chabad", shortLabel: "Chabad", label: "Alter Rebbe / Chabad", basis: "1.583° true rise → true set",
		description: "Seasonal hours from hanetz amiti to shkiah amitis, using 1.583° solar-center crossings.",
		dayMode: "anchors", startKey: "trueSunrise", endKey: "trueSunset"
	}),
	gra: Object.freeze({
		id: "gra", shortLabel: "Gra", label: "Gra — sunrise to sunset", basis: "Standard rise → set",
		description: "Seasonal hours from standard sunrise to standard sunset.",
		dayMode: "anchors", startKey: "sunrise", endKey: "sunset"
	}),
	magenAvraham72: Object.freeze({
		id: "magenAvraham72", shortLabel: "M.A. 72", label: "Magen Avraham — fixed 72 minutes", basis: "72 min before/after",
		description: "Seasonal day from 72 fixed minutes before sunrise until 72 fixed minutes after sunset.",
		dayMode: "fixed", minutes: 72
	}),
	magenAvraham72Zmaniyos: Object.freeze({
		id: "magenAvraham72Zmaniyos", shortLabel: "M.A. 72z", label: "Magen Avraham — 72 zmaniyos minutes", basis: "72 proportional min before/after",
		description: "Day boundaries extend by 72 proportional minutes, one tenth of that date's sunrise-to-sunset span.",
		dayMode: "zmaniyos", minutes: 72
	}),
	magenAvraham90: Object.freeze({
		id: "magenAvraham90", shortLabel: "M.A. 90", label: "Magen Avraham — fixed 90 minutes", basis: "90 min before/after",
		description: "Seasonal day from 90 fixed minutes before sunrise until 90 fixed minutes after sunset.",
		dayMode: "fixed", minutes: 90
	}),
	magenAvraham90Zmaniyos: Object.freeze({
		id: "magenAvraham90Zmaniyos", shortLabel: "M.A. 90z", label: "Magen Avraham — 90 zmaniyos minutes", basis: "90 proportional min before/after",
		description: "Day boundaries extend by 90 proportional minutes derived from that date's sunrise-to-sunset span.",
		dayMode: "zmaniyos", minutes: 90
	}),
	magenAvraham96: Object.freeze({
		id: "magenAvraham96", shortLabel: "M.A. 96", label: "Magen Avraham — fixed 96 minutes", basis: "96 min before/after",
		description: "Seasonal day from 96 fixed minutes before sunrise until 96 fixed minutes after sunset.",
		dayMode: "fixed", minutes: 96
	}),
	magenAvraham96Zmaniyos: Object.freeze({
		id: "magenAvraham96Zmaniyos", shortLabel: "M.A. 96z", label: "Magen Avraham — 96 zmaniyos minutes", basis: "96 proportional min before/after",
		description: "Day boundaries extend by 96 proportional minutes derived from that date's sunrise-to-sunset span.",
		dayMode: "zmaniyos", minutes: 96
	}),
	magenAvraham16_1: Object.freeze({
		id: "magenAvraham16_1", shortLabel: "M.A. 16.1°", label: "Magen Avraham — 16.1°", basis: "16.1° dawn → 16.1° night",
		description: "Seasonal hours from the morning 16.1° solar depression until the matching evening crossing.",
		dayMode: "anchors", startKey: "alos16_1", endKey: "tzeis16_1"
	})
});

export const DEFAULT_OPINION_ID = "chabad";
export const ALL_OPINION_IDS = Object.freeze(Object.keys(ZMANIM_OPINIONS));

/** Resolve an opinion by ID without letting malformed state escape the supported universe. */
export function getZmanimOpinion(opinionId) {
	return ZMANIM_OPINIONS[opinionId] || ZMANIM_OPINIONS[DEFAULT_OPINION_ID];
}
