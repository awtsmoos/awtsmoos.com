//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('./pathPolicy.js');

/**
 * @module DriveProjectConfigPolicy
 * @description
 * The Awtsmoos lets a folder remember project intent without swallowing credentials;
 * Awtsmoos.com normalizes names, bindings, provider wishes, and runtime preference into a portable covenant.
 */

const PROJECT_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
const RUNTIMES = new Set(['static', 'trusted-node', 'tenant-node']);
const PROVIDER_KINDS = new Set(['git', 'auth', 'social', 'domain', 'runtime', 'database']);
const FORBIDDEN_KEY = /(?:token|secret|password|credential|api.?key|private.?key)/i;

function normalizeProjectConfig(projectId, input = {}, existing = null, now = new Date().toISOString()) {
	const id = normalizeProjectId(projectId);
	assertCredentialFree(input);
	const rootPath = normalizeDrivePath(input.rootPath ?? existing?.rootPath ?? '', { allowRoot: true });
	const name = String(input.name ?? existing?.name ?? id).trim().slice(0, 120) || id;
	const runtimePreference = String(input.runtimePreference ?? existing?.runtimePreference ?? 'static').toLowerCase();
	if (!RUNTIMES.has(runtimePreference)) throw policyError('PROJECT_RUNTIME_PREFERENCE_INVALID');
	return {
		id,
		name,
		rootPath,
		runtimePreference,
		bindings: normalizeBindings(input.bindings ?? existing?.bindings ?? []),
		providerIntents: normalizeProviderIntents(input.providerIntents ?? existing?.providerIntents ?? []),
		createdAt: existing?.createdAt || now,
		updatedAt: now
	};
}

function normalizeProjectRegistry(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	const result = {};
	for (const [id, config] of Object.entries(value)) {
		try {
			result[id] = normalizeProjectConfig(id, config, config, config.updatedAt || config.createdAt);
		} catch {}
	}
	return result;
}

function normalizeProjectId(value) {
	const id = String(value || '').trim().toLowerCase();
	if (!PROJECT_ID.test(id)) throw policyError('PROJECT_ID_INVALID');
	return id;
}

function normalizeBindings(values) {
	if (!Array.isArray(values) || values.length > 64) throw policyError('PROJECT_BINDINGS_INVALID');
	return values.map(value => {
		const name = String(value?.name || '').trim().toUpperCase();
		if (!BINDING_NAME.test(name)) throw policyError('PROJECT_BINDING_NAME_INVALID');
		return { name, kind: String(value?.kind || 'secret').toLowerCase(), required: value?.required !== false };
	});
}

function normalizeProviderIntents(values) {
	if (!Array.isArray(values) || values.length > 32) throw policyError('PROJECT_PROVIDER_INTENTS_INVALID');
	return values.map(value => {
		const kind = String(value?.kind || '').toLowerCase();
		if (!PROVIDER_KINDS.has(kind)) throw policyError('PROJECT_PROVIDER_KIND_INVALID');
		const provider = String(value?.provider || '').trim().toLowerCase();
		if (!provider || provider.length > 80) throw policyError('PROJECT_PROVIDER_INVALID');
		return { kind, provider, id: String(value?.id || provider).trim().slice(0, 160), mode: String(value?.mode || 'default').slice(0, 40) };
	});
}

function assertCredentialFree(value, trail = 'project') {
	if (!value || typeof value !== 'object') return;
	for (const [key, child] of Object.entries(value)) {
		if (FORBIDDEN_KEY.test(key) && key !== 'bindings') throw policyError(`PROJECT_CREDENTIAL_FIELD_FORBIDDEN:${trail}.${key}`);
		assertCredentialFree(child, `${trail}.${key}`);
	}
}

function policyError(code) {
	const error = new Error(code);
	error.code = String(code).split(':')[0];
	error.statusCode = 400;
	return error;
}

module.exports = { normalizeProjectConfig, normalizeProjectId, normalizeProjectRegistry };
