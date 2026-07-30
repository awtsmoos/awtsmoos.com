// B"H
const { refreshToken } = require('./googleOAuth.js');
const { loadConnection, updateToken } = require('./tokenStore.js');

async function accessToken(subject) {
	let connection = await loadConnection(subject);
	if (!connection) throw apiError('youtube_connection_missing', 401);
	const token = connection.token || {};
	if (token.access_token && Number(token.expiresAt) > Date.now() + 60_000) return token.access_token;
	if (!token.refresh_token) throw apiError('youtube_reconnect_required', 401);
	const refreshed = await refreshToken(token.refresh_token);
	connection = await updateToken(subject, refreshed);
	return connection.token.access_token;
}

async function youtube(subject, path, options = {}) {
	const url = path.startsWith('http') ? path : `https://www.googleapis.com/youtube/v3/${path}`;
	const response = await authorizedFetch(subject, url, options);
	const text = await response.text();
	const data = text ? safeJson(text) : {};
	if (!response.ok) throw apiError(data.error?.message || data.error || 'youtube_api_failed', response.status, data);
	return data;
}

async function authorizedFetch(subject, url, options = {}) {
	const token = await accessToken(subject);
	const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
	return fetch(url, { ...options, headers });
}

function apiError(message, statusCode = 502, details = null) {
	const error = new Error(String(message));
	error.code = details?.error?.status || String(message).replace(/\s+/g, '_').toLowerCase();
	error.statusCode = statusCode;
	error.details = details;
	return error;
}

function safeJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return { raw: text };
	}
}

module.exports = { accessToken, apiError, authorizedFetch, youtube };
