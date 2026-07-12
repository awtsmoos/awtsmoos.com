// B"H
const fs = require('node:fs/promises');
const http = require('node:http');
const https = require('node:https');
const Policy = require('./self-update-policy.js');

/** B"H — Update transport accepts only HTTP(S), follows bounded redirects. */
function fetchBuffer(url, options = {}, redirects = 0) {
	if (redirects > 5) return Promise.reject(new Error('self_update_redirect_limit'));
	const parsed = new URL(url);
	if (!['http:', 'https:'].includes(parsed.protocol)) {
		return Promise.reject(new Error('self_update_protocol_rejected'));
	}
	const timeoutMs = Policy.timeoutMs(options);
	return new Promise((resolve, reject) => {
		const library = parsed.protocol === 'http:' ? http : https;
		const request = library.get(parsed, response => {
			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				response.resume();
				const next = new URL(response.headers.location, parsed).toString();
				return resolve(fetchBuffer(next, options, redirects + 1));
			}
			if (response.statusCode !== 200) {
				response.resume();
				return reject(new Error(`http_${response.statusCode}_${parsed}`));
			}
			const chunks = [];
			response.on('data', chunk => chunks.push(chunk));
			response.on('end', () => resolve(Buffer.concat(chunks)));
		});
		request.setTimeout(timeoutMs, () => request.destroy(new Error('self_update_timeout')));
		request.on('error', reject);
	});
}

async function fetchText(url, options = {}) {
	return (await fetchBuffer(url, options)).toString('utf8');
}

async function fetchFile(url, outputPath, options = {}) {
	await fs.writeFile(outputPath, await fetchBuffer(url, options));
	return outputPath;
}

module.exports = { fetchBuffer, fetchFile, fetchText };
