//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExecutionCoordinator.js
 * @description
 * The Awtsmoos joins validation, execution, timing, policy rejection, and response into one measured path while each concern keeps its vessel;
 * Awtsmoos.com centralizes public command life so single calls, typed facades, and batches never fork behavior at another level.
 */

import { AnimatorCommandValidator } from '../AnimatorCommandValidator.js';
import { HodAnimatorResponseRenderer } from '../protocol/AnimatorResponseRenderer.js';
import { TiferesAnimatorExecutionTrace } from './AnimatorExecutionTrace.js';

/** Coordinates one canonical command lifecycle without owning domain behavior. */
export class TiferesAnimatorExecutionCoordinator {
	/** @param {object} merkavahRouter Canonical family router. */
	constructor(merkavahRouter) {
		this.merkavahRouter = merkavahRouter;
	}

	/** @param {object} keliEnvelope Public request. @param {string} sodFallbackId Correlation fallback. @returns {Promise<object>} Public envelope. */
	async execute(keliEnvelope = {}, sodFallbackId) {
		const shemMitzvah = String(keliEnvelope?.command ?? 'unknown').trim() || 'unknown';
		let keliTrace = TiferesAnimatorExecutionTrace.start(
			shemMitzvah,
			this.preflightRequestId(keliEnvelope?.requestId, sodFallbackId)
		);
		try {
			const sederCommand = AnimatorCommandValidator.normalize(keliEnvelope);
			if (sederCommand.requestId) {
				keliTrace.requestId = sederCommand.requestId;
			}
			keliTrace.command = sederCommand.command;
			const orResult = await this.merkavahRouter.execute(
				sederCommand.command,
				sederCommand.payload
			);
			keliTrace = TiferesAnimatorExecutionTrace.finish(keliTrace);
			return HodAnimatorResponseRenderer.success(keliTrace, orResult);
		} catch (gevurahError) {
			keliTrace = TiferesAnimatorExecutionTrace.finish(keliTrace);
			return HodAnimatorResponseRenderer.failure(keliTrace, gevurahError);
		}
	}

	/**
	 * Renders a backward-compatible batch policy failure for any declared non-pure side effect.
	 * @param {object} keliRequest Rejected child request.
	 * @param {string} sodRequestId Child correlation ID.
	 * @param {object|null} keliDescriptor Command metadata.
	 * @returns {Promise<object>} Public failure envelope.
	 */
	async rejectBatchMutation(keliRequest, sodRequestId, keliDescriptor = null) {
		let keliTrace = TiferesAnimatorExecutionTrace.start(
			String(keliRequest?.command ?? 'unknown'),
			sodRequestId
		);
		const gevurahError = new Error('Batch side effects require allowMutations: true.');
		gevurahError.code = 'batch_mutation_not_allowed';
		gevurahError.details = {
			command: keliRequest?.command ?? null,
			mutationScope: keliDescriptor?.mutationScope ?? 'unknown'
		};
		keliTrace = TiferesAnimatorExecutionTrace.finish(keliTrace);
		return HodAnimatorResponseRenderer.failure(keliTrace, gevurahError);
	}

	/** @param {unknown} sodRequestId Caller request ID. @param {string} sodFallbackId Generated fallback. @returns {string} Correlation ID. */
	preflightRequestId(sodRequestId, sodFallbackId) {
		const sodCandidate = String(sodRequestId ?? '').trim();
		return sodCandidate && sodCandidate.length <= 160 ? sodCandidate : sodFallbackId;
	}
}
