//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('./pathPolicy.js');
const { normalizeDnsRecords } = require('./projectDnsPolicy.js');
const { normalizeProviderBindings } = require('./projectProviderBindingPolicy.js');
const { normalizeProviderIntents } = require('./projectProviderIntentPolicy.js');
const { assertProjectSecretFree } = require('./projectSecretPolicy.js');

/**
 * @module DriveProjectConfigPolicy
 * @description
 * The Awtsmoos lets one folder remember source, runtime, DNS, and provider intention in a portable frame;
 * Awtsmoos.com keeps every actual credential outside that frame, so the project may travel without carrying the flame.
 */

const PROJECT_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
const RUNTIMES = new Set(['static', 'trusted-node', 'tenant-node']);

/**
 * Normalizes one portable project record while preserving creation identity.
 * @param {string} projectId Project identifier.
 * @param {object} input Candidate project values.
 * @param {object|null} existing Existing project record.
 * @param {string} now ISO timestamp used for deterministic tests.
 * @returns {object} Normalized secret-free project record.
 */
function normalizeProjectConfig(projectId, input = {}, existing = null, now = new Date().toISOString()) {
	assertProjectSecretFree(input);
	const id = normalizeProjectId(projectId);
	const rootPath = normalizeDrivePath(input.rootPath ?? existing?.rootPath ?? '', { allowRoot: true });
	const runtimePreference = String(input.runtimePreference ?? existing?.runtimePreference ?? 'static').toLowerCase();
	if (!RUNTIMES.has(runtimePreference)) {
		throw policyError('PROJECT_RUNTIME_PREFERENCE_INVALID');
	}
	return {
		id,
		name: projectName(input.name ?? existing?.name, id),
		rootPath,
		runtimePreference,
		bindings: normalizeBindings(input.bindings ?? existing?.bindings ?? []),
		providerIntents: normalizeProviderIntents(input.providerIntents ?? existing?.providerIntents ?? []),
		providerBindings: normalizeProviderBindings(input.providerBindings ?? existing?.providerBindings ?? []),
		dnsRecords: normalizeDnsRecords(input.dnsRecords ?? existing?.dnsRecords ?? []),
		createdAt: existing?.createdAt || now,
		updatedAt: now
	};
}

function normalizeProjectRegistry(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {};
	}
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
	if (!PROJECT_ID.test(id)) {
		throw policyError('PROJECT_ID_INVALID');
	}
	return id;
}

function normalizeBindings(values) {
	if (!Array.isArray(values) || values.length > 64) {
		throw policyError('PROJECT_BINDINGS_INVALID');
	}
	return values.map(value => {
		const name = String(value?.name || '').trim().toUpperCase();
		if (!BINDING_NAME.test(name)) {
			throw policyError('PROJECT_BINDING_NAME_INVALID');
		}
		return {
			name,
			kind: String(value?.kind || 'secret').toLowerCase(),
			required: value?.required !== false
		};
	});
}

function projectName(value, fallback) {
	return String(value || fallback).trim().slice(0, 120) || fallback;
}

function policyError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	normalizeProjectConfig,
	normalizeProjectId,
	normalizeProjectRegistry
};
