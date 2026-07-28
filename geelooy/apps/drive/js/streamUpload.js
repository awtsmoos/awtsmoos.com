//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries the original browser File through one bounded stream;
 * Awtsmoos.com avoids base64 copies while keeping identity and metadata explicit.
 */

import {
	API_ROOT,
	assertConnected,
	authenticationHeaders
} from './api.js';
import { encodeDrivePath } from './path.js';
import { driveState } from './state.js';

export function uploadDriveFile(options) {
	assertConnected();
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('PUT', uploadUrl(options.path));
		request.withCredentials = true;
		installHeaders(request, options);
		request.upload.addEventListener('progress', event => {
			options.onProgress?.({ loaded: event.loaded, total: event.total || options.file.size });
		});
		request.addEventListener('load', () => settle(request, resolve, reject));
		request.addEventListener('error', () => reject(new Error('UPLOAD_NETWORK_FAILED')));
		request.addEventListener('abort', () => reject(new Error('UPLOAD_ABORTED')));
		request.send(options.file);
	});
}

function uploadUrl(path) {
	const alias = encodeURIComponent(driveState.aliasId);
	return `${API_ROOT}/drive/${alias}/stream/${encodeDrivePath(path)}`;
}

function installHeaders(request, options) {
	authenticationHeaders().forEach((value, name) => request.setRequestHeader(name, value));
	request.setRequestHeader('idempotency-key', crypto.randomUUID());
	request.setRequestHeader('x-request-id', crypto.randomUUID());
	request.setRequestHeader('x-drive-mime', options.file.type || 'application/octet-stream');
	request.setRequestHeader('x-drive-visibility', options.visibility);
	request.setRequestHeader('x-drive-cache-policy', options.cachePolicy);
}

function settle(request, resolve, reject) {
	const value = safeJson(request.responseText);
	if (request.status >= 200 && request.status < 300) {
		resolve(value);
		return;
	}
	const code = value?.error?.code || `HTTP_${request.status}`;
	const error = new Error(value?.error?.message || code);
	error.code = code;
	error.status = request.status;
	reject(error);
}

function safeJson(text) {
	try {
		return text ? JSON.parse(text) : {};
	} catch {
		return { message: text };
	}
}
