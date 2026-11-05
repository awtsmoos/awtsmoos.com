// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingEngine.js
 * @description Advances, cancels, or recovers one collision lifecycle operation.
 * The Awtsmoos joins all phases without confusion; Awtsmoos.com gives each phase
 * one sequence time, bounded generation, and one safe path back to the parent.
 */
import {
	beginCollisionStreamingGeneration,
	disposeCollisionStreamingGeneration,
	stepCollisionStreamingGeneration
} from './WorldChunkCollisionStreamingGenerationOperations.js';
import {
	activateCollisionStreamingChildren,
	observeCollisionStreamingHandoff,
	prepareCollisionStreamingChildren,
	retireCollisionStreamingParent,
	rollbackCollisionStreamingChildren,
	validateNextCollisionStreamingChild
} from './WorldChunkCollisionStreamingOperations.js';
import { WORLD_CHUNK_COLLISION_STREAMING_STATES as S } from './WorldChunkCollisionStreamingStates.js';

/** Advances exactly one legal lifecycle operation. */
export function advanceCollisionStreamingJob({
	job,
	index,
	dependencies,
	at,
	maximumGenerationUnits
}) {
	switch (job.state) {
		case S.GENERATION_PENDING:
			return beginCollisionStreamingGeneration(job, dependencies, at);
		case S.GENERATING:
			return stepCollisionStreamingGeneration(
				job,
				dependencies,
				at,
				maximumGenerationUnits
			);
		case S.GENERATED:
			prepareCollisionStreamingChildren(job, index, at);
			break;
		case S.PREPARED:
		case S.VALIDATING:
			validateNextCollisionStreamingChild(job, at);
			break;
		case S.VALIDATED:
			activateCollisionStreamingChildren(job, at);
			break;
		case S.RETAINED_ACTIVE:
		case S.OBSERVING:
			observeCollisionStreamingHandoff(job, at);
			break;
		case S.RETIREMENT_READY:
			return retireAuthorizedParent(job, at);
		default:
			return 'no-operation';
	}
	return job.history.at(-1)?.operation || 'no-operation';
}

/** Cancels generation or rolls back every concealed prepared child. */
export function cancelCollisionStreamingJob(job, index, at) {
	if ([S.GENERATION_PENDING, S.GENERATING].includes(job.state)) {
		disposeCollisionStreamingGeneration(job, job.cancelRequest.reason);
		job.transition(S.CANCELLED, 'cancel-generation', at, job.cancelRequest);
		return 'cancel-generation';
	}
	rollbackCollisionStreamingChildren(job, index, at, job.cancelRequest.reason);
	job.transition(S.CANCELLED, 'cancel-and-rollback', at, job.rollback);
	return 'cancel-and-rollback';
}

/** Converts any failed operation into verified rollback or manual recovery. */
export function recoverCollisionStreamingFailure(job, index, error, at) {
	job.setError(error, job.history.at(-1)?.operation || 'advance');
	if ([S.GENERATION_PENDING, S.GENERATING].includes(job.state)) {
		disposeCollisionStreamingGeneration(job, job.error.message);
		job.transition(S.FAILED, 'generation-failed', at, job.error);
		return 'generation-failed';
	}
	if ([S.RETAINED_ACTIVE, S.OBSERVING, S.RETIREMENT_READY].includes(job.state)) {
		job.transition(S.MANUAL_RECOVERY, 'post-activation-failure', at, job.error);
		return 'manual-recovery';
	}
	try {
		rollbackCollisionStreamingChildren(job, index, at, job.error.message);
		job.transition(S.FAILED, 'failure-rollback', at, job.error);
		return 'failure-rollback';
	} catch (rollbackError) {
		job.transition(S.FAILED, 'failure-before-rollback', at, job.error);
		job.setError(rollbackError, 'rollback');
		job.transition(S.ROLLBACK_FAILED, 'rollback-failed', at, job.error);
		return 'rollback-failed';
	}
}

function retireAuthorizedParent(job, at) {
	if (!job.retirementRequest || at < job.retirementRequest.at) {
		return 'retirement-locked';
	}
	retireCollisionStreamingParent(job, at);
	return 'retire-parent';
}
