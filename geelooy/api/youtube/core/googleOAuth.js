// B"H
const { config, scopesFor } = require('./config.js');

function authorizationUrl(state, mode) {
	const current = config();
	const query = new URLSearchParams({
		client_id: current.clientId,
		redirect_uri: current.redirectUri,
		response_type: 'code',
		access_type: 'offline',
		include_granted_scopes: 'true',
		prompt: 'consent',
		scope: scopesFor(mode).join(' '),
		state
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

async function exchangeCode(code) {
	const current = config();
	return tokenRequest({
		code,
		client_id: current.clientId,
		client_secret: current.clientSecret,
		redirect_uri: current.redirectUri,
		grant_type: 'authorization_code'
	});
}

async function refreshToken(refreshTokenValue) {
	const current = config();
	return tokenRequest({
		refresh_token: refreshTokenValue,
		client_id: current.clientId,
		client_secret: current.clientSecret,
		grant_type: 'refresh_token'
	});
}

async function userInfo(accessToken) {
	const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok || !data.sub) throw googleError(data, response.status, 'google_userinfo_failed');
	return data;
}

async function revokeToken(token) {
	if (!token) return;
	await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});
}

async function tokenRequest(values) {
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(values)
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) throw googleError(data, response.status, 'google_oauth_failed');
	return data;
}

function googleError(data, statusCode, fallback) {
	const error = new Error(data.error_description || data.error?.message || data.error || fallback);
	error.code = data.error?.status || data.error || fallback;
	error.statusCode = statusCode || 502;
	return error;
}

module.exports = { authorizationUrl, exchangeCode, refreshToken, revokeToken, userInfo };
