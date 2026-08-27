// B"H
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { config } = require('./config.js');
const { decrypt, encrypt } = require('./vault.js');

function recordPath(subject) {
	const name = crypto.createHash('sha256').update(String(subject)).digest('hex');
	return path.join(config().usersRoot, `${name}.json`);
}

async function prepareRoot() {
	await fs.mkdir(config().usersRoot, { recursive: true, mode: 0o700 });
	await fs.chmod(config().usersRoot, 0o700).catch(() => null);
}

async function loadConnection(subject) {
	try {
		const envelope = JSON.parse(await fs.readFile(recordPath(subject), 'utf8'));
		return decrypt(envelope, config().tokenSecret);
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

async function saveConnection({ profile, token, awtsmoosUserId = null }) {
	const existing = await loadConnection(profile.sub);
	const normalized = normalizeToken(token, existing?.token);
	const record = {
		version: 1,
		profile: safeProfile(profile),
		awtsmoosUserId: awtsmoosUserId || existing?.awtsmoosUserId || null,
		token: normalized,
		createdAt: existing?.createdAt || Date.now(),
		updatedAt: Date.now()
	};
	await writeRecord(profile.sub, record);
	return record;
}

async function updateToken(subject, token) {
	const record = await loadConnection(subject);
	if (!record) throw Object.assign(new Error('youtube_connection_missing'), { code: 'youtube_connection_missing', statusCode: 401 });
	record.token = normalizeToken(token, record.token);
	record.updatedAt = Date.now();
	await writeRecord(subject, record);
	return record;
}

async function deleteConnection(subject) {
	await fs.unlink(recordPath(subject)).catch(error => {
		if (error.code !== 'ENOENT') throw error;
	});
}

async function writeRecord(subject, record) {
	await prepareRoot();
	const target = recordPath(subject);
	const temporary = `${target}.${process.pid}.tmp`;
	await fs.writeFile(temporary, JSON.stringify(encrypt(record, config().tokenSecret)), { mode: 0o600 });
	await fs.rename(temporary, target);
	await fs.chmod(target, 0o600).catch(() => null);
}

function normalizeToken(next = {}, previous = {}) {
	return {
		access_token: next.access_token || previous.access_token || '',
		refresh_token: next.refresh_token || previous.refresh_token || '',
		token_type: next.token_type || previous.token_type || 'Bearer',
		scope: next.scope || previous.scope || '',
		expiresAt: next.expires_in ? Date.now() + Number(next.expires_in) * 1000 : next.expiresAt || previous.expiresAt || 0
	};
}

function safeProfile(profile = {}) {
	return { sub: profile.sub, email: profile.email || null, name: profile.name || null, picture: profile.picture || null };
}

module.exports = { deleteConnection, loadConnection, saveConnection, updateToken };
