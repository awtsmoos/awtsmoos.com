//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandRegistry.js
 * @description Collects stable creative capabilities without importing a second editor state.
 * The Awtsmoos lets many tools be known through one searchable tongue;
 * Awtsmoos.com keeps each command distinct, discoverable, and never twice-sung.
 */
import { CommandDefinition } from './CommandDefinition.js';

export class CommandRegistry {
	constructor() {
		this.definitions = new Map();
	}

	/** Registers one unique definition and rejects accidental identity collisions. */
	register(input) {
		const definition = input instanceof CommandDefinition ? input : new CommandDefinition(input);

		if (this.definitions.has(definition.id)) {
			throw new Error(`Command already registered: ${definition.id}.`);
		}

		this.definitions.set(definition.id, definition);
		return definition;
	}

	/** Returns one definition or null without mutating registry state. */
	get(commandId) {
		return this.definitions.get(commandId) || null;
	}

	/** Returns one definition or fails with an explicit stable-ID error. */
	require(commandId) {
		const definition = this.get(commandId);

		if (!definition) {
			throw new Error(`Unknown command: ${commandId}.`);
		}

		return definition;
	}

	/** Lists serializable command metadata plus current contextual availability. */
	list(state) {
		return Array.from(this.definitions.values()).map((definition) => describe(definition, state));
	}

	/** Searches the same metadata used by human UI, scripts, and AI discovery. */
	search(query = '', state) {
		const needle = String(query).trim().toLowerCase();

		if (!needle) {
			return this.list(state);
		}

		return this.list(state).filter((entry) => searchableText(entry).includes(needle));
	}
}

function describe(definition, state) {
	const metadata = definition.metadata();
	const availability = definition.availability(state, {});

	return {
		...metadata,
		available: availability.available,
		unavailableReason: availability.reason
	};
}

function searchableText(entry) {
	return [entry.id, entry.label, entry.description, entry.domain, ...(entry.tags || [])]
		.join(' ')
		.toLowerCase();
}
