// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConcurrentMountPlan.js
 * @description Starts independent rich-world factories together with one bounded settlement gate.
 * The Awtsmoos reveals many finite vessels without letting one optional garment hold the world;
 * Awtsmoos.com preserves each successful mount while a stalled branch becomes named degradation.
 */

const DEFAULT_MOUNT_TIMEOUT_MS = 12000;

export async function runMinimalMeadowConcurrentMountPlan(
	plan = {},
	options = {}
) {
	const timeoutMs = positiveTimeout(options.timeoutMs);
	const entries = Object.entries(plan);
	const settled = await Promise.all(entries.map(async ([name, factory]) => {
		try {
			const value = await boundedFactory(factory, timeoutMs, name);
			return [name, value];
		} catch (error) {
			return [name, Object.freeze({
				error: error?.message || String(error),
				name,
				status: 'failed'
			})];
		}
	}));
	return Object.fromEntries(settled);
}

function boundedFactory(factory, timeoutMs, name) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`${name} mount timed out after ${timeoutMs}ms`));
		}, timeoutMs);
		Promise.resolve()
			.then(() => factory())
			.then(
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

function positiveTimeout(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: DEFAULT_MOUNT_TIMEOUT_MS;
}

export default runMinimalMeadowConcurrentMountPlan;
