//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandRegistry.js
 * @description Collects stable creative capabilities without owning any creative project state.
 * The Awtsmoos lets many commands become known through one searchable keli while their ohr remains distinct;
 * Awtsmoos.com keeps discovery honest, so a capability can be visible even when context says it cannot yet be picked.
 */
import { CommandDefinition } from './CommandDefinition.js';

/**
 * Stores transient executable command definitions and exposes only serializable metadata outward.
 */
export class CommandRegistry {
	constructor() {
		this.definitions = new Map();
	}

	/** Registers one stable definition and rejects identity collisions. */
	register(input) {
		const definition = input instanceof CommandDefinition
			? input
			: new CommandDefinition(input);

		if (this.definitions.has(definition.id)) {
			throw new Error(`Command already registered: ${definition.id}.`);
		}

		this.definitions.set(definition.id, definition);
		return definition;
	}

	/** Returns one transient command definition or null. */
	get(commandId) {
		return this.definitions.get(commandId) || null;
	}

	/** Returns one command definition or throws a precise identity error. */
	require(commandId) {
		const definition = this.get(commandId);

		if (!definition) {
			throw new Error(`Unknown command: ${commandId}.`);
		}

		return definition;
	}

	/** Lists serializable metadata plus current contextual availability. */
	list(state) {
		return Array.from(this.definitions.values()).map((definition) => {
			return describeDefinition(definition, state);
		});
	}

	/** Searches the same capability metadata used by human UI, script, and AI discovery. */
	search(query = '', state) {
		const needle = String(query).trim().toLowerCase();
		const descriptions = this.list(state);

		if (!needle) {
			return descriptions;
		}

		return descriptions.filter((entry) => {
			return searchableText(entry).includes(needle);
		});
	}
}

function describeDefinition(definition, state) {
	const metadata = definition.metadata();
	const availability = definition.availability(state, {});

	return {
		...metadata,
		available: availability.available,
		unavailableReason: availability.reason
	};
}

function searchableText(entry) {
	return [
		entry.id,
		entry.label,
		entry.description,
		entry.domain,
		...(entry.tags || [])
	].join(' ').toLowerCase();
}
