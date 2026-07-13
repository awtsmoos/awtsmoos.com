// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingOperations.js
 * @description Performs one explicit ownership mutation after generation completes.
 * The Awtsmoos remains one ground while Awtsmoos.com separates preparation,
 * validation, retained revelation, observation, retirement, and safe return.
 */
import { WorldChunkCollisionGeneratedHandoff } from './WorldChunkCollisionGeneratedHandoff.js';
import { WORLD_CHUNK_COLLISION_STREAMING_STATES as S } from './WorldChunkCollisionStreamingStates.js';
import { collisionStreamingHandoffIds } from './WorldChunkCollisionStreamingValues.js';

/** Prepares every generated child while leaving the parent sole query owner. */
export function prepareCollisionStreamingChildren(job, index, at) {
	job.handoff = new WorldChunkCollisionGeneratedHandoff({
		index,
		parentId: job.request.parentId,
		definitions: job.generated.definitions
	});
	job.handoff.prepareAll();
	job.transition(S.PREPARED, 'prepare-children', at, Object.freeze({
		preparedIds: job.childIds
	}));
}

/** Validates exactly one canonical child. */
export function validateNextCollisionStreamingChild(job, at) {
	const chunkId = job.childIds[job.nextValidationIndex];
	job.handoff.validateOne(chunkId, {
		at,
		name: `${job.request.requestId}:validation`
	});
	job.nextValidationIndex += 1;
	const complete = job.nextValidationIndex === job.childIds.length;
	job.transition(
		complete ? S.VALIDATED : S.VALIDATING,
		'validate-child',
		at,
		Object.freeze({ chunkId, complete })
	);
}

/** Activates all validated children while intentionally retaining the parent. */
export function activateCollisionStreamingChildren(job, at) {
	const ids = collisionStreamingHandoffIds(job.request.requestId);
	job.handoff.activateRetained({ handoffId: ids.activation, at });
	job.transition(S.RETAINED_ACTIVE, 'activate-retained', at, Object.freeze({
		parentRetained: true,
		childIds: job.childIds
	}));
}

/** Consumes one retained-parent observation update before readiness can appear. */
export function observeCollisionStreamingHandoff(job, at) {
	const alreadyObserving = job.state === S.OBSERVING;
	job.observationFrames += 1;
	const ready = alreadyObserving
		&& job.observationFrames >= job.request.minimumObservationFrames;
	job.transition(
		ready ? S.RETIREMENT_READY : S.OBSERVING,
		'observe-retained',
		at,
		Object.freeze({ frames: job.observationFrames, ready })
	);
}

/** Retires the parent only after explicit authorization and observation. */
export function retireCollisionStreamingParent(job, at) {
	const ids = collisionStreamingHandoffIds(job.request.requestId);
	job.handoff.retireParent({ handoffId: ids.retirement, at });
	job.transition(S.RETIRED, 'retire-parent', at, Object.freeze({
		parentId: job.request.parentId,
		childIds: job.childIds
	}));
}

/** Discards all prepared or validated children and verifies parent-only ownership. */
export function rollbackCollisionStreamingChildren(job, index, at, reason) {
	const discardedIds = [];
	for (const chunkId of [...job.childIds].reverse()) {
		if (index.hasPrepared(chunkId)) {
			index.discardPrepared(chunkId, { at, reason });
			discardedIds.push(chunkId);
		}
	}
	const leakedIds = job.childIds.filter((chunkId) => (
		index.hasPrepared(chunkId) || index.hasActive(chunkId)
	));
	job.rollback = Object.freeze({
		at,
		reason,
		discardedIds: Object.freeze(discardedIds),
		leakedIds: Object.freeze(leakedIds)
	});
	if (leakedIds.length > 0) {
		throw new Error(`Collision rollback leaked children: ${leakedIds.join(', ')}`);
	}
}
