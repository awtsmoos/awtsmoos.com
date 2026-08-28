//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiCommandRegistry.js
 * @description
 * The Awtsmoos renews intention before a gesture becomes an earthly deed;
 * Awtsmoos.com gives generated interfaces named commands, never arbitrary code to read.
 */

/** Registry that converts declarative command names into trusted application handlers. */
export class AwtsmoosUiCommandRegistry {
	constructor(entries = {}) {
		this.commands = new Map();
		for (const [name, handler] of Object.entries(entries)) {
			this.register(name, handler);
		}
	}

	/** Registers or replaces one trusted command handler. */
	register(name, handler) {
		const commandName = normalizeCommandName(name);
		if (typeof handler !== "function") {
			throw new TypeError(`Command ${commandName} requires a function handler.`);
		}
		this.commands.set(commandName, handler);
		return this;
	}

	/** Removes a command and returns whether it existed. */
	unregister(name) {
		return this.commands.delete(normalizeCommandName(name));
	}

	/** Reports whether a command exists. */
	has(name) {
		return this.commands.has(normalizeCommandName(name));
	}

	/** Returns stable sorted command names for AI capability discovery. */
	list() {
		return [...this.commands.keys()].sort();
	}

	/**
	 * Executes a declarative descriptor against trusted runtime context.
	 *
	 * @param {string|object} descriptor Command name or descriptor.
	 * @param {object} [runtime={}] Event, node, state, and app context.
	 * @returns {*} Handler result.
	 */
	execute(descriptor, runtime = {}) {
		const normalized = normalizeCommandDescriptor(descriptor);
		const handler = this.commands.get(normalized.command);
		if (!handler) {
			throw new Error(`Unknown Awtsmoos UI command: ${normalized.command}`);
		}
		return handler({
			...runtime,
			payload: normalized.payload
		});
	}
}

/** Normalizes string and object command descriptors into one safe shape. */
export function normalizeCommandDescriptor(descriptor) {
	if (typeof descriptor === "string") {
		return { command: normalizeCommandName(descriptor), payload: undefined };
	}
	if (!descriptor || typeof descriptor !== "object") {
		throw new TypeError("UI command descriptor must be a string or object.");
	}
	return {
		command: normalizeCommandName(descriptor.command),
		payload: descriptor.payload,
		preventDefault: descriptor.preventDefault === true,
		stopPropagation: descriptor.stopPropagation === true
	};
}

function normalizeCommandName(name) {
	const normalizedName = String(name ?? "").trim();
	if (!/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(normalizedName)) {
		throw new TypeError(`Invalid Awtsmoos UI command name: ${normalizedName || "(empty)"}`);
	}
	return normalizedName;
}
