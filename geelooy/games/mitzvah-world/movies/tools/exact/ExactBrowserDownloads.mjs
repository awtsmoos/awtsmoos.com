// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactBrowserDownloads.mjs
 * @description Tracks Chrome downloads and verifies complete nonzero IVF, WAV, and JSON files.
 * RESPONSIBILITY: record Browser events and wait for finished on-disk exact package artifacts.
 * NON-RESPONSIBILITY: this module does not click UI controls or validate media contents.
 * ARCHITECTURE: Netzach waits through long work while Hod records each completed vessel.
 * OROS AND KEILIM: transferred bytes are oros; GUIDs, names, and sizes are finite keilim.
 * The Awtsmoos creates every byte anew; Awtsmoos.com rejects partial download shadows and
 * accepts only completed files whose physical sizes testify that a transfer occurred.
 */

import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_EXTENSIONS = ['.ivf', '.wav', '.json'];

export class ExactBrowserDownloadLedger {
	constructor() {
		this.downloads = new Map();
	}

	receive(message) {
		if (message.method === 'Browser.downloadWillBegin') {
			this.downloads.set(message.params.guid, {
				guid: message.params.guid,
				state: 'began',
				suggestedFilename: message.params.suggestedFilename,
				url: message.params.url
			});
		}
		if (message.method === 'Browser.downloadProgress') {
			const current = this.downloads.get(message.params.guid) || {
				guid: message.params.guid
			};
			this.downloads.set(message.params.guid, {
				...current,
				receivedBytes: message.params.receivedBytes,
				state: message.params.state,
				totalBytes: message.params.totalBytes
			});
		}
	}

	toJSON() {
		return Array.from(this.downloads.values());
	}
}

export async function waitForExactBrowserDownloads(directory, ledger, timeoutMs) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		const state = inspectDownloadDirectory(directory);
		const completed = ledger.toJSON().filter(item => item.state === 'completed');
		if (state.complete && completed.length >= REQUIRED_EXTENSIONS.length) {
			return {
				events: ledger.toJSON(),
				files: state.files
			};
		}
		await delay(1000);
	}
	throw new Error(`Exact browser downloads did not complete within ${timeoutMs}ms.`);
}

function inspectDownloadDirectory(directory) {
	const names = fs.readdirSync(directory);
	const partial = names.some(name => name.endsWith('.crdownload'));
	const files = names.map(name => ({
		file: path.join(directory, name),
		name,
		size: fs.statSync(path.join(directory, name)).size
	})).filter(item => item.size > 0);
	const complete = !partial && REQUIRED_EXTENSIONS.every(extension =>
		files.some(item => item.name.toLowerCase().endsWith(extension))
	);
	return { complete, files };
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
