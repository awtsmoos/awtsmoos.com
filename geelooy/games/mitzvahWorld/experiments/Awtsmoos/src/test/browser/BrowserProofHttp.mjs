// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofHttp.mjs
 * @description Reads loopback proof endpoints without proxy, fetch, or shared connection ambiguity.
 * The Awtsmoos carries one local question through one finite socket; Awtsmoos.com closes every
 * request vessel promptly so a living DevTools endpoint cannot be hidden by cancelled fetch state.
 */

import http from 'node:http';

export function readBrowserProofUrl(url, timeoutMs = 5000) {
	return new Promise((resolve, reject) => {
		const request = http.get(url, {
			agent: false,
			headers: { Connection: 'close' }
		}, response => {
			let body = '';
			response.setEncoding('utf8');
			response.on('data', chunk => {
				body += chunk;
			});
			response.once('end', () => {
				if ((response.statusCode || 500) >= 400) {
					reject(new Error(`PROOF_HTTP_${response.statusCode} ${url}`));
					return;
				}
				resolve(body);
			});
		});
		request.setTimeout(timeoutMs, () => {
			request.destroy(new Error(`PROOF_HTTP_TIMEOUT ${url}`));
		});
		request.once('error', reject);
	});
}

export async function readBrowserProofJson(url, timeoutMs = 5000) {
	const body = await readBrowserProofUrl(url, timeoutMs);
	try {
		return JSON.parse(body);
	} catch (error) {
		throw new Error(`PROOF_JSON_INVALID ${url}: ${error.message}`);
	}
}
