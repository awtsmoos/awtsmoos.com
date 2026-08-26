//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AgentAnimatorApi.js
 * @description
 * The Awtsmoos preserves an earlier scene-performance-Studio covenant while pointing every new agent toward the canonical light;
 * Awtsmoos.com keeps historical commands source-compatible but marks them deprecated so parallel protocols no longer masquerade as right.
 */

import { GevurahAnimatorLegacyPolicy } from '../agent/legacy/AnimatorLegacyPolicy.js';
import { AgentAnimatorError } from './AgentAnimatorError.js';
import { AgentCommandRegistry } from './AgentCommandRegistry.js';
import { AgentPerformanceCommand } from './AgentPerformanceCommand.js';
import { AgentReceipt } from './AgentReceipt.js';
import { AgentSceneCommand } from './AgentSceneCommand.js';
import { AgentStudioCommand } from './AgentStudioCommand.js';

/** Historical v1 command facade retained for compatibility with direct ESM consumers. */
export class AgentAnimatorApi {
	static VERSION = '1.0.0';
	static SCHEMA_VERSION = '1';

	/** @param {{app?:object}} options Runtime installation context. */
	constructor(options = {}) {
		this.app = options.app || null;
		this.registry = new AgentCommandRegistry()
			.register(new AgentSceneCommand())
			.register(new AgentPerformanceCommand())
			.register(new AgentStudioCommand());
	}

	/** @returns {object} Historical capability declaration plus canonical migration metadata. */
	capabilities() {
		return {
			apiVersion: AgentAnimatorApi.VERSION,
			schemaVersion: AgentAnimatorApi.SCHEMA_VERSION,
			commands: this.registry.list(),
			installation: ['esm-import', 'browser-global'],
			expressionChannels: [
				'emotion', 'momentBlend', 'blink', 'eyeDart', 'attention',
				'brows', 'cheeks', 'manualFace', 'lipSyncCue', 'phonemeCue'
			],
			bodyChannels: [
				'breath', 'headTilt', 'headNod', 'shoulder', 'weight', 'hand', 'gesture'
			],
			compatibility: GevurahAnimatorLegacyPolicy.metadata(AgentAnimatorApi.VERSION)
		};
	}

	/** @returns {object[]} Historical command catalog. */
	commands() {
		return this.registry.list();
	}

	/** @param {object} keliEnvelope Historical command envelope. @returns {AgentReceipt} Historical receipt. */
	execute(keliEnvelope = {}) {
		this.validateEnvelope(keliEnvelope);
		const orResult = this.registry.execute(
			keliEnvelope.command,
			keliEnvelope.payload || {}
		);
		return new AgentReceipt(
			AgentAnimatorApi.VERSION,
			keliEnvelope.command,
			orResult
		);
	}

	/** @param {object} keilimPayload Scene payload. @returns {AgentReceipt} scene.compile receipt. */
	scene(keilimPayload = {}) {
		return this.execute({
			command: 'scene.compile',
			payload: keilimPayload
		});
	}

	/** @param {object} keilimPayload Performance payload. @returns {AgentReceipt} performance.compose receipt. */
	performance(keilimPayload = {}) {
		return this.execute({
			command: 'performance.compose',
			payload: keilimPayload
		});
	}

	/** @param {object} keilimPayload Studio payload. @returns {AgentReceipt} studio.generate receipt. */
	studio(keilimPayload = {}) {
		return this.execute({
			command: 'studio.generate',
			payload: keilimPayload
		});
	}

	/** @param {object} keliEnvelope Candidate historical envelope. */
	validateEnvelope(keliEnvelope) {
		if (!keliEnvelope || typeof keliEnvelope !== 'object' || Array.isArray(keliEnvelope)) {
			throw new AgentAnimatorError(
				'INVALID_ENVELOPE',
				'Animator API requests must be objects.'
			);
		}
		if (!String(keliEnvelope.command || '').trim()) {
			throw new AgentAnimatorError(
				'MISSING_COMMAND',
				'Animator API requests require a command name.'
			);
		}
		if (keliEnvelope.version && keliEnvelope.version !== AgentAnimatorApi.VERSION) {
			throw new AgentAnimatorError(
				'UNSUPPORTED_VERSION',
				`Expected legacy API ${AgentAnimatorApi.VERSION}.`,
				{ received: keliEnvelope.version }
			);
		}
	}
}
