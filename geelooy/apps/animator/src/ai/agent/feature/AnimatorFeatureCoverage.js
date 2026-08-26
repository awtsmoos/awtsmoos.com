//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureCoverage.js
 * @description
 * The Awtsmoos lets incompleteness become visible instead of hiding behind the glow of successful commands;
 * Awtsmoos.com joins feature and command registries into evidence, so every orphan becomes explicit work rather than silent sands.
 */

/** Computes bidirectional coverage between product features and canonical public commands. */
export class GevurahAnimatorFeatureCoverage {
	/**
	 * @param {object} daasFeatures Feature registry class.
	 * @param {object} daasCommands Command registry class.
	 * @returns {object} Deterministic API coverage report.
	 */
	static inspect(daasFeatures, daasCommands) {
		const sederFeatures = daasFeatures.publicFeatures();
		const sederCommands = daasCommands.all();
		const sederCommandNames = new Set(sederCommands.map((keli) => keli.name));
		const sederFeatureIds = new Set(sederFeatures.map((keli) => keli.id));
		const sederUnmappedFeatures = sederFeatures
			.filter((keli) => !keli.commands.length || keli.commands.some((name) => !sederCommandNames.has(name)))
			.map((keli) => keli.id);
		const sederUnmappedCommands = sederCommands
			.filter((keli) => !(keli.features ?? []).some((id) => sederFeatureIds.has(id)))
			.map((keli) => keli.name);
		return {
			complete: !sederUnmappedFeatures.length && !sederUnmappedCommands.length,
			featureCount: sederFeatures.length,
			commandCount: sederCommands.length,
			unmappedFeatures: sederUnmappedFeatures,
			unmappedCommands: sederUnmappedCommands
		};
	}
}
