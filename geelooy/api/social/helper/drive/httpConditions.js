//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveHttpConditions
 * @description
 * The Awtsmoos lets unchanged bytes remain silent and selected bytes flow alone.
 * Awtsmoos.com evaluates validators and one safe RFC-style byte range per request.
 */

function etagForHash(hash) {
	return `"sha256-${hash}"`;
}

function isNotModified(headers, etag, updatedAt) {
	const ifNoneMatch = headerValue(headers, 'if-none-match');
	if (ifNoneMatch) {
		const candidates = ifNoneMatch.split(',').map(value => value.trim());
		if (candidates.includes('*') || candidates.includes(etag)) return true;
	}
	const ifModifiedSince = headerValue(headers, 'if-modified-since');
	if (!ifNoneMatch && ifModifiedSince) {
		const requestedTime = Date.parse(ifModifiedSince);
		const resourceTime = Date.parse(updatedAt);
		if (Number.isFinite(requestedTime) && Number.isFinite(resourceTime)) {
			return resourceTime <= requestedTime + 999;
		}
	}
	return false;
}

function parseByteRange(headers, totalBytes) {
	const value = headerValue(headers, 'range');
	if (!value) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
	if (!match || totalBytes <= 0) throw rangeError(totalBytes);
	let start;
	let end;
	if (!match[1]) {
		const suffix = Number(match[2]);
		if (!Number.isInteger(suffix) || suffix <= 0) throw rangeError(totalBytes);
		start = Math.max(0, totalBytes - suffix);
		end = totalBytes - 1;
	} else {
		start = Number(match[1]);
		end = match[2] ? Number(match[2]) : totalBytes - 1;
	}
	if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= totalBytes || end < start) {
		throw rangeError(totalBytes);
	}
	return { start, end: Math.min(end, totalBytes - 1) };
}

function headerValue(headers, name) {
	if (!headers) return '';
	const direct = headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
	if (direct !== undefined) return String(direct);
	const found = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}

function rangeError(totalBytes) {
	const error = new Error('RANGE_NOT_SATISFIABLE');
	error.code = 'RANGE_NOT_SATISFIABLE';
	error.totalBytes = totalBytes;
	return error;
}

module.exports = {
	etagForHash,
	isNotModified,
	parseByteRange,
	headerValue
};
