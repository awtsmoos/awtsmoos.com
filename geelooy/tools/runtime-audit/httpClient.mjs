//B"H
// Boruch Hashem
// Blessed is He
import http from 'node:http';
import https from 'node:https';
import { withTimeout } from './timeouts.mjs';

/** Performs one bounded local HTTP request and returns status plus body. */
export function requestText(method, url, timeoutMs) {
	const operation = new Promise((resolve, reject) => {
		const target = new URL(url);
		const transport = target.protocol === 'https:' ? https : http;
		const request = transport.request(target, { method }, response => {
			let body = '';
			response.setEncoding('utf8');
			response.on('data', chunk => body += chunk);
			response.on('end', () => resolve({ status: response.statusCode || 0, body }));
		});
		request.on('error', reject);
		request.end();
	});
	return withTimeout(operation, timeoutMs, `${method} ${url}`);
}

/** Parses bounded JSON while preserving the request location in failures. */
export async function requestJson(method, url, timeoutMs) {
	const response = await requestText(method, url, timeoutMs);
	if (response.status >= 400) throw new Error(`AUDIT_HTTP ${response.status} ${url}`);
	try {
		return JSON.parse(response.body);
	} catch (error) {
		throw new Error(`AUDIT_JSON ${url}: ${error.message}`);
	}
}
