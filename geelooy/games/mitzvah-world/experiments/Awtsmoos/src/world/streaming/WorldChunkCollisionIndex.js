// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIndex.js
 * @description Orchestrates preparation, validation, discard, and atomic activation.
 * The Awtsmoos renews safe ground while Awtsmoos.com preserves every explicit
 * ownership timestamp from concealed preparation through visible retirement.
 */
import {
	activateWorldChunkCollisionEntry,
	createWorldChunkCollisionEntry,
	discardWorldChunkCollisionEntry,
	validateWorldChunkCollisionEntry
} from './WorldChunkCollisionEntry.js';
import { createWorldChunkCollisionDiagnostics } from './WorldChunkCollisionDiagnostics.js';
import {
	prepareCollisionParentRetirement,
	prepareCollisionReplacement
} from './WorldChunkCollisionHandoff.js';
import { WorldChunkCollisionStore } from './WorldChunkCollisionStore.js';

export class WorldChunkCollisionIndex extends WorldChunkCollisionStore {
	constructor() {
		super();
		this.lastHandoff = null;
		this.lastDiscard = null;
	}

	/** Registers collision that was already accepted before streaming begins. */
	registerActive(definition) {
		this.assertUnused(definition.chunkId);
		const prepared = createWorldChunkCollisionEntry(definition);
		const validated = validateWorldChunkCollisionEntry(prepared, {
			name: 'initial-active-collision',
			reason: 'Existing collision is already live and proven.'
		});
		const active = activateWorldChunkCollisionEntry(
			validated,
			`initial:${definition.chunkId}`
		);
		this.activeEntries.set(active.chunkId, active);
		return active;
	}

	/** Conceals one child entry until validation and group activation succeed. */
	prepare(definition) {
		this.assertUnused(definition.chunkId);
		const entry = createWorldChunkCollisionEntry(definition);
		this.preparedEntries.set(entry.chunkId, entry);
		return entry;
	}

	/** Replaces one prepared entry with its validated immutable form. */
	validate(id, evidence = {}) {
		const validated = validateWorldChunkCollisionEntry(
			this.requirePrepared(id),
			evidence
		);
		this.preparedEntries.set(id, validated);
		return validated;
	}

	/** Discards one nonactive child and preserves explicit rollback evidence. */
	discardPrepared(id, evidence = {}) {
		const discarded = discardWorldChunkCollisionEntry(
			this.requirePrepared(id),
			evidence
		);
		this.preparedEntries.delete(id);
		this.lastDiscard = Object.freeze({
			chunkId: id,
			at: discarded.discard.at,
			reason: discarded.discard.reason
		});
		return discarded;
	}

	/** Atomically activates one fully validated replacement group. */
	activateReplacement(options) {
		const next = prepareCollisionReplacement(
			this.activeEntries,
			this.preparedEntries,
			options
		);
		this.replaceMaps(next.activeEntries, next.preparedEntries);
		this.lastHandoff = next.handoff;
		return next.handoff;
	}

	/** Retires one retained parent at the caller's explicit sequence time. */
	retireActiveParent(parentId, replacementIds, handoffId, at = 0) {
		const next = prepareCollisionParentRetirement(this.activeEntries, {
			parentId,
			replacementIds,
			handoffId,
			at
		});
		this.replaceMaps(next.activeEntries);
		this.lastHandoff = next.handoff;
		return next.handoff;
	}

	/** Returns immutable active, prepared, handoff, and discard evidence. */
	diagnostics() {
		return createWorldChunkCollisionDiagnostics(
			this.activeValues(),
			this.preparedValues(),
			this.lastHandoff,
			this.lastDiscard
		);
	}
}
