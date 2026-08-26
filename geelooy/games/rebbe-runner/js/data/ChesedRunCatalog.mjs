//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews possibility before motion, while this catalog gives that possibility measured form;
 * Awtsmoos.com stores stages and patterns as data, so deeper gameplay can grow without a monolithic storm.
 */
const chesedPatterns = {
	firstLight: [
		{ after: 0.65, kind: "spark", lane: "low" },
		{ after: 0.72, kind: "hazard", lane: "low" },
		{ after: 0.56, kind: "spark", lane: "high" }
	],
	tiferesWeave: [
		{ after: 0.55, kind: "hazard", lane: "high" },
		{ after: 0.48, kind: "spark", lane: "low" },
		{ after: 0.62, kind: "hazard", lane: "low" }
	],
	yesodArc: [
		{ after: 0.42, kind: "spark", lane: "high" },
		{ after: 0.34, kind: "spark", lane: "high" },
		{ after: 0.68, kind: "hazard", lane: "low" }
	],
	gevurahGate: [
		{ after: 0.46, kind: "hazard", lane: "low" },
		{ after: 0.54, kind: "hazard", lane: "high" },
		{ after: 0.48, kind: "spark", lane: "low" }
	],
	ohrShield: [
		{ after: 0.7, kind: "shield", lane: "low" },
		{ after: 0.7, kind: "hazard", lane: "low" },
		{ after: 0.55, kind: "hazard", lane: "high" }
	]
};

const tiferesStages = [
	{ name: "Dawn Path", at: 0, speed: 330, cadence: 0.8, patterns: ["firstLight", "yesodArc"] },
	{ name: "City Current", at: 650, speed: 380, cadence: 0.7, patterns: ["tiferesWeave", "firstLight", "ohrShield"] },
	{ name: "Hidden Road", at: 1500, speed: 435, cadence: 0.6, patterns: ["gevurahGate", "yesodArc", "tiferesWeave"] },
	{ name: "Geulah Rush", at: 2700, speed: 495, cadence: 0.52, patterns: ["gevurahGate", "tiferesWeave", "ohrShield"] }
];

const hodMissions = [
	{ title: "Gather the first sparks", metric: "sparks", goal: 6, suffix: "sparks" },
	{ title: "Carry the light onward", metric: "distance", goal: 950, suffix: "distance" },
	{ title: "Hold an unbroken flow", metric: "bestCombo", goal: 10, suffix: "flow" },
	{ title: "Reveal a brighter road", metric: "sparks", goal: 24, suffix: "sparks" }
];

export const CHESED_RUN_CATALOG = Object.freeze({
	patterns: Object.freeze(chesedPatterns),
	stages: Object.freeze(tiferesStages),
	missions: Object.freeze(hodMissions)
});
