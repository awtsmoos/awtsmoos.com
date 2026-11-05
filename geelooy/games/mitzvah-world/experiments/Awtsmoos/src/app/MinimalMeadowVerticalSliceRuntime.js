// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceRuntime.js
 * @description Composes Kavanah, posture, reactions, Daas, boss, quest, reward, and memory.
 * The Awtsmoos unites focused vessels without replacing movement, combat, or recovery;
 * Awtsmoos.com lets inventory, encounter, teaching, accessibility, and persistence agree.
 */

import { MinimalMeadowDaasRuntime } from './MinimalMeadowDaasRuntime.js';
import { MinimalMeadowKedemWardenRuntime } from './MinimalMeadowKedemWardenRuntime.js';
import { MinimalMeadowPostureRuntime } from './MinimalMeadowPostureRuntime.js';
import { resolveMinimalMeadowReaction } from './MinimalMeadowReactionRules.js';
import { MinimalMeadowTeachingQuestRuntime } from './MinimalMeadowTeachingQuestRuntime.js';
import { MinimalMeadowVerticalSlicePersistence } from './MinimalMeadowVerticalSlicePersistence.js';
import { MinimalMeadowVerticalSliceReward, KAVANAH_FOCUS_CLAIM } from './MinimalMeadowVerticalSliceReward.js';

export class MinimalMeadowVerticalSliceRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.persistence = new MinimalMeadowVerticalSlicePersistence(environment);
		this.saved = this.persistence.load();
		this.posture = new MinimalMeadowPostureRuntime(runtime);
		this.daas = new MinimalMeadowDaasRuntime(runtime, this.saved.daas);
		this.reward = new MinimalMeadowVerticalSliceReward(runtime, this.saved.reward);
		this.quest = new MinimalMeadowTeachingQuestRuntime(runtime, this.saved.quest);
		this.boss = new MinimalMeadowKedemWardenRuntime(runtime, this.saved.boss);
		this.reward.syncInventory(runtime.inventory?.snapshot?.() || {});
		this.unsubscribers = this.bind();
	}

	bind() {
		return [
			this.runtime.bus.on('combat:impact', event => this.onImpact(event)),
			this.runtime.bus.on('enemy:cast', event => this.observeCast(event)),
			this.runtime.bus.on('enemy:cast-interrupted', event => this.learnCounter(event)),
			this.runtime.bus.on('teaching-quest:advanced', () => this.save()),
			this.runtime.bus.on('teaching-quest:completed', () => this.save()),
			this.runtime.bus.on('reward:granted', () => this.save()),
			this.runtime.bus.on('reward:equipped', () => this.save()),
			this.runtime.bus.on('player:defeated', () => this.save()),
			this.runtime.inventory?.onChange?.(snapshot => this.onInventory(snapshot))
				|| (() => {})
		];
	}

	onInventory(snapshot) {
		this.reward.syncInventory(snapshot);
		this.save();
	}

	onImpact(event = {}) {
		const targetId = event.targetId || event.target?.id || event.enemyId;
		const actionId = event.actionId || event.receipt?.actionId;
		const reaction = resolveMinimalMeadowReaction({
			actionId,
			statusIds: event.statusIds || event.target?.statuses || [],
			tags: event.tags || []
		});
		if (reaction.id !== 'none') {
			this.runtime.bus.emit('combat:reaction', reaction);
		}
		const pressure = Number(
			event.postureDamage || event.damage || event.amount || 0
		) * 0.45;
		if (targetId && pressure > 0) {
			this.posture.apply(targetId, pressure * reaction.postureMultiplier);
		}
		if (reaction.cleanseCount > 0) {
			this.runtime.bus.emit('combat:cleanse', reaction);
			this.posture.restore('player', reaction.postureRestore);
		}
	}

	observeCast(event = {}) {
		const enemyId = event.enemyId || event.ownerId || event.actorId;
		const actionId = event.actionId || event.castId;
		if (enemyId && actionId) this.daas.observe(enemyId, actionId);
	}

	learnCounter(event = {}) {
		const enemyId = event.enemyId || event.ownerId || event.actorId;
		const actionId = event.actionId || event.castId;
		if (enemyId && actionId) this.daas.counter(enemyId, actionId);
	}

	update(deltaSeconds) {
		this.posture.update(deltaSeconds);
	}

	save() {
		return this.persistence.save(this.snapshot());
	}

	snapshot() {
		const reward = this.reward.snapshot();
		return Object.freeze({
			accessibility: { ...this.runtime.accessibility },
			boss: this.boss.snapshot(),
			claims: reward.claimed ? [KAVANAH_FOCUS_CLAIM] : [],
			daas: this.daas.snapshot(),
			quest: this.quest.snapshot(),
			recovery: this.runtime.recovery?.snapshot?.() || {},
			reward
		});
	}

	destroy() {
		this.save();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.quest.destroy();
		this.boss.destroy();
		this.daas.destroy();
		this.posture.destroy();
	}
}
