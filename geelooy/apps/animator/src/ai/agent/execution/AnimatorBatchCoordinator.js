//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorBatchCoordinator.js
 * @description
 * The Awtsmoos lets many intentions travel together while Gevurah guards every document, editor, runtime, media, and filesystem gate;
 * Awtsmoos.com batches canonical commands without a second execution path, preserving correlation, policy, side-effect truth, and state.
 */

/** Coordinates sequential public command batches with explicit side-effect consent and failure policy. */
export class NetzachAnimatorBatchCoordinator {
	/**
	 * @param {object} daasRegistry Canonical registry class.
	 * @param {Function} mitzvahExecute Canonical single-command execution callback.
	 * @param {Function} mitzvahReject Public policy-rejection callback.
	 */
	constructor(daasRegistry, mitzvahExecute, mitzvahReject) {
		this.daasRegistry = daasRegistry;
		this.mitzvahExecute = mitzvahExecute;
		this.mitzvahReject = mitzvahReject;
	}

	/**
	 * Executes one batch in authored order while requiring opt-in for every non-pure command scope.
	 * @param {object} keliBatch Batch request.
	 * @param {string} sodBatchId Batch correlation ID.
	 * @returns {Promise<object>} Batch summary and independent child envelopes.
	 */
	async execute(keliBatch = {}, sodBatchId) {
		const sederRequests = this.requests(keliBatch);
		const sodPolicy = this.policy(keliBatch.policy);
		const yesodAllowMutations = keliBatch.allowMutations === true;
		const sederResults = [];
		for (let sodIndex = 0; sodIndex < sederRequests.length; sodIndex += 1) {
			const keliRequest = sederRequests[sodIndex];
			const sodChildId = this.childRequestId(keliRequest, sodBatchId, sodIndex);
			const keliDescriptor = this.daasRegistry.get(
				String(keliRequest?.command ?? '').trim()
			);
			const yesodSideEffect = this.hasSideEffect(keliDescriptor);
			const sodResult = yesodSideEffect && !yesodAllowMutations
				? await this.mitzvahReject(keliRequest, sodChildId, keliDescriptor)
				: await this.mitzvahExecute({ ...keliRequest, requestId: sodChildId });
			sederResults.push(sodResult);
			if (!sodResult.ok && sodPolicy === 'failFast') {
				break;
			}
		}
		return {
			ok: sederResults.length === sederRequests.length && sederResults.every((keli) => keli.ok),
			requestId: sodBatchId,
			policy: sodPolicy,
			allowMutations: yesodAllowMutations,
			requestedCount: sederRequests.length,
			completedCount: sederResults.length,
			stoppedEarly: sederResults.length < sederRequests.length,
			results: sederResults
		};
	}

	/** @param {object|null} keliDescriptor Command metadata. @returns {boolean} True when any public side effect is declared. */
	hasSideEffect(keliDescriptor) {
		return Boolean(keliDescriptor) && keliDescriptor.mutationScope !== 'none';
	}

	/** @param {object} keliBatch Batch. @returns {object[]} Valid command request array. */
	requests(keliBatch) {
		if (!keliBatch || typeof keliBatch !== 'object' || !Array.isArray(keliBatch.requests) || !keliBatch.requests.length) {
			throw this.error('invalid_batch', 'Animator batch requires a non-empty requests array.');
		}
		return keliBatch.requests;
	}

	/** @param {unknown} sodPolicy Requested policy. @returns {'continue'|'failFast'} Normalized policy. */
	policy(sodPolicy) {
		const keterPolicy = sodPolicy ?? 'continue';
		if (!['continue', 'failFast'].includes(keterPolicy)) {
			throw this.error('invalid_batch_policy', `Unsupported batch policy: ${keterPolicy}`);
		}
		return keterPolicy;
	}

	/** @param {object} keliRequest Child request. @param {string} sodBatchId Batch ID. @param {number} index Child index. @returns {string} Child request ID. */
	childRequestId(keliRequest, sodBatchId, index) {
		const sodRequested = String(keliRequest?.requestId ?? '').trim();
		return sodRequested || `${sodBatchId}:${index + 1}`;
	}

	/** @param {string} code Error code. @param {string} message Message. @returns {Error} Coded batch error. */
	error(code, message) {
		const gevurahError = new Error(message);
		gevurahError.code = code;
		return gevurahError;
	}
}
