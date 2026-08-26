//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentApi.js
 * @description
 * The Awtsmoos gives vast creative force a single clear doorway, discoverable before it is used;
 * Awtsmoos.com returns correlated structured truth from every command while a direct World gate keeps common creation lucid.
 */

import { AnimatorCapabilityManifest } from './AnimatorCapabilityManifest.js';
import { AnimatorCommandValidator } from './AnimatorCommandValidator.js';
import { AnimatorCommandRouter } from './AnimatorCommandRouter.js';

/** Stable, versioned facade shared by browser agents and the human Creator Dock. */
export class AnimatorAgentApi {
	/**
	 * Connects protocol routing and the ergonomic World facade to one canonical project store.
	 * @param {object} olamStore Existing NLE store that remains the sole owner of project state.
	 */
	constructor(olamStore) {
		this.merkavahRouter = new AnimatorCommandRouter(olamStore);
		this.world = this.merkavahRouter.world();
		this.requestSequence = 0;
	}

	/**
	 * Returns the public feature-detection manifest before any mutation is attempted.
	 * @returns {object} Versioned public API contract.
	 */
	capabilities() {
		return AnimatorCapabilityManifest.create();
	}

	/**
	 * Returns a compact read-only summary of the active project.
	 * @returns {object} Current project summary.
	 */
	snapshot() {
		return this.merkavahRouter.snapshot();
	}

	/**
	 * Validates and executes one JSON command, always returning a correlated structured envelope.
	 * @param {object} keliEnvelope `{ command, payload, requestId? }` command data.
	 * @returns {Promise<object>} Success or failure envelope containing the same stable request ID.
	 */
	async execute(keliEnvelope = {}) {
		let shemMitzvah = String(keliEnvelope?.command ?? 'unknown');
		let sodRequestId = this.nextRequestId();
		try {
			const seder = AnimatorCommandValidator.normalize(keliEnvelope);
			shemMitzvah = seder.command;
			sodRequestId = seder.requestId ?? sodRequestId;
			const orResult = await this.merkavahRouter.execute(
				seder.command,
				seder.payload
			);
			return {
				ok: true,
				requestId: sodRequestId,
				command: seder.command,
				data: orResult
			};
		} catch (gevurahError) {
			return {
				ok: false,
				requestId: sodRequestId,
				command: shemMitzvah,
				error: {
					code: gevurahError?.code ?? 'execution_failed',
					message: gevurahError?.message ?? String(gevurahError)
				}
			};
		}
	}

	/**
	 * Generates a local correlation ID when the caller does not provide one.
	 * @returns {string} Stable-enough session-local identifier for logging and command matching.
	 */
	nextRequestId() {
		this.requestSequence += 1;
		return `animator-${Date.now().toString(36)}-${this.requestSequence.toString(36)}`;
	}
}
