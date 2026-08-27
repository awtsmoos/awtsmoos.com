// B"H
function assertSameOrigin($i) {
	const method = String($i.request.method || 'GET').toUpperCase();
	if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return;
	const origin = $i.request.headers.origin;
	if (!origin) return;
	const host = String($i.request.headers.host || '').toLowerCase();
	let originHost = '';
	try {
		originHost = new URL(origin).host.toLowerCase();
	} catch {
		throw requestError('invalid_origin', 403);
	}
	if (!host || originHost !== host) throw requestError('cross_origin_request_blocked', 403);
}

function requestError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = { assertSameOrigin, requestError };
