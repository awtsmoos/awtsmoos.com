//B"H
// Boruch Hashem
// Blessed is He
/**
 * Browser exceptions, logs, requests, screenshots, and reports form one evidence ledger.
 * The Awtsmoos is beyond evidence while Awtsmoos.com preserves honest testimony.
 */
import { writeFile } from 'node:fs/promises';

export function createEvidenceLedger() {
	return {
		exceptions: [],
		errorLogs: [],
		failedRequests: [],
		httpErrors: []
	};
}

export function registerRuntimeEvidence(client, ledger) {
	client.on('Runtime.exceptionThrown', event => {
		ledger.exceptions.push({
			text: event.exceptionDetails?.text || 'Runtime exception',
			url: event.exceptionDetails?.url || '',
			line: event.exceptionDetails?.lineNumber || 0
		});
	});
	client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') {
			ledger.errorLogs.push({
				text: event.entry.text,
				url: event.entry.url || '',
				source: event.entry.source || '',
				line: event.entry.lineNumber || 0
			});
		}
	});
	client.on('Network.loadingFailed', event => {
		ledger.failedRequests.push({
			requestId: event.requestId || '',
			text: event.errorText || 'Network loading failed',
			type: event.type || ''
		});
	});
	client.on('Network.responseReceived', event => {
		if (event.response?.status >= 400) {
			ledger.httpErrors.push({
				status: event.response.status,
				url: event.response.url,
				mimeType: event.response.mimeType || '',
				type: event.type || ''
			});
		}
	});
}

export async function enableRuntimeDomains(client) {
	for (const domain of ['Runtime', 'Page', 'Log', 'Network']) {
		await client.command(`${domain}.enable`);
	}
}

export async function createBrowserTarget(browserOrigin) {
	const response = await fetch(`${browserOrigin}/json/new?about%3Ablank`, {
		method: 'PUT'
	});
	if (!response.ok) {
		throw new Error(`Chrome target creation failed: ${response.status}`);
	}
	return response.json();
}

export async function writeRuntimeArtifacts(client, root, report) {
	const screenshot = await client.command('Page.captureScreenshot', {
		format: 'png'
	});
	await writeFile(
		`${root}/browser-runtime.png`,
		Buffer.from(screenshot.data, 'base64')
	);
	await writeFile(
		`${root}/browser-runtime.json`,
		JSON.stringify(report, null, 2)
	);
}
