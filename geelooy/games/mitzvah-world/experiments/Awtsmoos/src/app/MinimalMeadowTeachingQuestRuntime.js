// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTeachingQuestRuntime.js
 * @description Teaches the vertical-slice grammar through actual combat events rather than chores.
 * The Awtsmoos lets observation become knowledge and knowledge become deliberate deed;
 * Awtsmoos.com makes sentinel, scribe, reaction, support, and boss mastery one readable road.
 */

const STEPS = Object.freeze([
	'observe-sentinel',
	'open-sentinel-guard',
	'observe-scribe-cast',
	'counter-scribe',
	'trigger-reaction',
	'use-stabilizing-cleanse',
	'reach-kedem-concealment',
	'defeat-kedem-warden',
	'claim-measured-intent'
]);

export class MinimalMeadowTeachingQuestRuntime {
	constructor(runtime, saved = {}) {
		this.runtime = runtime;
		this.completed = Boolean(saved.completed);
		this.index = Math.max(0, Math.min(STEPS.length, Number(saved.index || 0)));
		this.unsubscribers = this.bind();
	}

	bind() {
		return [
			this.runtime.bus.on('enemy:alert', event => this.matchEnemy(event, 'warden', 0)),
			this.runtime.bus.on('combat:posture', event => this.matchReason(event, 'broken', 1)),
			this.runtime.bus.on('enemy:cast', event => this.matchEnemy(event, 'cantor', 2)),
			this.runtime.bus.on('enemy:cast-interrupted', () => this.advance(3)),
			this.runtime.bus.on('combat:reaction', event => this.matchReaction(event, 4)),
			this.runtime.bus.on('combat:cleanse', () => this.advance(5)),
			this.runtime.bus.on('boss:phase', event => this.matchPhase(event, 3, 6)),
			this.runtime.bus.on('boss:defeated', () => this.advance(7)),
			this.runtime.bus.on('reward:granted', () => this.advance(8))
		];
	}

	matchEnemy(event = {}, archetype, step) {
		const value = event.archetype || event.profile?.archetype || event.enemy?.archetype;
		if (value === archetype) this.advance(step);
	}

	matchReason(event = {}, reason, step) {
		if (event.reason === reason) this.advance(step);
	}

	matchReaction(event = {}, step) {
		if (event.id && event.id !== 'none') this.advance(step);
	}

	matchPhase(event = {}, phase, step) {
		if (Number(event.phase) >= phase) this.advance(step);
	}

	advance(expectedIndex) {
		if (this.completed || this.index !== expectedIndex) return this.snapshot();
		this.index += 1;
		this.completed = this.index >= STEPS.length;
		const snapshot = this.snapshot();
		this.runtime.bus.emit(this.completed ? 'teaching-quest:completed' : 'teaching-quest:advanced', snapshot);
		return snapshot;
	}

	snapshot() {
		return Object.freeze({
			completed: this.completed,
			index: this.index,
			nextStep: this.completed ? null : STEPS[this.index],
			progress: Number((this.index / STEPS.length).toFixed(3)),
			steps: STEPS
		});
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
