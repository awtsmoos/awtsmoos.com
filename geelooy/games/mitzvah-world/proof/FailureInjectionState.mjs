//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FailureInjectionState.mjs
 * @description Reads finite visible failure and the same published runtime authorities used by the healthy visual proof.
 * The Awtsmoos gives one reality beneath success and fracture; Awtsmoos.com therefore looks through the canonical publication names
 * before judging a blocked dependency, so a blind witness can never condemn a living runtime or bless an empty shell.
 */

/** Reads serializable failure evidence from the active Mitzvah World page. */
export async function readFailureInjectionState(command) {
	const receipt = await command('Runtime.evaluate', {
		expression: failureStateExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	return receipt.result.value;
}

function failureStateExpression() {
	return `(() => {
		const published = window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null;
		const runtime = published?.runtime || published;
		const loader = document.getElementById('menuBoot');
		const bootFailure = document.querySelector('[data-boot-failure]');
		const terrain = runtime?.diagnostics?.bootstrapTerrainHydration?.()
			|| runtime?.diagnostics?.terrainHydration
			|| runtime?.terrain?.textureHydration?.diagnostics?.()
			|| null;
		const player = runtime?.canonicalPlayer || runtime?.diagnostics?.canonicalPlayer || null;
		const renderer = runtime?.renderer || runtime?.world?.renderer || null;
		const bootError = window.AwtsmoosBootError || null;
		return {
			runtimeFound: Boolean(runtime?.scene || runtime?.model || runtime?.runtimeState),
			loaderHidden: Boolean(loader?.hidden),
			loadingFailure: loader?.dataset?.loadingFailure || null,
			loaderText: loader?.textContent?.replace(/\\s+/g, ' ').trim() || '',
			bootFailure: bootFailure?.dataset?.bootFailure || null,
			bootFailureText: bootFailure?.textContent?.trim() || '',
			bootError: bootError?.message || null,
			canonicalStatus: player?.status || null,
			canonicalFallback: player?.fallback ?? null,
			playerAttached: Boolean(player?.object && (player?.scene || runtime?.scene)),
			rendererHydration: renderer?.hydrationState || null,
			rendererError: renderer?.hydrationError?.message || renderer?.hydrationError || null,
			terrainPhase: terrain?.phase || null,
			terrainError: terrain?.error?.message || terrain?.error || null,
			frameError: runtime?.lastFrameError || runtime?.diagnostics?.lastFrameError || null,
			bootStage: document.documentElement?.dataset?.awtsmoosBootStage || null,
			runtimeState: document.documentElement?.dataset?.awtsmoosRuntime || null
		};
	})()`;
}
