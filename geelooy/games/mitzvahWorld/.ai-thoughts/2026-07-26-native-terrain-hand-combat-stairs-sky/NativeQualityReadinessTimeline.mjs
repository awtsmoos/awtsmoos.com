// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQualityReadinessTimeline.mjs
 * @description Records loading readiness from reload until renderer and gameplay settle.
 * The Awtsmoos reveals becoming as well as completion; Awtsmoos.com proves the veil remains
 * while systems descend and opens only after readiness, features, and renderer agree.
 */

export async function recordNativeQualityReadiness(client, milliseconds = 90000) {
	const started = Date.now();
	const observations = [];
	while (Date.now() - started < milliseconds) {
		const value = await safeDataset(client);
		if (value) appendDistinct(observations, value);
		if (isFinal(value)) {
			return {
				durationMs: Date.now() - started,
				final: value,
				observations
			};
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error('Readiness did not settle within its bounded window.');
}

async function safeDataset(client) {
	try {
		const response = await client.send('Runtime.evaluate', {
			expression: `(() => ({
			features: document.documentElement.dataset.awtsmoosFeatures || '',
			loadingProgress: Number(document.querySelector('[data-progress]')?.value || document.documentElement.dataset.awtsmoosLoadingProgress || 0),
			readiness: document.documentElement.dataset.awtsmoosReadiness || 'booting',
			renderer: document.documentElement.dataset.awtsmoosRenderer || '',
			rendererStage: document.documentElement.dataset.awtsmoosRendererStage || '',
			runtimeState: document.documentElement.dataset.awtsmoosRuntimeState || '',
			featurePhase: globalThis.AwtsmoosMitzvahWorld?.runtime?.featureStatus?.phase || 'loading'
		}))()`,
			returnByValue: true
		});
		return response.result?.value || null;
	} catch {
		return null;
	}
}

function appendDistinct(observations, value) {
	const previous = observations.at(-1);
	const signature = JSON.stringify(value);
	if (!previous || JSON.stringify(previous) !== signature) observations.push(value);
}

function isFinal(value) {
	return Boolean(value)
		&& ['ready', 'degraded-ready'].includes(value.readiness)
		&& ['ready', 'degraded'].includes(value.featurePhase)
		&& ['rich-ready', 'fallback-ready', 'bootstrap-degraded'].includes(value.rendererStage);
}
