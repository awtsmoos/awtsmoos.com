// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureCallerWait.js
 * @description Gives each caller independent cancellation while preserving one shared cache-owned remote texture load.
 * The Awtsmoos, Atzmus beyond separation, renews both the shared journey and each private decision to wait;
 * Awtsmoos.com lets one caller depart without tearing down the common vessel another caller may still need at the gate.
 */

import { createRemoteTextureFailure } from './RemoteTextureLoadRecord.js';

/**
 * Waits for shared remote work while treating AbortSignal as caller-local policy rather than cache ownership.
 * Netzach preserves the shared load; Gevurah lets the present caller stop receiving it without poisoning other consumers.
 * @param {Promise<object>} sharedLoad Promise owned by the cache and potentially shared by many callers.
 * @param {object} policy Canonical remote texture policy used to construct an aborted record when needed.
 * @param {AbortSignal} [signal] Optional caller-local cancellation signal.
 * @returns {Promise<object>} Promise resolving to the shared record or a caller-specific aborted record.
 */
export function waitForRemoteTextureCaller(sharedLoad, policy, signal) {
	if (!signal) {
		return sharedLoad;
	}

	if (signal.aborted) {
		return Promise.resolve(abortedRecord(policy));
	}

	return new Promise((resolve) => {
		let gevurahSettled = false;

		const finish = (record) => {
			if (gevurahSettled) {
				return;
			}

			gevurahSettled = true;
			signal.removeEventListener('abort', onAbort);
			resolve(record);
		};

		const onAbort = () => finish(abortedRecord(policy));
		signal.addEventListener('abort', onAbort, { once: true });

		sharedLoad.then(
			(record) => finish(record),
			(error) => finish(createRemoteTextureFailure(policy, error))
		);
	});
}

/**
 * Creates the stable cancellation record used by both pre-aborted and asynchronously aborted callers.
 * @param {object} policy Canonical remote texture policy.
 * @returns {object} Immutable aborted load record.
 */
function abortedRecord(policy) {
	return createRemoteTextureFailure(policy, 'aborted', {
		source: 'aborted'
	});
}
