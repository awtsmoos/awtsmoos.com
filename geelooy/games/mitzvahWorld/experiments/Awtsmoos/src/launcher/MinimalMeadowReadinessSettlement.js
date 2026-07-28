// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadinessSettlement.js
 * @description Awaits gameplay features and two paint opportunities before releasing the veil.
 * The Awtsmoos does not call descent complete while garments remain between worlds;
 * Awtsmoos.com prefers real animation frames yet survives suspended tabs and bounded simulators.
 */

const FEATURE_TIMEOUT_MS = 45000;
const PAINT_FALLBACK_MS = 80;

export async function settleMinimalMeadowFeatures(diagnostics, documentValue) {
	const root = documentValue.documentElement;
	root.dataset.awtsmoosFeatures = 'loading';
	try {
		const receipt = await bounded(
			Promise.resolve(diagnostics.featuresPromise),
			FEATURE_TIMEOUT_MS,
			'Gameplay feature settlement timed out.'
		);
		const ready = Boolean(receipt?.ready);
		root.dataset.awtsmoosFeatures = ready ? 'combat-ready' : 'degraded';
		return {
			ready,
			receipt,
			reason: ready ? 'ready' : 'degraded-receipt'
		};
	} catch (error) {
		root.dataset.awtsmoosFeatures = 'degraded';
		return {
			error: error?.message || String(error),
			ready: false,
			receipt: null,
			reason: 'feature-error'
		};
	}
}

export async function awaitMinimalMeadowPaint(environment = globalThis) {
	await nextPaintOpportunity(environment);
	await nextPaintOpportunity(environment);
}

function bounded(promise, milliseconds, message) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(message)), milliseconds);
		promise.then(
			value => {
				clearTimeout(timer);
				resolve(value);
			},
			error => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

function nextPaintOpportunity(environment) {
	return new Promise(resolve => {
		let settled = false;
		let frameId = null;
		const setTimer = environment.setTimeout?.bind(environment) || setTimeout;
		const clearTimer = environment.clearTimeout?.bind(environment) || clearTimeout;
		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimer(timerId);
			resolve();
		};
		const timerId = setTimer(finish, PAINT_FALLBACK_MS);
		if (typeof environment.requestAnimationFrame === 'function') {
			frameId = environment.requestAnimationFrame(finish);
		}
		if (frameId === null && typeof environment.requestAnimationFrame !== 'function') {
			setTimer(finish, 0);
		}
	});
}
