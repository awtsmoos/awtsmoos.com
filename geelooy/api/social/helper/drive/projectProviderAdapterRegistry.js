//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectProviderAdapterRegistry
 * @description
 * The Awtsmoos lets many external clouds become replaceable vessels around one project covenant;
 * Awtsmoos.com prefers explicit trusted adapters and never lets provider choice alter portable project state.
 */

function projectGitAdapter(context = {}, provider = '') {
	return explicitAdapter(context, 'git', provider);
}

function projectDnsAdapter(context = {}, provider = '') {
	return explicitAdapter(context, 'dns', provider)
		|| explicitAdapter(context, 'domain', provider);
}

function explicitAdapter(context, kind, provider) {
	const value = context?.projectProviderAdapters?.[kind];
	if (supports(value)) {
		return value;
	}
	const byProvider = value?.[provider];
	return supports(byProvider) ? byProvider : null;
}

function supports(value) {
	return typeof value?.sync === 'function' || typeof value?.apply === 'function';
}

module.exports = { projectDnsAdapter, projectGitAdapter };
