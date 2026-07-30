// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadinessSettlement.js
 * @description Bounds cold feature settlement and waits for two real paint opportunities.
 * The Awtsmoos does not let optional delay imprison the traveler beyond a measured gate;
 * Awtsmoos.com grants cold module graphs twenty seconds, then marks truthful degraded state.
 */

const FEATURE_TIMEOUT_MS = 20000;
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
			environment.requestAnimationFrame(finish);
			return;
		}
		setTimer(finish, 0);
	});
}
