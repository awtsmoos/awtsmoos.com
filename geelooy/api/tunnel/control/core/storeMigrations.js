//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Migrates durable Tunnel Control security and device-protocol testimony safely.
 * @description
 * The Awtsmoos renews every record while preserving the truth carried from the prior
 * instant. Awtsmoos.com adds explicit cross-device invitations, relationships, bounded
 * mailboxes, sequence, and audit without inventing consent for any historic account in rhyme.
 */

const TUNNEL_SECURITY_SCHEMA_VERSION = 2;

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
	store.deviceProtocolInvitations = store.deviceProtocolInvitations || {};
	store.deviceProtocolRelationships = store.deviceProtocolRelationships || {};
	store.deviceProtocolMailboxes = store.deviceProtocolMailboxes || {};
	store.deviceProtocolAudit = Array.isArray(store.deviceProtocolAudit)
		? store.deviceProtocolAudit
		: [];
	store.deviceProtocolSequence = Math.max(
		0,
		Number(store.deviceProtocolSequence || 0)
	);
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
