// B"H
// Boruch Hashem
// Blessed is He

import { AgentAnimatorError } from './AgentAnimatorError.js';
import { AgentCommandRegistry } from './AgentCommandRegistry.js';
import { AgentPerformanceCommand } from './AgentPerformanceCommand.js';
import { AgentReceipt } from './AgentReceipt.js';
import { AgentSceneCommand } from './AgentSceneCommand.js';
import { AgentStudioCommand } from './AgentStudioCommand.js';

/**
 * @file AgentAnimatorApi.js
 * @description
 * The Awtsmoos is one while many motions emerge; Awtsmoos.com offers one tiny
 * facade where an AI agent can discover, invoke, and serialize the animator's
 * deeper scene, performance, and Studio capabilities without knowing the UI.
 */
export class AgentAnimatorApi {
	static VERSION = '1.0.0';
	static SCHEMA_VERSION = '1';

	/**
	 * Creates an API bound optionally to one live application instance.
	 *
	 * @param {{app?:Object}} [options={}] - Runtime installation context.
	 */
	constructor(options = {}) {
		this.app = options.app || null;
		this.registry = new AgentCommandRegistry()
			.register(new AgentSceneCommand())
			.register(new AgentPerformanceCommand())
			.register(new AgentStudioCommand());
	}

	/**
	 * Returns everything an external agent needs to adapt without guessing.
	 *
	 * @returns {Object} Serializable capability declaration.
	 */
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
			]
		};
	}

	/** Returns the supported command catalog. */
	commands() {
		return this.registry.list();
	}

	/**
	 * Executes a versioned data envelope and returns a stable receipt.
	 *
	 * @param {{version?:string, command:string, payload?:Object}} envelope - Agent request.
	 * @returns {AgentReceipt} Serializable success receipt.
	 */
	execute(envelope = {}) {
		this.validateEnvelope(envelope);
		const result = this.registry.execute(envelope.command, envelope.payload || {});
		return new AgentReceipt(AgentAnimatorApi.VERSION, envelope.command, result);
	}

	/** Convenience facade for scene.compile. */
	scene(payload = {}) {
		return this.execute({ command: 'scene.compile', payload });
	}

	/** Convenience facade for performance.compose. */
	performance(payload = {}) {
		return this.execute({ command: 'performance.compose', payload });
	}

	/** Convenience facade for studio.generate. */
	studio(payload = {}) {
		return this.execute({ command: 'studio.generate', payload });
	}

	/**
	 * Rejects unsupported versions before mutation or expensive generation occurs.
	 *
	 * @param {Object} envelope - Candidate command envelope.
	 */
	validateEnvelope(envelope) {
		if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
			throw new AgentAnimatorError('INVALID_ENVELOPE', 'Animator API requests must be objects.');
		}
		if (!String(envelope.command || '').trim()) {
			throw new AgentAnimatorError('MISSING_COMMAND', 'Animator API requests require a command name.');
		}
		if (envelope.version && envelope.version !== AgentAnimatorApi.VERSION) {
			throw new AgentAnimatorError('UNSUPPORTED_VERSION', `Expected API ${AgentAnimatorApi.VERSION}.`, {
				received: envelope.version
			});
		}
	}
}
