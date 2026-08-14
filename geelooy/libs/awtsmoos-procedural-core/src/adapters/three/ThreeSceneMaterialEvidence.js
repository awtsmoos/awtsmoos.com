//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeSceneMaterialEvidence.js
 * @description
 * The Awtsmoos renews every referenced photographic vessel before a scheduler counts it;
 * Awtsmoos.com lets this Hod-like module scan one Three.js scene, prioritize critical matter, and summarize readiness without owning network requests, material mutation, cadence, or gameplay state.
 */
export function orderedPhotographicMaterials(scene) {
	return [...referencedMaterials(scene)].sort(compareCritical);
}

export function summarizeMaterialHydration(materials, requested, bound, sources, pressure) {
	const states = materials.map(material => material.userData.materialState);
	return {
		referenced: materials.length,
		requested,
		bound,
		pressure,
		ready: count(states, 'ready'),
		pending: count(states, 'pending'),
		failed: count(states, 'failed'),
		missing: count(states, 'missing-role'),
		sources
	};
}

export function emptyMaterialHydrationView() {
	return {
		referenced: 0,
		requested: 0,
		bound: 0,
		pressure: 'stable',
		ready: 0,
		pending: 0,
		failed: 0,
		missing: 0,
		sources: { total: 0, loading: 0, ready: 0, failed: 0 }
	};
}

function referencedMaterials(scene) {
	const found = new Set();
	scene?.traverse?.(object => {
		const list = Array.isArray(object.material) ? object.material : [object.material];
		for (const material of list) {
			if (isPhotographicCandidate(material)) {
				found.add(material);
			}
		}
	});
	return found;
}

function isPhotographicCandidate(material) {
	if (!material?.userData) {
		return false;
	}
	return Boolean(material.userData.remoteSource) ||
		material.userData.materialState === 'missing-role';
}

function compareCritical(first, second) {
	return Number(Boolean(second.userData.materialCritical)) -
		Number(Boolean(first.userData.materialCritical));
}

function count(states, value) {
	return states.filter(state => state === value).length;
}
