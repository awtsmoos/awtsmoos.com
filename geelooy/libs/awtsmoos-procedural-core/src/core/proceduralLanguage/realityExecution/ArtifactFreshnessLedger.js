//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactFreshnessLedger.js
 * @description Separates portable freshness evidence from opaque in-session artifact materialization, so a persisted receipt never pretends a vanished runtime object still exists.
 * The Awtsmoos renews memory and matter as different vessels whose agreement alone permits rest;
 * Awtsmoos.com records the proof while the living runtime holds the artifact, and neither impersonates the other in the test.
 */
import { stableLanguageHash, stableLanguageJson } from '../data/stableLanguageValue.js';
import { REALITY_EXECUTION_SCHEMAS, REALITY_EXECUTION_VERSION, REALITY_FRESHNESS_STATES } from './RealityExecutionProtocol.js';

export class ArtifactFreshnessLedger {
	constructor(snapshot = null) {
		this.records = new Map();
		this.runtimeArtifacts = new Map();
		for (const record of snapshot?.records || []) {
			this.records.set(createKey(record.definitionId, record.channel), freezePortable(record));
		}
	}

	get(definitionId, channel) {
		return this.records.get(createKey(definitionId, channel)) || null;
	}

	match(definitionId, channel, witnessHash) {
		const key = createKey(definitionId, channel);
		const record = this.records.get(key);
		if (record?.state !== REALITY_FRESHNESS_STATES.fresh || record.witnessHash !== witnessHash) {
			return null;
		}
		if (!this.runtimeArtifacts.has(key)) {
			return null;
		}
		return Object.freeze({ record, runtimeArtifact: this.runtimeArtifacts.get(key) });
	}

	recordFresh({ definitionId, channel, witnessHash, witness, execution }, runtimeArtifact) {
		const record = freezePortable({
			schema: REALITY_EXECUTION_SCHEMAS.record,
			version: REALITY_EXECUTION_VERSION,
			definitionId: String(definitionId),
			channel: String(channel),
			state: REALITY_FRESHNESS_STATES.fresh,
			witnessHash,
			witness,
			execution,
			reason: null
		});
		const key = createKey(definitionId, channel);
		this.records.set(key, record);
		this.runtimeArtifacts.set(key, runtimeArtifact);
		return record;
	}

	markStale(definitionId, channel, reason = 'invalidated') {
		const record = freezePortable({
			schema: REALITY_EXECUTION_SCHEMAS.record,
			version: REALITY_EXECUTION_VERSION,
			definitionId: String(definitionId),
			channel: String(channel),
			state: REALITY_FRESHNESS_STATES.stale,
			witnessHash: null,
			witness: null,
			execution: null,
			reason: String(reason)
		});
		const key = createKey(definitionId, channel);
		this.records.set(key, record);
		this.runtimeArtifacts.delete(key);
		return record;
	}

	retireDefinition(definitionId) {
		const id = String(definitionId);
		const removedChannels = [];
		for (const [key, record] of this.records) {
			if (record.definitionId !== id) continue;
			removedChannels.push(record.channel);
			this.records.delete(key);
			this.runtimeArtifacts.delete(key);
		}
		return Object.freeze(removedChannels.sort());
	}

	snapshot() {
		const records = Object.freeze([...this.records.values()].sort(compareRecords));
		const core = Object.freeze({ schema: REALITY_EXECUTION_SCHEMAS.ledger, version: REALITY_EXECUTION_VERSION, records });
		return Object.freeze({ ...core, ledgerHash: stableLanguageHash(core) });
	}
}

function createKey(definitionId, channel) {
	return stableLanguageJson([String(definitionId), String(channel)]);
}

function compareRecords(left, right) {
	return `${left.definitionId}\u0000${left.channel}`.localeCompare(`${right.definitionId}\u0000${right.channel}`);
}

function freezePortable(value) {
	if (Array.isArray(value)) return Object.freeze(value.map(freezePortable));
	if (value && typeof value === 'object') {
		return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freezePortable(item)])));
	}
	return value;
}
