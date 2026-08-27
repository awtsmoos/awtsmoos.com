//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('./pathPolicy.js');
const { normalizeDnsRecords } = require('./projectDnsPolicy.js');
const { normalizeNativeComputeRecipe } = require('./projectNativeComputePolicy.js');
const { normalizeProviderBindings } = require('./projectProviderBindingPolicy.js');
const { normalizeProviderIntents } = require('./projectProviderIntentPolicy.js');
const { assertProjectSecretFree } = require('./projectSecretPolicy.js');

/**
 * @module DriveProjectConfigPolicy
 * @description
 * The Awtsmoos lets one folder remember source, runtime recipe, DNS, and provider intention in a portable frame;
 * Awtsmoos.com keeps actual credentials and live machine identity outside that frame, so the project may travel without carrying the flame.
 */

const PROJECT_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
const RUNTIMES = new Set(['static', 'native-compute', 'trusted-node', 'tenant-node']);

/** Normalize one portable project record while preserving creation identity. */
function normalizeProjectConfig(projectId, input = {}, existing = null, now = new Date().toISOString()) {
	assertProjectSecretFree(input);
	const id = normalizeProjectId(projectId);
	const runtimePreference = normalizeRuntimePreference(input.runtimePreference ?? existing?.runtimePreference);
	return {
		id,
		name: projectName(input.name ?? existing?.name, id),
		rootPath: normalizeDrivePath(input.rootPath ?? existing?.rootPath ?? '', { allowRoot: true }),
		runtimePreference,
		runtimeRecipe: normalizeNativeComputeRecipe(input.runtimeRecipe ?? existing?.runtimeRecipe, runtimePreference),
		bindings: normalizeBindings(input.bindings ?? existing?.bindings ?? []),
		providerIntents: normalizeProviderIntents(input.providerIntents ?? existing?.providerIntents ?? []),
		providerBindings: normalizeProviderBindings(input.providerBindings ?? existing?.providerBindings ?? []),
		dnsRecords: normalizeDnsRecords(input.dnsRecords ?? existing?.dnsRecords ?? []),
		createdAt: existing?.createdAt || now,
		updatedAt: now
	};
}

/** Normalize a stored registry while discarding malformed historical entries. */
function normalizeProjectRegistry(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {};
	}
	const result = {};
	for (const [id, config] of Object.entries(value)) {
		try {
			result[id] = normalizeProjectConfig(id, config, config, config.updatedAt || config.createdAt);
		} catch {
			continue;
		}
	}
	return result;
}

/** Normalize one supported project runtime preference. */
function normalizeRuntimePreference(value) {
	const runtime = String(value || 'static').trim().toLowerCase();
	if (!RUNTIMES.has(runtime)) {
		throw policyError('PROJECT_RUNTIME_PREFERENCE_INVALID');
	}
	return runtime;
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
	return values.map(normalizeBinding);
}

function normalizeBinding(value = {}) {
	const name = String(value.name || '').trim().toUpperCase();
	if (!BINDING_NAME.test(name)) {
		throw policyError('PROJECT_BINDING_NAME_INVALID');
	}
	return { name, kind: String(value.kind || 'secret').toLowerCase(), required: value.required !== false };
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

module.exports = { normalizeProjectConfig, normalizeProjectId, normalizeProjectRegistry };
