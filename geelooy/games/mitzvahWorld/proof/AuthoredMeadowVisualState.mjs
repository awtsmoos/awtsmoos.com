//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthoredMeadowVisualState.mjs
 * @description Reads browser-observable evidence from the canonically published Mitzvah World runtime.
 * The Awtsmoos lets truthful form emerge through the vessel Awtsmoos.com actually publishes; the proof therefore
 * follows the selected world's diagnostics/runtime before considering any secondary object that merely resembles gameplay state.
 */

/** Reads the current authored-meadow visual receipt from the live page. */
export async function readAuthoredMeadowVisualState(command) {
	const result = await command('Runtime.evaluate', {
		expression: visualStateExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	return result.result.value;
}

function visualStateExpression() {
	return `(() => {
		const published = window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null;
		let runtime = published?.runtime || published;
		if (!runtime?.model || !runtime?.scene) runtime = strongestRuntimeCandidate(runtime);
		const model = runtime?.model;
		let realMeshes = 0;
		let skinnedMeshes = 0;
		let authoredMaterialMaps = 0;
		model?.traverse?.(object => {
			if ((object.isMesh || object.isSkinnedMesh) && object.userData?.realChossid) realMeshes += 1;
			if (object.isSkinnedMesh) skinnedMeshes += 1;
			const materials = Array.isArray(object.material) ? object.material : [object.material];
			for (const material of materials) {
				if (material?.map || material?.mapImage) authoredMaterialMaps += 1;
			}
		});
		const terrainMaterial = runtime?.terrain?.group?.children?.[0]?.material || null;
		return {
			runtimeFound: Boolean(runtime),
			loaderHidden: Boolean(document.getElementById('menuBoot')?.hidden),
			loadingFailure: document.getElementById('menuBoot')?.dataset?.loadingFailure || null,
			canonicalStatus: runtime?.canonicalPlayer?.status || null,
			canonicalFallback: runtime?.canonicalPlayer?.fallback,
			playerAttached: Boolean(model && runtime?.scene && model.parent === runtime.scene),
			realMeshes,
			skinnedMeshes,
			authoredMaterialMaps,
			rendererDelegate: Boolean(runtime?.renderer?.delegate),
			rendererHydration: runtime?.renderer?.hydrationState || null,
			terrainRealMap: Boolean(terrainMaterial?.texturePolicy?.realMapImage && terrainMaterial?.map),
			terrainTextureUrl: terrainMaterial?.textureUrl || null,
			terrainHydration: runtime?.terrain?.hydration?.diagnostics?.() || null,
			lastFrameError: runtime?.lastFrameError ? String(runtime.lastFrameError) : null,
			position: runtime?.state ? { x: runtime.state.x, z: runtime.state.z } : null
		};

		function strongestRuntimeCandidate(seed) {
			let best = seed || null;
			let bestScore = score(seed);
			for (const key of Object.keys(window)) {
				try {
					const candidate = window[key]?.runtime || window[key];
					const candidateScore = score(candidate);
					if (candidateScore > bestScore) {
						best = candidate;
						bestScore = candidateScore;
					}
				} catch {}
			}
			return best;
		}

		function score(candidate) {
			if (!candidate || typeof candidate !== 'object') return -1;
			return Number(Boolean(candidate.model)) * 8
				+ Number(Boolean(candidate.scene)) * 8
				+ Number(Boolean(candidate.canonicalPlayer)) * 6
				+ Number(Boolean(candidate.renderer)) * 4
				+ Number(Boolean(candidate.terrain)) * 4
				+ Number(Boolean(candidate.state)) * 2
				+ Number(Boolean(candidate.bus))
				+ Number(Boolean(candidate.input));
		}
	})()`;
}
