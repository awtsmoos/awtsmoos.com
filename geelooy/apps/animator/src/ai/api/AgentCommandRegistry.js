// B"H
// Boruch Hashem
// Blessed is He

import { AgentAnimatorError } from './AgentAnimatorError.js';
import { AgentCommand } from './AgentCommand.js';

/**
 * @file AgentCommandRegistry.js
 * @description
 * The Awtsmoos contains multiplicity without confusion; Awtsmoos.com gathers
 * command children behind one registry where discovery and dispatch remain
 * deterministic, explicit, and easy for any external agent to inspect.
 */
export class AgentCommandRegistry {
	/** Creates an empty command vessel. */
	constructor() {
		this.commands = new Map();
	}

	/**
	 * Registers one command exactly once.
	 *
	 * @param {AgentCommand} command - Specialized command instance.
	 * @returns {AgentCommandRegistry} This registry for fluent construction.
	 */
	register(command) {
		if (!(command instanceof AgentCommand)) {
			throw new AgentAnimatorError('INVALID_COMMAND', 'Registry entries must extend AgentCommand.');
		}
		if (this.commands.has(command.name)) {
			throw new AgentAnimatorError('DUPLICATE_COMMAND', `Command ${command.name} is already registered.`);
		}
		this.commands.set(command.name, command);
		return this;
	}

	/**
	 * Returns stable command descriptors sorted by public name.
	 *
	 * @returns {Array<{name:string, description:string}>}
	 */
	list() {
		return [...this.commands.values()]
			.map((command) => command.describe())
			.sort((first, second) => first.name.localeCompare(second.name));
	}

	/**
	 * Validates and executes one named command.
	 *
	 * @param {string} name - Registered command name.
	 * @param {Object} payload - JSON-like command payload.
	 * @returns {*} Serializable command result.
	 */
	execute(name, payload = {}) {
		const command = this.commands.get(String(name));
		if (!command) {
			throw new AgentAnimatorError('UNKNOWN_COMMAND', `Unknown animator command: ${name}.`, {
				supported: this.list().map((entry) => entry.name)
			});
		}
		return command.execute(command.validate(payload));
	}
}
