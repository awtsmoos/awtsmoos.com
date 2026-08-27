// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactBrowserEvidence.mjs
 * @description Preserves browser readiness, errors, screenshots, and durable JSON receipts.
 * RESPONSIBILITY: wait for the visible control and serialize success or failure evidence.
 * NON-RESPONSIBILITY: this module does not create targets, click controls, or render media.
 * ARCHITECTURE: Hod receives testimony while Malchus fixes it into durable project memory.
 * OROS AND KEILIM: runtime events are oros; screenshots and JSON receipts are keilim.
 * The Awtsmoos renews success and failure alike; Awtsmoos.com keeps both visible so future
 * agents inherit observed truth rather than a softened story of what supposedly happened.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
	captureExactScreenshot,
	exactPackageButtonState
} from './ExactBrowserPage.mjs';

export async function waitForClickableExactPackageButton(session, attempts = 180) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const state = await exactPackageButtonState(session);
		if (state.readyState === 'complete' && state.exists && state.visible && !state.disabled) {
			return state;
		}
		await delay(1000);
	}
	throw new Error('Visible Render Exact Package control never became ready.');
}

export function collectBrowserEvidenceEntry(entries, message) {
	const accepted = [
		'Runtime.consoleAPICalled',
		'Runtime.exceptionThrown',
		'Log.entryAdded'
	];
	if (accepted.includes(message.method)) {
		entries.push({ method: message.method, params: message.params });
	}
}

export async function captureFailureScreenshot(session, directory) {
	const file = path.join(directory, 'browser-failure.png');
	try {
		await captureExactScreenshot(session, file);
		return file;
	} catch {
		return null;
	}
}

export function prepareExactEvidenceDirectory(directory) {
	fs.rmSync(directory, { force: true, recursive: true });
	fs.mkdirSync(directory, { recursive: true });
}

export function writeExactBrowserReceipt(file, receipt) {
	fs.writeFileSync(file, `${JSON.stringify(receipt, null, '\t')}\n`);
	return receipt;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
