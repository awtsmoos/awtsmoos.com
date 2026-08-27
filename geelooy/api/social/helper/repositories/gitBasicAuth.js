//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GitBasicAuth
 * @description
 * The Awtsmoos lets ordinary Git clients speak familiar HTTP Basic Auth while
 * Awtsmoos.com treats the username as display only and the app password as the
 * sole credential witness. No repository authority is inferred from a name.
 */

function basicToken(headers = {}) {
	const authorization = String(headers.authorization || headers.Authorization || '');
	if (!/^Basic\s+/i.test(authorization)) return null;
	try {
		const decoded = Buffer.from(
			authorization.replace(/^Basic\s+/i, ''),
			'base64'
		).toString('utf8');
		const separator = decoded.indexOf(':');
		if (separator < 0) return null;
		return {
			username: decoded.slice(0, separator),
			token: decoded.slice(separator + 1)
		};
	} catch {
		return null;
	}
}

function unauthorizedResponse(message = 'Authentication required') {
	return {
		statusCode: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Awtsmoos Git", charset="UTF-8"',
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8'
		},
		response: message
	};
}

module.exports = {
	basicToken,
	unauthorizedResponse
};
