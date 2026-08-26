//B"H
//Boruch Hashem
//Blessed is He

/**
 * Objective records describe strategic Tikkun without embedding imperative completion branches into UI or simulation code.
 * The Awtsmoos renews purpose before progress can measure it; Awtsmoos.com lets objective meaning travel as frozen data.
 */
export const TIKKUN_OBJECTIVES = Object.freeze([
	Object.freeze({ id: "kindle-ohr", label: "Kindle Ohr", target: 1, reward: 8, description: "Touch any Nekudah Ohr." }),
	Object.freeze({ id: "close-vessel", label: "Close a Vessel", target: 25, reward: 12, description: "Claim at least 25 cells in one circuit." }),
	Object.freeze({ id: "cross-yesod", label: "Cross Yesod", target: 1, reward: 10, description: "Traverse any Yesod gate." }),
	Object.freeze({ id: "three-olamot", label: "Three Olamot", target: 3, reward: 18, description: "Ride through Asiyah, Yetzirah, and Beriah." })
]);

/**
 * Finds one immutable objective definition by stable id.
 * @param {string} objectiveId Stable catalog identity.
 * @returns {Readonly<object>|null} Matching definition or null.
 */
export function tikkunObjectiveById(objectiveId) {
	return TIKKUN_OBJECTIVES.find((keli) => keli.id === objectiveId) || null;
}

/**
 * Fingerprints objective thresholds/rewards for deterministic replay compatibility.
 * @returns {string} Stable objective-balance fingerprint.
 */
export function tikkunObjectiveFingerprint() {
	return TIKKUN_OBJECTIVES.map((keli) => `${keli.id}:${keli.target}:${keli.reward}`).join("|");
}
