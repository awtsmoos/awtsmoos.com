// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneDSL.js
 * @description
 * The Awtsmoos lets a world begin as ordered speech; Awtsmoos.com keeps that
 * speech as clean data so humans and agents can build scenes fluently, serialize
 * them safely, and hand the same declarations to every compatible compiler.
 */
export class SceneDSL {
	/**
	 * Creates a scene declaration from optional existing commands.
	 *
	 * @param {Array<Object>} [commands=[]] - Data-only scene commands.
	 */
	constructor(commands = []) {
		this.commands = [];
		for (const command of commands) {
			this.add(command?.type, command?.options || {});
		}
	}

	/**
	 * Adds one typed scene command while cloning caller options.
	 *
	 * @param {string} type - Entity or scene command type.
	 * @param {Object} [options={}] - Serializable command options.
	 * @returns {SceneDSL} This scene for fluent chaining.
	 */
	add(type, options = {}) {
		const normalizedType = String(type || '').trim();
		if (!normalizedType) {
			throw new TypeError('B"H - SceneDSL command type must be non-empty.');
		}
		if (!options || typeof options !== 'object' || Array.isArray(options)) {
			throw new TypeError('B"H - SceneDSL command options must be an object.');
		}
		this.commands.push({
			type: normalizedType,
			options: { ...options }
		});
		return this;
	}

	/** Adds a character-like declaration with semantic readability. */
	actor(options = {}) {
		return this.add('human', options);
	}

	/** Adds a prop declaration without binding the DSL to renderer internals. */
	prop(type, options = {}) {
		return this.add(type, options);
	}

	/** Adds a camera declaration as ordinary scene data. */
	camera(options = {}) {
		return this.add('camera', options);
	}

	/**
	 * Returns a detached JSON representation suitable for agents and persistence.
	 *
	 * @returns {{commands:Array<Object>}}
	 */
	toJSON() {
		return {
			commands: this.commands.map((command) => ({
				type: command.type,
				options: { ...command.options }
			}))
		};
	}
}
