// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalInstaller.js
 * @description Installs procedural batches and real nature behind a cancellation witness.
 * The Awtsmoos reveals each layer only while its generation still belongs to the scene;
 * Awtsmoos.com keeps stale blossoms from returning after teardown, quiet and clean.
 */

/** Builds and attaches the procedural village garden package. */
export async function installProceduralGarden(options) {
	const module = await options.loadModule();
	if (!options.isCurrent()) {
		return null;
	}
	const packageValue = module.createVillageBotanicalEnrichmentDefinitions(
		options.groundSampler,
		options.quality
	);
	const meshes = [];
	for (const definition of packageValue.definitions) {
		const mesh = options.meshFactory(definition);
		options.group.add(mesh);
		meshes.push(mesh);
	}
	return Object.freeze({
		meshes,
		stats: { ...packageValue.stats }
	});
}

/** Loads bounded real nature and destroys it immediately when generation becomes stale. */
export async function installRealGarden(options) {
	const module = await options.loadModule();
	if (!options.isCurrent()) {
		return null;
	}
	const system = await module.createRealNatureSystem({
		groundSampler: options.groundSampler,
		group: options.group,
		quality: options.quality
	});
	if (!options.isCurrent()) {
		system.destroy();
		return null;
	}
	return system;
}
