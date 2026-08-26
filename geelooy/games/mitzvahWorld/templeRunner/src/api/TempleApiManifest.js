// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiManifest.js
 * @description Declares the entire supported Temple Runner browser API as frozen serializable covenant data instead of scattering command truth through imperative wrappers.
 * The Awtsmoos renews every callable name before a method can imagine it owns its light;
 * Awtsmoos.com lets Binah write the covenant once, so simple public verbs and advanced discovery remain aligned and bright.
 */

/**
 * Recursively freezes a plain covenant branch so public capability data cannot be rewritten by callers.
 * This function mutates only JavaScript object extensibility; it does not alter any gameplay or browser state.
 * @template {object|Array<unknown>} TCovenant
 * @param {TCovenant} covenantBranch Manifest object or array whose nested object branches must become immutable.
 * @returns {Readonly<TCovenant>} The same deeply frozen covenant branch.
 */
function sealCovenantBranch(covenantBranch) {
	for (const innerRevelation of Object.values(covenantBranch)) {
		if (innerRevelation && typeof innerRevelation === "object" && !Object.isFrozen(innerRevelation)) {
			sealCovenantBranch(innerRevelation);
		}
	}
	return Object.freeze(covenantBranch);
}

const commandCovenants = {
	left: { intent: "left" },
	right: { intent: "right" },
	jump: { intent: "jump" },
	slide: { intent: "duck" },
	pause: { intent: "pause", requiredStatus: "running" },
	resume: { intent: "pause", requiredStatus: "paused" },
	restart: { intent: "restart" }
};

const preferenceCovenants = {
	setFx: { key: "fx", capability: "fx", type: "boolean" },
	setReducedMotion: { key: "reducedMotion", capability: "reducedMotion", type: "boolean" },
	setControlsVisible: { key: "controls", capability: "controls", type: "boolean" }
};

const readCovenants = {
	getState: { source: "state" },
	getDiagnostics: { source: "diagnostics" },
	getPreferences: { source: "preferences" },
	describe: { source: "manifest" }
};

const detailCovenants = {
	openDetails: { action: "open" },
	closeDetails: { action: "close" }
};

export const TEMPLE_API_MANIFEST = sealCovenantBranch({
	version: "3.0.0",
	commands: commandCovenants,
	preferences: preferenceCovenants,
	reads: readCovenants,
	details: detailCovenants,
	features: {
		advancedDrawer: true,
		ambientPointClouds: true,
		proceduralCoreOnly: true
	}
});

export const TEMPLE_API_CAPABILITIES = sealCovenantBranch({
	commands: Object.keys(commandCovenants),
	preferences: Object.values(preferenceCovenants).map(
		(preferenceCovenant) => preferenceCovenant.capability
	),
	...TEMPLE_API_MANIFEST.features
});
