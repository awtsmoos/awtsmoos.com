// B"H
// Boruch Hashem
// Blessed is He

import { AgentAnimatorError } from './AgentAnimatorError.js';

/**
 * @file AgentCommand.js
 * @description
 * The Awtsmoos sends many intentions through one covenant; Awtsmoos.com gives
 * every command the same truthful gate, while specialized children reveal the
 * particular light of scene, performance, or studio generation.
 */
export class AgentCommand {
	/**
	 * Defines one discoverable command family.
	 *
	 * @param {string} name - Stable command name.
	 * @param {string} description - Concise capability description.
	 */
	constructor(name, description) {
		this.name = String(name);
		this.description = String(description);
	}

	/**
	 * Ensures command data is a plain JSON-like object before specialization.
	 *
	 * @param {Object} payload - Command payload supplied by an agent.
	 * @returns {Object} The accepted payload.
	 * @throws {AgentAnimatorError} When the payload is not an object vessel.
	 */
	validate(payload = {}) {
		if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
			throw new AgentAnimatorError(
				'INVALID_PAYLOAD',
				`Command ${this.name} requires an object payload.`
			);
		}
		return payload;
	}

	/**
	 * Reveals a serializable descriptor for capability discovery.
	 *
	 * @returns {{name:string, description:string}}
	 */
	describe() {
		return {
			name: this.name,
			description: this.description
		};
	}

	/**
	 * Executes specialized behavior in a child command.
	 *
	 * @throws {AgentAnimatorError} Always, until a child reveals implementation.
	 */
	execute() {
		throw new AgentAnimatorError(
			'ABSTRACT_COMMAND',
			`Command ${this.name} has no executable implementation.`
		);
	}
}
