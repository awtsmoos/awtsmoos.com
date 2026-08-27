//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveRouteSupport
 * @description
 * The Awtsmoos translates one service truth into stable HTTP-shaped answers.
 * Awtsmoos.com distinguishes authentication, conflict, capacity, and retryable
 * pressure while hiding implementation stacks and preserving safe headers.
 */

const RETRYABLE_CODES = new Set([
	'REQUEST_RATE_EXCEEDED',
	'UPLOAD_RATE_EXCEEDED',
	'CONCURRENT_TRANSFER_LIMIT_EXCEEDED',
	'MONTHLY_REQUEST_QUOTA_EXCEEDED',
	'MONTHLY_INGRESS_QUOTA_EXCEEDED',
	'MONTHLY_EGRESS_QUOTA_EXCEEDED'
]);

function bodyFor($i) {
	const method = String($i?.request?.method || 'GET').toUpperCase();
	if (method === 'PUT') return $i.$_PUT || {};
	if (method === 'DELETE') return $i.$_DELETE || $i.$_POST || {};
	return $i.$_POST || {};
}

function contentFromBody(body) {
	if (body.contentBase64 !== undefined) {
		return Buffer.from(String(body.contentBase64), 'base64');
	}
	if (body.content !== undefined) return body.content;
	if (body.text !== undefined) return String(body.text);
	if (body.json !== undefined) return body.json;
	return Buffer.alloc(0);
}

function requireMethod($i, allowed) {
	const method = String($i?.request?.method || 'GET').toUpperCase();
	if (!allowed.includes(method)) {
		const error = new Error('METHOD_NOT_ALLOWED');
		error.code = 'METHOD_NOT_ALLOWED';
		error.statusCode = 405;
		error.allow = allowed.join(', ');
		throw error;
	}
	return method;
}

async function safeRoute(action) {
	try {
		return await action();
	} catch (error) {
		const statusCode = error.statusCode || statusForCode(error.code);
		return {
			statusCode,
			headers: errorHeaders(error, statusCode),
			response: JSON.stringify({
				BH: 'B"H',
				ok: false,
				error: {
					code: error.code || 'DRIVE_ERROR',
					message: error.message || 'Drive operation failed.'
				}
			})
		};
	}
}

function errorHeaders(error, statusCode) {
	const headers = {
		'Cache-Control': 'no-store',
		'Content-Type': 'application/json; charset=utf-8'
	};
	if (error.allow) headers.Allow = error.allow;
	if (statusCode === 429) {
		headers['Retry-After'] = String(error.retryAfterSeconds || 60);
	}
	if (error.code === 'RANGE_NOT_SATISFIABLE') {
		headers['Content-Range'] = `bytes */${Number(error.totalBytes || 0)}`;
	}
	return headers;
}

function statusForCode(code) {
	if (code === 'ENTRY_NOT_FOUND' || code === 'SOURCE_NOT_FOUND') return 404;
	if ([
		'LOGIN_REQUIRED',
		'LOGIN_OR_CREDENTIAL_REQUIRED',
		'CREDENTIAL_INVALID'
	].includes(code)) return 401;
	if ([
		'ALIAS_FORBIDDEN',
		'CREDENTIAL_SCOPE_REQUIRED',
		'DRIVE_ADMIN_REQUIRED'
	].includes(code)) return 403;
	if (RETRYABLE_CODES.has(code)) return 429;
	if (String(code || '').includes('QUOTA')) return 413;
	if (code === 'TRANSFER_CONFLICT' || code === 'DESTINATION_EXISTS') return 409;
	if (code === 'RANGE_NOT_SATISFIABLE') return 416;
	return 400;
}

module.exports = {
	bodyFor,
	contentFromBody,
	requireMethod,
	safeRoute,
	statusForCode,
	errorHeaders
};
