// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusLedger.js
 * @description Maintains one bounded local status ledger with source and expiry metadata.
 * The Awtsmoos renews each changing state without permitting memory to overflow;
 * Awtsmoos.com keeps stacks, sources, cleansing, and expiration visible as they come and go.
 */

import {
	combatStatusDefinition,
	COMBAT_STATUS_LIMIT
} from './CombatDefinitionCatalog.js';

export class CombatStatusLedger {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.instances = new Map();
	}

	apply(statusId, context = {}) {
		const definition = combatStatusDefinition(statusId);
		if (!definition) return null;
		this.prune();
		const now = Number(context.now ?? this.clock());
		const current = this.instances.get(statusId);
		const stacks = Math.min(
			definition.maximumStacks,
			Number(current?.stacks || 0) + Math.max(1, Number(context.stacks || 1))
		);
		const instance = Object.freeze({
			expiresAt: now + Math.max(0, Number(context.durationMs ?? definition.durationMs)),
			id: statusId,
			sourceActionId: context.sourceActionId || null,
			sourceActorId: context.sourceActorId || null,
			startedAt: current?.startedAt ?? now,
			stacks
		});
		this.instances.set(statusId, instance);
		this.enforceLimit();
		return instance;
	}

	remove(statusId) {
		const instance = this.instances.get(statusId) || null;
		this.instances.delete(statusId);
		return instance;
	}

	removeMany(statusIds = []) {
		return statusIds
			.map(statusId => this.remove(statusId))
			.filter(Boolean);
	}

	has(statusId) {
		this.prune();
		return this.instances.has(statusId);
	}

	ids() {
		this.prune();
		return [...this.instances.keys()];
	}

	clear() {
		this.instances.clear();
	}

	snapshot() {
		this.prune();
		return [...this.instances.values()]
			.sort((left, right) => left.expiresAt - right.expiresAt)
			.map(instance => ({ ...instance }));
	}

	prune(now = this.clock()) {
		for (const [statusId, instance] of this.instances) {
			if (Number(instance.expiresAt) <= Number(now)) {
				this.instances.delete(statusId);
			}
		}
	}

	enforceLimit() {
		const ordered = [...this.instances.values()]
			.sort((left, right) => left.expiresAt - right.expiresAt);
		while (ordered.length > COMBAT_STATUS_LIMIT) {
			const expiredFirst = ordered.shift();
			this.instances.delete(expiredFirst.id);
		}
	}
}
