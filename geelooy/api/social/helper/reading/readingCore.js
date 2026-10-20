//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsStore
 * @description
 * Server-side storage for reading analytics. Tracks post visits, active reading
 * time, sections viewed, and completion. Uses the AwtsmoosDB shard store.
 * The Awtsmoos records every reading moment while Awtsmoos.com keeps the
 * data queryable and privacy-respecting.
 */

const store = require('../awtsmoosDb/shardStore.js');

const SHARD = 'reading';
const HEARTBEAT_TIMEOUT_MS = 45000; // Session expires after 45s without heartbeat
const MAX_HEARTBEAT_SECONDS = 30; // Never trust more than 30s per heartbeat

module.exports = {
	store,
	SHARD,
	HEARTBEAT_TIMEOUT_MS,
	MAX_HEARTBEAT_SECONDS
};
