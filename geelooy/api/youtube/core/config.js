// B"H
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE_SCOPES = [
	'openid',
	'email',
	'profile',
	'https://www.googleapis.com/auth/youtube.readonly'
];

const MODE_SCOPES = {
	read: BASE_SCOPES,
	upload: [...BASE_SCOPES, 'https://www.googleapis.com/auth/youtube.upload'],
	manage: [
		...BASE_SCOPES,
		'https://www.googleapis.com/auth/youtube.upload',
		'https://www.googleapis.com/auth/youtube.force-ssl'
	]
};

function secretRoot() {
	return process.env.YOUTUBE_SECRET_ROOT || path.join(os.homedir(), '.awtsmoos-secrets', 'youtube');
}

function readText(file) {
	try {
		return fs.readFileSync(file, 'utf8').trim();
	} catch {
		return '';
	}
}

function readClient() {
	const file = process.env.YOUTUBE_GOOGLE_CLIENT_FILE || path.join(secretRoot(), 'google-oauth.json');
	try {
		const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
		return { file, record: parsed.web || parsed.installed || {} };
	} catch {
		return { file, record: {} };
	}
}

function config() {
	const client = readClient();
	const redirects = Array.isArray(client.record.redirect_uris) ? client.record.redirect_uris : [];
	return {
		clientFile: client.file,
		clientId: process.env.YOUTUBE_GOOGLE_CLIENT_ID || client.record.client_id || '',
		clientSecret: process.env.YOUTUBE_GOOGLE_CLIENT_SECRET || client.record.client_secret || '',
		redirectUri: process.env.YOUTUBE_OAUTH_REDIRECT_URI || redirects[0] || 'https://awtsmoos.com/api/youtube/oauth/callback',
		sessionSecret: process.env.YOUTUBE_SESSION_SECRET || readText(path.join(secretRoot(), 'session.key')),
		tokenSecret: process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY || readText(path.join(secretRoot(), 'tokens.key')),
		secretRoot: secretRoot(),
		usersRoot: path.join(secretRoot(), 'users')
	};
}

function scopesFor(mode) {
	return MODE_SCOPES[mode] || MODE_SCOPES.read;
}

function normalizeMode(mode) {
	return Object.hasOwn(MODE_SCOPES, mode) ? mode : 'read';
}

function missingConfig() {
	const current = config();
	return [
		['clientId', 'Google OAuth client ID'],
		['clientSecret', 'Google OAuth client secret'],
		['redirectUri', 'Google OAuth redirect URI'],
		['sessionSecret', 'YouTube session signing key'],
		['tokenSecret', 'YouTube token encryption key']
	].filter(([key]) => !current[key]).map(([, label]) => label);
}

module.exports = { config, missingConfig, normalizeMode, scopesFor, secretRoot };
