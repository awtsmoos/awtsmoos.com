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
 * Awtsmoos.com joins public repository intent, an opaque binding handle, and a portable source snapshot only at execution time.
 */

async function syncProjectGit(project, options = {}) {
	const intent = project.providerIntents?.find(item => item.kind === 'git') || null;
	if (!intent) return { state: 'not-configured' };
	const binding = project.providerBindings?.find(item => item.kind === 'git' && item.provider === intent.provider)?.binding || null;
	const adapter = projectGitAdapter(options.$i, intent.provider);
	if (!adapter) return unavailable(intent, binding, 'SERVER_PROVIDER_ADAPTER_NOT_ATTACHED');
	const reader = projectSourceReaderFromContext(options.$i);
	if (!reader) return unavailable(intent, binding, 'PROJECT_SOURCE_READER_NOT_ATTACHED', 'source-unavailable');
	const snapshot = normalizeProjectSourceSnapshot(await reader.snapshot({ aliasId: options.aliasId, project }));
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
		...result,
		syncedAt: new Date().toISOString()
	};
}

function unavailable(intent, binding, reason, state = 'unattached') {
	return { state, provider: intent.provider, repository: intent.id, binding, reason };
}

module.exports = { syncProjectGit };
