// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectStore.js
 * @description Advances every active Torah status through one bounded, allocation-light timeline.
 */

import { torahStatusEffectDefinition } from './TorahStatusEffectCatalog.js';
import {
	createStatusInstance,
	refreshStatusInstance,
	statusEffectSnapshot,
	statusTickPlan
} from './TorahStatusEffectRules.js';

export class TorahStatusEffectStore {
	constructor(options = {}) {
		this.bus = options.bus || null;
		this.clock = options.clock || Date.now;
		this.maximumEffects = options.maximumEffects || 128;
		this.onTick = options.onTick || (() => {});
		this.targets = new Map();
		this.activeCount = 0;
		this.sequence = 0;
		this.diagnostics = { applied: 0, droppedTicks: 0, expired: 0, ticks: 0 };
	}

	apply(request) {
		const definition = torahStatusEffectDefinition(request.effectId);
		if (!definition) return outcome(false, 'unknown-effect');
		if (request.targetId == null) return outcome(false, 'missing-target');
		if (request.isBoss && definition.bossBehavior === 'immune') return outcome(false, 'boss-immune');
		const now = request.now ?? this.clock();
		const effects = this.targetEffects(request.targetId, true);
		const existing = effects.get(definition.id);
		if (existing) {
			const result = refreshStatusInstance(existing, request, now);
			if (result.ok) this.emit('status:apply', existing, result.reason);
			return outcome(result.ok, result.reason, statusEffectSnapshot(existing));
		}
		if (this.activeCount >= this.maximumEffects) return outcome(false, 'capacity');
		const instance = createStatusInstance(definition, request, now, ++this.sequence);
		effects.set(definition.id, instance);
		this.activeCount += 1;
		this.diagnostics.applied += 1;
		this.emit('status:apply', instance, 'applied');
		return outcome(true, 'applied', statusEffectSnapshot(instance));
	}

	update(now = this.clock()) {
		for (const [targetId, effects] of this.targets) {
			for (const [effectId, instance] of effects) {
				if (now >= instance.expiresAt) {
					this.removeInternal(targetId, effectId, instance, 'expired');
					continue;
				}
				this.advanceTicks(instance, now);
			}
		}
		return this.diagnosticSnapshot();
	}

	remove(targetId, effectId, reason = 'removed') {
		const instance = this.targetEffects(targetId)?.get(effectId);
		if (!instance) return false;
		this.removeInternal(targetId, effectId, instance, reason);
		return true;
	}

	removeByCategory(targetId, category, maximum = 1) {
		const effects = this.targetEffects(targetId);
		if (!effects) return 0;
		let removed = 0;
		for (const [effectId, instance] of effects) {
			if (instance.definition.dispelCategory !== category) continue;
			this.removeInternal(targetId, effectId, instance, 'cleansed');
			removed += 1;
			if (removed >= maximum) break;
		}
		return removed;
	}

	handleDamage(targetId) {
		const effects = this.targetEffects(targetId);
		if (!effects) return 0;
		let removed = 0;
		for (const [effectId, instance] of effects) {
			if (!instance.definition.modifiers.breakOnDamage) continue;
			this.removeInternal(targetId, effectId, instance, 'damage-broken');
			removed += 1;
		}
		return removed;
	}

	snapshot(targetId = null) {
		const effects = [];
		if (targetId != null) {
			for (const instance of this.targetEffects(targetId)?.values() || []) effects.push(statusEffectSnapshot(instance));
		} else {
			for (const targetEffects of this.targets.values()) {
				for (const instance of targetEffects.values()) effects.push(statusEffectSnapshot(instance));
			}
		}
		return { diagnostics: this.diagnosticSnapshot(), effects };
	}

	destroy() {
		this.targets.clear();
		this.activeCount = 0;
	}

	advanceTicks(instance, now) {
		const plan = statusTickPlan(instance, now);
		if (!plan) return;
		for (let index = 0; index < plan.count; index += 1) {
			this.onTick(statusEffectSnapshot(instance));
			this.emit('status:tick', instance);
		}
		this.diagnostics.ticks += plan.count;
		this.diagnostics.droppedTicks += plan.dropped;
	}

	removeInternal(targetId, effectId, instance, reason) {
		const effects = this.targets.get(targetId);
		effects.delete(effectId);
		if (!effects.size) this.targets.delete(targetId);
		this.activeCount -= 1;
		if (reason === 'expired') this.diagnostics.expired += 1;
		this.emit('status:expire', instance, reason);
	}

	targetEffects(targetId, create = false) {
		if (targetId == null) return null;
		if (create && !this.targets.has(targetId)) this.targets.set(targetId, new Map());
		return this.targets.get(targetId) || null;
	}

	diagnosticSnapshot() {
		return { ...this.diagnostics, activeCount: this.activeCount, maximumEffects: this.maximumEffects };
	}

	emit(type, instance, reason = null) {
		const detail = { ...statusEffectSnapshot(instance), reason };
		this.bus?.emit(type, detail);
		if (type === 'status:apply') this.bus?.emit('quest:event', { count: 1, target: detail.effectId, type: 'status' });
	}
}

function outcome(ok, reason, effect = null) {
	return { effect, ok, reason };
}
