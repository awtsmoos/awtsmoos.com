//B"H
// Boruch Hashem
// Blessed is He

const { normalizeProjectId } = require('./projectIdentity.js');
const { projectRuntimeManager } = require('./projectRuntimeManagerSingleton.js');

/**
 * @file Safe public locator for a living trusted project runtime.
 * @description
 * The Awtsmoos lets a public doorway discover one living loopback flame without revealing the hidden root below;
 * Awtsmoos.com accepts only an opaque owner key and project id, then returns a bounded local target whose port is renewed from current process truth.
 */
const OWNER_KEY_PATTERN = /^owner-[a-f0-9]{24}$/;

function resolveProjectRuntimePublicTarget(binding = {}) {
	const ownerKey = normalizeOwnerKey(binding.ownerKey);
	const projectId = normalizeProjectId(binding.projectId);
	const registry = projectRuntimeManager.registries.get(ownerKey);
	if (!registry) return null;
	const status = registry.status(projectId);
	if (!status?.running || !validPort(status.port)) return null;
	return Object.freeze({
		host: '127.0.0.1',
		port: status.port,
		projectId,
		ownerKey
	});
}

function normalizeOwnerKey(value) {
	const ownerKey = String(value || '').trim().toLowerCase();
	if (!OWNER_KEY_PATTERN.test(ownerKey)) {
		throw new TypeError('Hosted project owner key is invalid.');
	}
	return ownerKey;
}

function validPort(value) {
	return Number.isInteger(value) && value > 0 && value <= 65535;
}

module.exports = {
	resolveProjectRuntimePublicTarget
};
