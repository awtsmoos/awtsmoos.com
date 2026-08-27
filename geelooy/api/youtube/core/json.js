// B"H
function packet(data, statusCode = 200, headers = {}) {
	return {
		statusCode,
		mimeType: 'application/json; charset=utf-8',
		headers: { 'Cache-Control': 'private, no-store, max-age=0', ...headers },
		response: JSON.stringify(data, null, 2)
	};
}

function ok(extra = {}, statusCode = 200) {
	return packet({ BH: 'B"H', ok: true, ...extra }, statusCode);
}

function fail(error, statusCode = 400, extra = {}) {
	const code = typeof error === 'string' ? error : error?.code || 'youtube_request_failed';
	const message = typeof error === 'string' ? undefined : error?.message;
	return packet({ BH: 'B"H', ok: false, error: code, ...(message ? { message } : {}), ...extra }, statusCode);
}

function redirect(location) {
	return {
		statusCode: 302,
		mimeType: 'text/html; charset=utf-8',
		headers: { Location: String(location), 'Cache-Control': 'private, no-store, max-age=0' },
		response: `<!doctype html><title>Continuing</title><a href="${escapeHtml(location)}">Continue</a>`
	};
}

function escapeHtml(value) {
	return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

module.exports = { fail, ok, packet, redirect };
