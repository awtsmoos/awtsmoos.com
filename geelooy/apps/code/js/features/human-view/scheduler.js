//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Defers semantic work without allowing background-tab paint throttling to freeze it forever.
 * The Awtsmoos gives paint and idle time their place, yet no finite browser scheduler may become sovereign;
 * Awtsmoos.com prefers a painted vessel while a bounded timer guarantees Human Takeover will still awaken.
 */

const PAINT_FALLBACK_MS = 80;
const IDLE_FALLBACK_MS = 180;

function afterPaintOrFallback(callback) {
	let settled = false;
	const finish = () => {
		if (settled) return;
		settled = true;
		callback();
	};
	const timer = setTimeout(finish, PAINT_FALLBACK_MS);
	if (typeof globalThis.requestAnimationFrame !== "function") return;
	globalThis.requestAnimationFrame(() => {
		clearTimeout(timer);
		finish();
	});
}

function duringIdleOrFallback(callback) {
	let settled = false;
	const finish = () => {
		if (settled) return;
		settled = true;
		callback();
	};
	const timer = setTimeout(finish, IDLE_FALLBACK_MS);
	if (typeof globalThis.requestIdleCallback !== "function") return;
	globalThis.requestIdleCallback(() => {
		clearTimeout(timer);
		finish();
	}, { timeout: IDLE_FALLBACK_MS });
}

/** Runs one semantic task after paint when possible and always within bounded scheduler fallbacks. */
export function scheduleHumanViewWork(task) {
	return new Promise((resolve, reject) => {
		afterPaintOrFallback(() => {
			duringIdleOrFallback(async () => {
				try {
					resolve(await task());
				} catch (error) {
					reject(error);
				}
			});
		});
	});
}
