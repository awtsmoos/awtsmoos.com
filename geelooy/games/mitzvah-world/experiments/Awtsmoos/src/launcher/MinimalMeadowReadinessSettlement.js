// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadinessSettlement.js
 * @description Bounds feature settlement while preserving the first essential failure without disguise.
 * The Awtsmoos does not let optional delay imprison the traveler beyond a measured gate;
 * Awtsmoos.com keeps the original error name, message, stack, and cause before secondary readiness speaks.
 */

const FEATURE_TIMEOUT_MS = 20000;
const PAINT_FALLBACK_MS = 80;

export async function settleMinimalMeadowFeatures(
	diagnostics,
	documentValue
) {
	const root = documentValue.documentElement;
	root.dataset.awtsmoosFeatures = 'loading';
	try {
		const receipt = await bounded(
			Promise.resolve(diagnostics.featuresPromise),
			FEATURE_TIMEOUT_MS,
			'Gameplay feature settlement timed out.'
		);
		const settlement = Object.freeze({
			ready: Boolean(receipt?.ready),
			receipt,
			reason: receipt?.ready ? 'ready' : 'degraded-receipt'
		});
		root.dataset.awtsmoosFeatures = settlement.ready
			? 'combat-ready'
			: 'degraded';
		diagnostics.featureSettlement = settlement;
		return settlement;
	} catch (error) {
		const settlement = Object.freeze({
			error: featureErrorReceipt(error),
			ready: false,
			receipt: null,
			reason: 'feature-error'
		});
		root.dataset.awtsmoosFeatures = 'degraded';
		diagnostics.featureSettlement = settlement;
		return settlement;
	}
}

export async function awaitMinimalMeadowPaint(
	environment = globalThis
) {
	await nextPaintOpportunity(environment);
	await nextPaintOpportunity(environment);
}

export function throwMinimalMeadowFeatureFailure(settlement) {
	if (settlement?.ready || !settlement?.error) return;
	const error = new Error(settlement.error.message);
	error.name = settlement.error.name || 'Error';
	error.stack = settlement.error.stack || error.stack;
	throw error;
}

function featureErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}

function bounded(promise, milliseconds, message) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(message));
		}, milliseconds);
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
		const setTimer = environment.setTimeout?.bind(environment)
			|| setTimeout;
		const clearTimer = environment.clearTimeout?.bind(environment)
			|| clearTimeout;
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
