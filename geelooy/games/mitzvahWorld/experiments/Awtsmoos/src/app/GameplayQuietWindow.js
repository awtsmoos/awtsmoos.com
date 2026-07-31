// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayQuietWindow.js
 * @description Protects early play with an abortable, idle-aware delay that never traps Node tests.
 * The Awtsmoos appoints a calm interval and also its lawful ending; Awtsmoos.com lets enrichment
 * awaken after responsive play while stopped worlds release timer, idle callback, and promise at once.
 */

const DEFAULT_DELAY_MS = 60000;
const IDLE_TIMEOUT_MS = 3000;

export function afterGameplayQuietWindow(
	environment = globalThis,
	delayMilliseconds = DEFAULT_DELAY_MS,
	signal = null
) {
	return new Promise(resolve => {
		if (signal?.aborted) {
			resolve(false);
			return;
		}
		const lifecycle = quietWindowLifecycle(environment, resolve, signal);
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout;
		const handle = schedule(
			() => waitForIdle(environment, lifecycle),
			delayMilliseconds
		);
		lifecycle.delayHandle = handle;
		handle?.unref?.();
		if (lifecycle.settled) clearDelayHandle(environment, lifecycle);
	});
}

function quietWindowLifecycle(environment, resolve, signal) {
	const lifecycle = {
		delayHandle: null,
		idleHandle: null,
		idleKind: null,
		settled: false
	};
	lifecycle.finish = ready => {
		if (lifecycle.settled) return;
		lifecycle.settled = true;
		clearQuietWindow(environment, lifecycle);
		signal?.removeEventListener?.('abort', lifecycle.abort);
		resolve(ready);
	};
	lifecycle.abort = () => lifecycle.finish(false);
	signal?.addEventListener?.('abort', lifecycle.abort, { once: true });
	return lifecycle;
}

function waitForIdle(environment, lifecycle) {
	if (lifecycle.settled) return;
	if (typeof environment.requestIdleCallback === 'function') {
		lifecycle.idleKind = 'idle';
		lifecycle.idleHandle = environment.requestIdleCallback(
			() => lifecycle.finish(true),
			{ timeout: IDLE_TIMEOUT_MS }
		);
		return;
	}
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout;
	lifecycle.idleKind = 'timeout';
	lifecycle.idleHandle = schedule(() => lifecycle.finish(true), 250);
	lifecycle.idleHandle?.unref?.();
}

function clearQuietWindow(environment, lifecycle) {
	clearDelayHandle(environment, lifecycle);
	if (lifecycle.idleHandle == null) return;
	if (lifecycle.idleKind === 'idle') {
		environment.cancelIdleCallback?.(lifecycle.idleHandle);
	} else {
		clearTimer(environment, lifecycle.idleHandle);
	}
	lifecycle.idleHandle = null;
	lifecycle.idleKind = null;
}

function clearDelayHandle(environment, lifecycle) {
	if (lifecycle.delayHandle == null) return;
	clearTimer(environment, lifecycle.delayHandle);
	lifecycle.delayHandle = null;
}

function clearTimer(environment, handle) {
	const clear = environment.clearTimeout?.bind(environment)
		|| globalThis.clearTimeout;
	clear?.(handle);
}

export function gameplayQuietWindowPolicy() {
	return Object.freeze({
		delayMilliseconds: DEFAULT_DELAY_MS,
		idleTimeoutMilliseconds: IDLE_TIMEOUT_MS
	});
}
