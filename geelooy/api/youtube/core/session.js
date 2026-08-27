// B"H
const crypto = require('crypto');
const { config } = require('./config.js');
const { clearCookie, getCookie, setCookie } = require('./cookies.js');
const { decode, encode } = require('./signedToken.js');

const SESSION_COOKIE = 'awtsmoosYoutubeSession';
const STATE_COOKIE = 'awtsmoosYoutubeOAuth';

function createOAuthState($i, details) {
	const nonce = crypto.randomBytes(24).toString('base64url');
	const payload = {
		nonce,
		mode: details.mode,
		returnTo: safeReturnTo(details.returnTo),
		awtsmoosUserId: details.awtsmoosUserId || null,
		exp: Date.now() + 10 * 60 * 1000
	};
	setCookie($i, STATE_COOKIE, nonce, { path: '/api/youtube', maxAge: 600 });
	return encode(payload, config().sessionSecret);
}

function verifyOAuthState($i, state) {
	const payload = decode(state, config().sessionSecret);
	const nonce = getCookie($i, STATE_COOKIE);
	clearCookie($i, STATE_COOKIE, { path: '/api/youtube' });
	if (!payload || !nonce || payload.nonce !== nonce) return null;
	return payload;
}

function setSession($i, subject) {
	const maxAge = 30 * 24 * 60 * 60;
	const value = encode({ sub: subject, exp: Date.now() + maxAge * 1000 }, config().sessionSecret);
	setCookie($i, SESSION_COOKIE, value, { path: '/', maxAge });
}

function currentSession($i) {
	return decode(getCookie($i, SESSION_COOKIE), config().sessionSecret);
}

function clearSession($i) {
	clearCookie($i, SESSION_COOKIE, { path: '/' });
}

function safeReturnTo(value) {
	const text = String(value || '/youtube/');
	return text.startsWith('/') && !text.startsWith('//') ? text : '/youtube/';
}

module.exports = { clearSession, createOAuthState, currentSession, safeReturnTo, setSession, verifyOAuthState };
