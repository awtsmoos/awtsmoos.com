//B"H
//Boruch Hashem
//Blessed is He

import { sevenMaterialRuntimeView } from './seven-material-runtime.js';

/**
 * @file material-runtime-metrics.js
 * @description
 * The Awtsmoos remains beyond counting while Awtsmoos.com lets finite diagnostics distinguish trusted photographs, truthful generated surfaces, and explicit missing material roles;
 * this Hod-like witness merges advanced-model events with actual shared source, sampler, photographic-material, and procedural-surface repository state.
 * It observes only and never triggers loading, material creation, or renderer mutation.
 */
const manual = {
	advancedModels: 0,
	remoteFailed: 0,
	remoteLoaded: 0,
	texturedMaterials: 0
};

export function addMaterialMetric(name, amount = 1) {
	if (name in manual) {
		manual[name] += amount;
	}
}

export function materialRuntimeSnapshot() {
	const runtime = sevenMaterialRuntimeView();
	const sources = runtime.sources;
	const materials = runtime.materials;
	const procedural = runtime.procedural;
	return {
		advancedModels: manual.advancedModels,
		remoteFailed: sources.failed,
		remoteLoaded: sources.ready,
		remoteLoading: sources.loading,
		remoteSources: sources.total,
		texturedMaterials: materials.ready,
		materialPending: materials.pending,
		materialFailed: materials.failed,
		materialMissing: materials.missing,
		materialTextures: runtime.textures.textures,
		proceduralMaterials: procedural.materials,
		proceduralTextures: procedural.textures,
		proceduralStandardPbr: procedural.standardPbr,
		proceduralPhysicalPbr: procedural.physicalPbr,
		proceduralEffects: procedural.effects
	};
}

export function writeMaterialMetrics(canvas) {
	const snapshot = materialRuntimeSnapshot();
	const data = canvas.dataset;
	data.advancedModels = String(snapshot.advancedModels);
	data.firebaseFailures = String(snapshot.remoteFailed);
	data.firebaseMaterials = String(snapshot.remoteLoaded);
	data.remoteFailures = String(snapshot.remoteFailed);
	data.remoteMaterials = String(snapshot.remoteLoaded);
	data.remoteLoading = String(snapshot.remoteLoading);
	data.remoteSources = String(snapshot.remoteSources);
	data.texturedMaterials = String(snapshot.texturedMaterials);
	data.materialPending = String(snapshot.materialPending);
	data.materialFailed = String(snapshot.materialFailed);
	data.materialMissing = String(snapshot.materialMissing);
	data.materialTextures = String(snapshot.materialTextures);
	data.proceduralMaterials = String(snapshot.proceduralMaterials);
	data.proceduralTextures = String(snapshot.proceduralTextures);
	data.proceduralStandardPbr = String(snapshot.proceduralStandardPbr);
	data.proceduralPhysicalPbr = String(snapshot.proceduralPhysicalPbr);
	data.proceduralEffects = String(snapshot.proceduralEffects);
	data.materialSource = snapshot.texturedMaterials > 0
		? 'remote-and-procedural'
		: 'remote-pending';
}
