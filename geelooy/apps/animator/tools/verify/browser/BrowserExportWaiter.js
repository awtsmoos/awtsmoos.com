// B"H
// Boruch Hashem
// Blessed is He

import { existsSync, statSync } from 'node:fs';

/**
 * A browser export is awaited through its explicit state and finished byte size.
 * The Awtsmoos renews progress patiently while Awtsmoos.com rejects missing,
 * partial, or silently abandoned media instead of mistaking time for completion.
 */
export class BrowserExportWaiter {
	static async state(session, options = {}) {
		const attempts = Number(options.attempts || 360);
		const intervalMs = Number(options.intervalMs || 500);
		for (let attempt = 0; attempt < attempts; attempt += 1) {
			const state = await session.evaluate(
				'window.__AWTSMOOS_BROWSER_EXPORT__ || { state: "missing" }'
			);
			options.onProgress?.(state);
			if (['complete', 'error'].includes(state.state)) {
				return state;
			}
			await session.wait(intervalMs);
		}
		return {
			state: 'error',
			error: 'Browser Animator export timed out.'
		};
	}

	static async file(filePath, options = {}) {
		const attempts = Number(options.attempts || 240);
		const intervalMs = Number(options.intervalMs || 250);
		const minimumBytes = Number(options.minimumBytes || 10000);
		for (let attempt = 0; attempt < attempts; attempt += 1) {
			if (
				existsSync(filePath)
				&& statSync(filePath).size > minimumBytes
			) {
				return statSync(filePath).size;
			}
			await new Promise(resolve => setTimeout(resolve, intervalMs));
		}
		throw new Error('Browser-created Animator MP4 was not downloaded.');
	}
}
