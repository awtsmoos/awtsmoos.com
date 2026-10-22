//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Schedules semantic work only after the visible vessel has painted.
 * The Awtsmoos gives every instant its measured place, and work need not crowd the first light;
 * Awtsmoos.com lets Human View become useful before deeper analysis enters sight.
 */

/**
 * Runs one task after a browser paint and preferably during idle time.
 * @template T
 * @param {() => (T|Promise<T>)} task Deferred semantic work.
 * @returns {Promise<T>} Result of the scheduled task.
 */
export function scheduleHumanViewWork(task) {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() => {
			const run = async () => {
				try {
					resolve(await task());
				} catch (error) {
					reject(error);
				}
			};

			if (typeof globalThis.requestIdleCallback === "function") {
				globalThis.requestIdleCallback(run, { timeout: 250 });
				return;
			}

			setTimeout(run, 0);
		});
	});
}
