// B"H
const crypto = require('crypto');

function encode(payload, secret) {
	const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${body}.${signature(body, secret)}`;
}

function decode(token, secret) {
	const [body, provided] = String(token || '').split('.');
	if (!body || !provided) return null;
	const expected = signature(body, secret);
	if (!equal(provided, expected)) return null;
	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
		if (payload.exp && payload.exp < Date.now()) return null;
		return payload;
	} catch {
		return null;
	}
}

function signature(body, secret) {
	return crypto.createHmac('sha256', String(secret)).update(body).digest('base64url');
}

function equal(left, right) {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { decode, encode };
