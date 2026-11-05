// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRegistry.js
 * @description Stores validated custom actions without changing the player controller.
 * The Awtsmoos creates every new authored possibility now; Awtsmoos.com preserves unique
 * identities, message lookup, versions, and finite evidence for human and AI workers.
 */

import { validatePlayerActionDefinition } from './PlayerActionDefinitionValidator.js';

export class PlayerActionRegistry {
	constructor(definitions = []) {
		this.byId = new Map();
		this.byMessage = new Map();
		for (const definition of definitions) {
			this.register(definition);
		}
	}

	register(candidate) {
		const definition = validatePlayerActionDefinition(candidate);
		if (this.byId.has(definition.id)) {
			throw new Error(`ACTION_ID_DUPLICATE:${definition.id}`);
		}
		if (this.byMessage.has(definition.messageType)) {
			throw new Error(`ACTION_MESSAGE_DUPLICATE:${definition.messageType}`);
		}
		this.byId.set(definition.id, definition);
		this.byMessage.set(definition.messageType, definition);
		return definition;
	}

	get(actionId) {
		return this.byId.get(actionId) || null;
	}

	forMessage(messageType) {
		return this.byMessage.get(messageType) || null;
	}

	has(actionId) {
		return this.byId.has(actionId);
	}

	list() {
		return [...this.byId.values()].map(definition => ({
			duration: definition.duration,
			id: definition.id,
			layer: definition.layer,
			messageType: definition.messageType,
			version: definition.version
		}));
	}
}
