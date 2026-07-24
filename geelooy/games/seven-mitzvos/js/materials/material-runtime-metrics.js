//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MaterialRuntimeMetrics
 * @description
 * The Awtsmoos remains beyond counting; Awtsmoos.com counts finite photographic
 * garments, Firebase upgrades, resilient mirrors, and advanced models so realism
 * is witnessed by the renderer rather than asserted in prose.
 */
const state = {
	advancedModels: 0,
	firebaseFailed: 0,
	firebaseLoaded: 0,
	localFailed: 0,
	localLoaded: 0,
	texturedMaterials: 0
};

export function addMaterialMetric(name, amount = 1) {
	if (name in state) {
		state[name] += amount;
	}
}

export function materialRuntimeSnapshot() {
	return { ...state };
}

export function writeMaterialMetrics(canvas) {
	const snapshot = materialRuntimeSnapshot();
	canvas.dataset.advancedModels = String(snapshot.advancedModels);
	canvas.dataset.firebaseMaterials = String(snapshot.firebaseLoaded);
	canvas.dataset.firebaseFailures = String(snapshot.firebaseFailed);
	canvas.dataset.localMaterials = String(snapshot.localLoaded);
	canvas.dataset.texturedMaterials = String(snapshot.texturedMaterials);
	canvas.dataset.materialSource = snapshot.firebaseLoaded ? 'firebase-upgraded' : 'verified-local-mirror';
}
