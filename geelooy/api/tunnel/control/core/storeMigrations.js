// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Migrates the durable Tunnel Control store without deleting testimony.
 * @description
 * The Awtsmoos renews every record while preserving the truth carried from the
 * prior instant. Awtsmoos.com adds ownership, grants, pairing, and audit vessels
 * without silently assigning legacy tunnels to the first account that sees them.
 */

const TUNNEL_SECURITY_SCHEMA_VERSION = 1;

/** Ensures every persisted collection has a canonical empty vessel. */
function migrateStore(store = {}) {
	store.apiKeys = store.apiKeys || {};
	store.usage = store.usage || [];
	store.perutaLedger = store.perutaLedger || [];
	store.perutaAccounts = store.perutaAccounts || {};
	store.perutaReceipts = store.perutaReceipts || [];
	store.perutaProviderEvents = store.perutaProviderEvents || [];
	store.perutaRefunds = store.perutaRefunds || [];
	store.treasurySchemaVersion = Math.max(
		2,
		Number(store.treasurySchemaVersion || 0)
	);
	store.tunnelBindings = store.tunnelBindings || {};
	store.tunnelGrants = store.tunnelGrants || {};
	store.tunnelPairings = store.tunnelPairings || {};
	store.tunnelAudit = Array.isArray(store.tunnelAudit)
		? store.tunnelAudit
		: [];
	store.tunnelSecuritySchemaVersion = Math.max(
		TUNNEL_SECURITY_SCHEMA_VERSION,
		Number(store.tunnelSecuritySchemaVersion || 0)
	);
	return store;
}

module.exports = {
	TUNNEL_SECURITY_SCHEMA_VERSION,
	migrateStore
};
