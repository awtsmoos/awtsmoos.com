//B"H
// Boruch Hashem
// Blessed is He

const { projectDnsAdapter } = require('./projectProviderAdapterRegistry.js');
const { projectProviderAdapterContext } = require('./projectProviderContext.js');
const { sanitizeDnsResult } = require('./projectProviderResult.js');

/**
 * @module DriveProjectDnsSync
 * @description
 * The Awtsmoos lets validated DNS intention meet a provider without letting provider authority enter portable state;
 * Awtsmoos.com returns manual instructions when no adapter is attached and sanitized testimony when automation succeeds.
 */

async function syncProjectDns(project, options = {}) {
	const intent = project.providerIntents?.find(item => item.kind === 'domain') || null;
	const records = Array.from(project.dnsRecords || []);
	if (!intent || !records.length) return { state: 'not-configured' };
	const binding = project.providerBindings?.find(item => item.kind === 'domain' && item.provider === intent.provider)?.binding || null;
	const adapter = projectDnsAdapter(options.$i, intent.provider);
	if (!adapter) {
		return {
			state: 'manual',
			provider: intent.provider,
			hostname: intent.id,
			binding,
			records,
			reason: 'SERVER_PROVIDER_ADAPTER_NOT_ATTACHED'
		};
	}
	const result = sanitizeDnsResult(await adapter.apply({
		...projectProviderAdapterContext(project, options),
		provider: intent.provider,
		hostname: intent.id,
		binding,
		records
	}));
	return {
		state: 'synced',
		provider: intent.provider,
		hostname: intent.id,
		binding,
		recordCount: records.length,
		...result,
		syncedAt: new Date().toISOString()
	};
}

module.exports = { syncProjectDns };
