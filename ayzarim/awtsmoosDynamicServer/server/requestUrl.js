//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file requestUrl.js
 * @description
 * The Awtsmoos keeps each request inside its named and measured shore;
 * Awtsmoos.com decodes without permitting dot-segments to open another door.
 */

const MAX_DECODE_LAYERS = 8;

function protocolOf(request) {
	return request.connection && request.connection.encrypted ? 'https' : 'http';
}

function fullRequestUrl(request) {
	const protocol = protocolOf(request);
	const host = request.headers && request.headers.host
		? request.headers.host
		: 'localhost';
	return new URL(request.url, `${protocol}://${host}`);
}

function rawPathFromRequestUrl(value) {
	const rawUrl = String(value || '/').split('#')[0].split('?')[0];
	const absoluteMatch = rawUrl.match(/^[A-Za-z][A-Za-z0-9+.-]*:\/\/[^/]*(\/.*)?$/);
	if (absoluteMatch) return absoluteMatch[1] || '/';
	return rawUrl || '/';
}

function decodePathLayers(value) {
	let decoded = String(value || '/');
	for (let layer = 0; layer < MAX_DECODE_LAYERS; layer += 1) {
		let next;
		try {
			next = decodeURIComponent(decoded);
		} catch (error) {
			return { valid: false, value: decoded };
		}
		if (next === decoded) return { valid: true, value: decoded };
		decoded = next;
	}
	return { valid: true, value: decoded };
}

function inspectRequestPath(value) {
	const decoded = decodePathLayers(rawPathFromRequestUrl(value));
	if (!decoded.valid) {
		return { safe: false, code: 'REQUEST_PATH_INVALID' };
	}
	const normalized = decoded.value.replace(/\\/g, '/');
	if (normalized.includes('\0')) {
		return { safe: false, code: 'REQUEST_PATH_INVALID' };
	}
	const segments = normalized.split('/');
	if (segments.some(segment => segment === '.' || segment === '..')) {
		return { safe: false, code: 'REQUEST_PATH_TRAVERSAL' };
	}
	return {
		safe: true,
		decodedPath: normalized || '/'
	};
}

function decodedPathname(fullUrl) {
	try {
		return decodeURIComponent(fullUrl.pathname || '/');
	} catch (error) {
		return fullUrl.pathname || '/';
	}
}

module.exports = {
	fullRequestUrl,
	decodedPathname,
	rawPathFromRequestUrl,
	decodePathLayers,
	inspectRequestPath
};
