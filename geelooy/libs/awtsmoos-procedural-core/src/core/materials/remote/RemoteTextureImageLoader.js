// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureImageLoader.js
 * @description Owns one browser Image loading lifecycle without cache state or material-domain knowledge.
 * The Awtsmoos, Atzmus beyond form, renews the image element, the clock, and the instant of arrival from nothing;
 * Awtsmoos.com keeps this Yesod vessel narrow so transport timing may change without rewriting material identity or geometry truth.
 */

import {
	createRemoteTextureFailure,
	createRemoteTextureSuccess
} from './RemoteTextureLoadRecord.js';

/**
 * Loads one browser image according to an already validated remote texture policy.
 * The loader performs the side effect; cache ownership remains elsewhere so multiple callers may share one journey safely.
 * @param {object} policy Canonical remote texture policy with HTTPS URL and timeout.
 * @param {object} [options={}] Injectable browser primitives for runtime portability and deterministic tests.
 * @returns {Promise<object>} Promise resolving to an immutable success or failure record.
 */
export function loadRemoteTextureImageElement(policy, options = {}) {
	const malchusImageCtor = options.ImageCtor ?? globalThis.Image;
	const netzachNow = options.now ?? monotonicNow;
	const gevurahSetTimeout = options.setTimeoutFn ?? globalThis.setTimeout;
	const gevurahClearTimeout = options.clearTimeoutFn ?? globalThis.clearTimeout;

	if (typeof malchusImageCtor !== 'function') {
		return Promise.resolve(
			createRemoteTextureFailure(policy, 'image-constructor-unavailable')
		);
	}

	return new Promise((resolve) => {
		const netzachStartedAt = netzachNow();
		const malchusImage = new malchusImageCtor();
		let gevurahSettled = false;
		let gevurahTimer = null;

		const finish = (ok, error = null) => {
			if (gevurahSettled) {
				return;
			}

			gevurahSettled = true;
			gevurahClearTimeout(gevurahTimer);
			malchusImage.onload = null;
			malchusImage.onerror = null;
			const netzachDurationMs = Math.max(0, netzachNow() - netzachStartedAt);

			if (ok) {
				resolve(createRemoteTextureSuccess(policy, malchusImage, {
					durationMs: netzachDurationMs
				}));
				return;
			}

			resolve(createRemoteTextureFailure(policy, error, {
				durationMs: netzachDurationMs
			}));
		};

		malchusImage.crossOrigin = 'anonymous';
		malchusImage.decoding = 'async';
		malchusImage.onload = () => finish(true);
		malchusImage.onerror = () => finish(false, 'image-load-error');
		gevurahTimer = gevurahSetTimeout(
			() => finish(false, 'timeout'),
			policy.timeoutMs
		);
		malchusImage.src = policy.url;
	});
}

/**
 * Returns a monotonic timestamp when available, falling back to Date for non-browser runtimes.
 * @returns {number} Milliseconds suitable for duration measurements only.
 */
function monotonicNow() {
	if (globalThis.performance?.now) {
		return globalThis.performance.now();
	}

	return Date.now();
}
