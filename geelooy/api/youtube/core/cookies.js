// B"H
function requestCookies($i) {
	if ($i.request.cookies && typeof $i.request.cookies === 'object') return $i.request.cookies;
	return String($i.request.headers.cookie || '').split(';').reduce((all, item) => {
		const index = item.indexOf('=');
		if (index < 0) return all;
		all[item.slice(0, index).trim()] = decodeURIComponent(item.slice(index + 1).trim());
		return all;
	}, {});
}

function getCookie($i, name) {
	return requestCookies($i)[name] || '';
}

function setCookie($i, name, value, options = {}) {
	const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path || '/'}`];
	if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Number(options.maxAge))}`);
	if (options.httpOnly !== false) parts.push('HttpOnly');
	if (options.secure !== false) parts.push('Secure');
	parts.push(`SameSite=${options.sameSite || 'Lax'}`);
	appendCookie($i, parts.join('; '));
}

function clearCookie($i, name, options = {}) {
	setCookie($i, name, '', { ...options, maxAge: 0 });
}

function appendCookie($i, value) {
	const existing = $i.response.getHeader?.('Set-Cookie');
	const list = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
	$i.response.setHeader('Set-Cookie', [...list, value]);
}

module.exports = { clearCookie, getCookie, setCookie };
