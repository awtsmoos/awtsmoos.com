// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletExpertExpressions.mjs
 * @description Builds production-page readiness, expert activation, and cleanup expressions.
 * The Awtsmoos joins living actor, visible provenance, and restored lifecycle in one witnessed road;
 * Awtsmoos.com records every disposable fixture while the expert enters through his real world class.
 */

export function amuletReadinessExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			inventory: Boolean(runtime?.inventory),
			ready: Boolean(
				runtime?.inventory
				&& runtime?.playerStats
				&& document.documentElement.dataset.awtsmoosUi === 'ready'
			),
			ui: document.documentElement.dataset.awtsmoosUi || null
		};
	})()`;
}

export function mountExpertExpression() {
	return `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const moduleUrl = new URL(
			'./experiments/Awtsmoos/src/app/MinimalMeadowAmuletExpertPopulation.js',
			location.href
		).href;
		let fixtureOwned = false;
		if (!runtime.amuletExpert) {
			const moduleValue = await import(moduleUrl);
			runtime.amuletExpert = await moduleValue.MinimalMeadowAmuletExpertPopulation.create(
				runtime,
				globalThis
			);
			fixtureOwned = true;
		}
		runtime.__amuletProofFixtureOwned = fixtureOwned;
		runtime.amuletExpert.activateCandidate();
		const panel = document.querySelector(
			'[data-vendor-id="reb-refael-kamea-scribe"]'
		);
		return {
			diagnostics: runtime.amuletExpert.diagnostics(),
			disclaimer: panel?.textContent?.includes('not medical advice') || false,
			fixtureOwned,
			open: panel ? !panel.hidden : false,
			stockButtons: panel?.querySelectorAll('[data-buy]').length || 0,
			wallet: runtime.inventory.quantity('perutas')
		};
	})()`;
}

export function cleanupExpertExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const owned = Boolean(runtime.__amuletProofFixtureOwned);
		if (owned) {
			runtime.amuletExpert?.destroy?.();
			delete runtime.amuletExpert;
		}
		delete runtime.__amuletProofFixtureOwned;
		return {
			owned,
			panelPresent: Boolean(document.querySelector(
				'[data-vendor-id="reb-refael-kamea-scribe"]'
			))
		};
	})()`;
}
