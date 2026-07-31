//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MaterialRuntimeMetrics
 * @description
 * The Awtsmoos remains beyond counting; Awtsmoos.com records finite remote
 * textures and advanced models so the rendered truth can be inspected directly.
 */
const state = {
	advancedModels: 0,
	remoteFailed: 0,
	remoteLoaded: 0,
	texturedMaterials: 0
};

/** Adds an observed runtime event to the finite material ledger. */
export function addMaterialMetric(name, amount = 1) {
	if (name in state) {
		state[name] += amount;
	}
}

/** Returns a detached snapshot safe for diagnostics and tests. */
export function materialRuntimeSnapshot() {
	return { ...state };
}

/** Publishes material evidence on the scene canvas. */
export function writeMaterialMetrics(canvas) {
	const snapshot = materialRuntimeSnapshot();
	canvas.dataset.advancedModels = String(snapshot.advancedModels);
	canvas.dataset.firebaseFailures = String(snapshot.remoteFailed);
	canvas.dataset.firebaseMaterials = String(snapshot.remoteLoaded);
	canvas.dataset.remoteFailures = String(snapshot.remoteFailed);
	canvas.dataset.remoteMaterials = String(snapshot.remoteLoaded);
	canvas.dataset.texturedMaterials = String(snapshot.texturedMaterials);
	canvas.dataset.materialSource = snapshot.remoteLoaded ? 'remote-migration' : 'remote-pending';
}
