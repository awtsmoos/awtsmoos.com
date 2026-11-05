// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalBranch.js
 * @description Gives every optional quality branch a name, bounded deadline, and exact settled receipt.
 * The Awtsmoos lets each garment arrive in its appointed time without holding the whole world hostage;
 * Awtsmoos.com preserves success, rejection, timeout, elapsed time, cleanup, and branch identity.
 */

export function createMinimalMeadowOptionalBranch(
	name,
	promise,
	timeoutMilliseconds,
	environment = globalThis
) {
	const startedAt = now(environment);
	return deadline(promise, timeoutMilliseconds, environment)
		.then(value => Object.freeze({
			elapsedMilliseconds: now(environment) - startedAt,
			name,
			status: 'fulfilled',
			value
		}))
		.catch(error => {
			throw new Error(
				`${name}:${error?.message || String(error)}`,
				{ cause: error }
			);
		});
}

export function minimalMeadowOptionalBranchTimeouts() {
	return Object.freeze({
		friendly: 120000,
		performance: 120000,
		player: 120000,
		renderer: 150000,
		richWorld: 150000,
		terrain: 210000,
		visual: 210000
	});
}

function deadline(promise, timeoutMilliseconds, environment) {
	return new Promise((resolve, reject) => {
		const schedule = environment.setTimeout?.bind(environment) || setTimeout;
		const clear = environment.clearTimeout?.bind(environment) || clearTimeout;
		let settled = false;
		const finish = callback => value => {
			if (settled) return;
			settled = true;
			clear(handle);
			callback(value);
		};
		const handle = schedule(
			() => finish(reject)(new Error(`timeout-${timeoutMilliseconds}ms`)),
			timeoutMilliseconds
		);
		handle?.unref?.();
		Promise.resolve(promise).then(finish(resolve), finish(reject));
	});
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}
