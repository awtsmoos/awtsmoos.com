//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorBatchCoordinator.js
 * @description
 * The Awtsmoos lets many intentions travel together while Gevurah still guards every mutation gate;
 * Awtsmoos.com batches canonical commands without inventing a second execution path, preserving correlation, policy, and state.
 */

/** Coordinates sequential public command batches with explicit mutation consent and failure policy. */
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
	 * Executes one batch in authored order, optionally halting at the first failure.
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
			const keliDescriptor = this.daasRegistry.get(String(keliRequest?.command ?? '').trim());
			const sodResult = keliDescriptor?.mutation && !yesodAllowMutations
				? await this.mitzvahReject(keliRequest, sodChildId)
				: await this.mitzvahExecute({ ...keliRequest, requestId: sodChildId });
			sederResults.push(sodResult);
			if (!sodResult.ok && sodPolicy === 'failFast') break;
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
		if (!['continue', 'failFast'].includes(keterPolicy)) throw this.error('invalid_batch_policy', `Unsupported batch policy: ${keterPolicy}`);
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
