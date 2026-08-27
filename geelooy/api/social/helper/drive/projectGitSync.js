//B"H
// Boruch Hashem
// Blessed is He

const { projectGitAdapter } = require('./projectProviderAdapterRegistry.js');
const { projectProviderAdapterContext } = require('./projectProviderContext.js');
const { sanitizeGitResult } = require('./projectProviderResult.js');
const { normalizeProjectSourceSnapshot, projectSourceReaderFromContext } = require('./projectSourceReader.js');

/**
 * @module DriveProjectGitSync
 * @description
 * The Awtsmoos lets source flow toward Git without letting Git learn how the source was stored;
 * Awtsmoos.com joins repository intent, an opaque provider-specific binding, and a measured snapshot only at execution time, then returns secret-free testimony in rhyme.
 */

/**
 * Synchronizes one project through its configured Git provider.
 * @param {object} project Normalized portable project record.
 * @param {object} options Trusted actor, request, and server context.
 * @returns {Promise<object>} Secret-free synchronization testimony.
 */
async function syncProjectGit(project, options = {}) {
	const intent = findGitIntent(project);
	if (!intent) {
		return { state: 'not-configured' };
	}
	const binding = findGitBinding(project, intent.provider);
	const adapter = projectGitAdapter(options.$i, intent.provider);
	if (!adapter) {
		return unavailableState(intent, binding, 'SERVER_PROVIDER_ADAPTER_NOT_ATTACHED');
	}
	const reader = projectSourceReaderFromContext(options.$i);
	if (!reader) {
		return unavailableState(intent, binding, 'PROJECT_SOURCE_READER_NOT_ATTACHED', 'source-unavailable');
	}
	const snapshot = normalizeProjectSourceSnapshot(await reader.snapshot({
		aliasId: options.aliasId,
		project
	}));
	const result = sanitizeGitResult(await adapter.sync({
		...projectProviderAdapterContext(project, options),
		provider: intent.provider,
		repository: intent.id,
		binding,
		files: snapshot.files
	}));
	return {
		state: 'synced',
		provider: intent.provider,
		repository: intent.id,
		binding,
		fileCount: snapshot.files.length,
		totalBytes: snapshot.totalBytes,
		...result,
		syncedAt: new Date().toISOString()
	};
}

/** Finds the public Git provider intention. */
function findGitIntent(project) {
	return project.providerIntents?.find(item => item.kind === 'git') || null;
}

/** Finds the provider-specific opaque credential handle. */
function findGitBinding(project, provider) {
	return project.providerBindings?.find(item => item.kind === 'git' && item.provider === provider)?.binding || null;
}

/** Builds a truthful non-synchronized state without inventing provider success. */
function unavailableState(intent, binding, reason, state = 'unattached') {
	return {
		state,
		provider: intent.provider,
		repository: intent.id,
		binding,
		reason
	};
}

module.exports = { syncProjectGit };
