//B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const { writeJsonAtomic } = require('../drive/stateRepository.js');
const { credentialPath, repositoryPaths } = require('./repositoryPaths.js');
const { normalizePermissions, repositoryError } = require('./repositoryPolicy.js');
const {
	createRepositorySecret,
	parseRepositoryToken,
	verifyRepositorySecret
} = require('./repositoryCredentialCrypto.js');

/**
 * @module RepositoryCredentialService
 * @description
 * The Awtsmoos lets ordinary Git clients receive a one-time app password while
 * Awtsmoos.com keeps only salted proof, repository scope, expiration, and bounded
 * last-used testimony. Revocation changes authority without rewriting Git URLs.
 */

async function createRepositoryCredential(options = {}) {
	const secret = await createRepositorySecret();
	const record = {
		credentialId: secret.credentialId,
		name: boundedName(options.name),
		permissions: normalizePermissions(options.permissions || ['read']),
		expiresAt: normalizeExpiry(options.expiresAt),
		secretHash: secret.secretHash,
		salt: secret.salt,
		createdAt: Date.now(),
		lastUsedAt: null,
		revokedAt: null
	};
	const file = credentialPath(options.aliasId, options.repoId, secret.credentialId, options.$i);
	await fs.promises.mkdir(repositoryPaths(options.aliasId, options.repoId, options.$i).credentials, { recursive: true });
	await writeJsonAtomic(file, record);
	return { credential: publicRecord(record), token: secret.token };
}

async function listRepositoryCredentials(options = {}) {
	const folder = repositoryPaths(options.aliasId, options.repoId, options.$i).credentials;
	let files = [];
	try { files = await fs.promises.readdir(folder); } catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	const rows = await Promise.all(files.filter(name => name.endsWith('.json')).map(async name => {
		try { return publicRecord(JSON.parse(await fs.promises.readFile(`${folder}/${name}`, 'utf8'))); }
		catch { return null; }
	}));
	return rows.filter(Boolean);
}

async function revokeRepositoryCredential(options = {}) {
	const record = await readCredential(options);
	if (!record) throw repositoryError('REPOSITORY_CREDENTIAL_NOT_FOUND');
	record.revokedAt = Date.now();
	await writeJsonAtomic(credentialPath(options.aliasId, options.repoId, record.credentialId, options.$i), record);
	return publicRecord(record);
}

async function verifyRepositoryCredential(options = {}) {
	const parsed = parseRepositoryToken(options.token);
	if (!parsed) return null;
	const record = await readCredential({ ...options, credentialId: parsed.credentialId });
	if (!active(record) || !record.permissions.includes(options.permission || 'read')) return null;
	if (!(await verifyRepositorySecret(parsed.secret, record.salt, record.secretHash))) return null;
	record.lastUsedAt = Date.now();
	await writeJsonAtomic(credentialPath(options.aliasId, options.repoId, record.credentialId, options.$i), record);
	return publicRecord(record);
}

async function readCredential(options) {
	try {
		return JSON.parse(await fs.promises.readFile(credentialPath(options.aliasId, options.repoId, options.credentialId, options.$i), 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

function active(record) {
	return Boolean(record && !record.revokedAt && (!record.expiresAt || record.expiresAt > Date.now()));
}

function publicRecord(record) {
	const { secretHash, salt, ...safe } = record;
	return safe;
}

function boundedName(value) {
	const name = String(value || 'Git app password').trim();
	if (!name || name.length > 80) throw repositoryError('INVALID_REPOSITORY_CREDENTIAL_NAME');
	return name;
}

function normalizeExpiry(value) {
	if (!value) return null;
	const timestamp = Number(new Date(value));
	if (!Number.isFinite(timestamp) || timestamp <= Date.now()) throw repositoryError('INVALID_REPOSITORY_CREDENTIAL_EXPIRY');
	return timestamp;
}

module.exports = {
	createRepositoryCredential,
	listRepositoryCredentials,
	revokeRepositoryCredential,
	verifyRepositoryCredential
};
