// B"H // Boruch Hashem // Blessed is He
/**
 * @file WorldChunkCollisionGeneratedHandoff.js
 * @description Coordinates explicit generated-child ownership transitions.
 * The Awtsmoos remains one ground while eight vessels prepare and awaken;
 * Awtsmoos.com never hides validation, sequence time, or parent retirement.
 */
import { WORLD_CHUNK_COLLISION_STATES as C } from './WorldChunkCollisionState.js';
import {
	assertGeneratedHandoffIndex,
	canonicalGeneratedHandoffDefinitions,
	generatedHandoffIndexDefinition,
	requireGeneratedHandoffText,
	requireGeneratedHandoffTime
} from './WorldChunkCollisionGeneratedHandoffValues.js';

export class WorldChunkCollisionGeneratedHandoff {
	constructor({ index, parentId, definitions } = {}) {
		this.index = assertGeneratedHandoffIndex(index);
		this.parentId = requireGeneratedHandoffText(parentId, 'Parent collision ID');
		this.definitions = canonicalGeneratedHandoffDefinitions(
			definitions,
			this.parentId
		);
		this.childIds = Object.freeze(
			this.definitions.map((definition) => definition.chunkId)
		);
		this.phase = 'created';
	}

	/** Prepares every generated child in canonical ID order. */
	prepareAll() {
		this.requirePhase('created');
		for (const definition of this.definitions) {
			this.index.prepare(generatedHandoffIndexDefinition(definition));
		}
		this.phase = 'prepared';
		return this.receipt('prepare');
	}

	/** Validates one owned child using explicit deterministic evidence. */
	validateOne(chunkId, evidence = {}) {
		if (!['prepared', 'validating'].includes(this.phase)) {
			throw new Error(`Cannot validate generated children during ${this.phase}.`);
		}
		if (!this.childIds.includes(chunkId)) {
			throw new Error(`Unknown generated collision child: ${String(chunkId)}`);
		}
		const at = requireGeneratedHandoffTime(evidence.at, 'Validation time');
		this.index.validate(chunkId, Object.freeze({ ...evidence, at }));
		this.phase = this.allValidated() ? 'validated' : 'validating';
		return this.receipt('validate', chunkId);
	}

	/** Validates every remaining child in canonical order at one sequence time. */
	validateAll({ at, name = 'generated-child-validation' } = {}) {
		requireGeneratedHandoffTime(at, 'Validation time');
		for (const chunkId of this.childIds) {
			if (!this.validatedIds().includes(chunkId)) {
				this.validateOne(chunkId, { at, name });
			}
		}
		return this.receipt('validate-all');
	}

	/** Activates all validated children while retaining the active parent. */
	activateRetained({ handoffId, at } = {}) {
		this.requirePhase('validated');
		this.index.activateReplacement({
			parentId: this.parentId,
			childIds: this.childIds,
			retainParent: true,
			handoffId: requireGeneratedHandoffText(handoffId, 'Handoff ID'),
			at: requireGeneratedHandoffTime(at, 'Handoff time')
		});
		this.phase = 'retained-active';
		return this.receipt('activate-retained');
	}

	/** Retires the parent after complete accepted child activation. */
	retireParent({ handoffId, at } = {}) {
		this.requirePhase('retained-active');
		this.index.retireActiveParent(
			this.parentId,
			this.childIds,
			requireGeneratedHandoffText(handoffId, 'Retirement ID'),
			requireGeneratedHandoffTime(at, 'Retirement time')
		);
		this.phase = 'retired';
		return this.receipt('retire-parent');
	}

	allValidated() {
		return this.validatedIds().length === this.childIds.length;
	}

	validatedIds() {
		return this.index.preparedSnapshot()
			.filter((entry) => entry.state === C.VALIDATED)
			.map((entry) => entry.chunkId)
			.filter((chunkId) => this.childIds.includes(chunkId));
	}

	receipt(operation, chunkId = null) {
		return Object.freeze({
			operation,
			chunkId,
			phase: this.phase,
			parentId: this.parentId,
			childIds: this.childIds,
			diagnostics: this.index.diagnostics()
		});
	}

	requirePhase(expected) {
		if (this.phase !== expected) {
			throw new Error(`Expected handoff phase ${expected}, got ${this.phase}.`);
		}
	}
}
