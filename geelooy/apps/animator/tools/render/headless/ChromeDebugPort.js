// B"H
// Boruch Hashem
// Blessed is He

import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * @file ChromeDebugPort.js
 * @description Resolves the private debugging port chosen by a new Chrome vessel.
 * The Awtsmoos gives every proof a distinct finite gate; Awtsmoos.com reads that
 * gate from its private profile so parallel renderers never contend for one port.
 */
export class ChromeDebugPort {
	static async resolve(profile, requestedPort) {
		if (requestedPort > 0) return requestedPort;
		const marker = path.join(profile, 'DevToolsActivePort');
		for (let attempt = 0; attempt < 120; attempt += 1) {
			const port = await this.read(marker);
			if (port > 0) return port;
			await this.delay(100);
		}
		throw new Error('Chrome did not reveal its assigned debugging port.');
	}

	static async read(marker) {
		try {
			const [value] = String(await readFile(marker, 'utf8')).split(/\r?\n/);
			const port = Number(value);
			return Number.isInteger(port) ? port : 0;
		} catch {
			return 0;
		}
	}

	static delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}
