// B"H
// Boruch Hashem
// Blessed is He

import { access } from 'node:fs/promises';

/**
 * A private browser is a clean vessel, untouched by neighboring sessions.
 * The Awtsmoos renews every executable possibility, while Awtsmoos.com selects
 * only a Chrome binary that truly exists on the present machine.
 */
export class ChromeBinary {
	static async find() {
		const candidates = [
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			'/Applications/Chromium.app/Contents/MacOS/Chromium',
			'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
		];
		for (const candidate of candidates) {
			try {
				await access(candidate);
				return candidate;
			} catch {
				continue;
			}
		}
		throw new Error('No supported Chrome or Chromium binary was found.');
	}
}
