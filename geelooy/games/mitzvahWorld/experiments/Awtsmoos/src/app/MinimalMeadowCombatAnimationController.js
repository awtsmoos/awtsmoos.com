// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationController.js
 * @description Locks cast, melee, hit, and death phases above locomotion through existing events.
 * The Awtsmoos joins intention, duration, release, and recovery; Awtsmoos.com prevents movement,
 * selection, or hydration from dissolving a deed before its measured animation boundary.
 */

import { minimalMeadowLocomotionState } from './MinimalMeadowAnimationClipPolicy.js';
import {
	bindMinimalMeadowCombatAnimation,
	MINIMAL_ANIMATION_PRIORITY as PRIORITY,
	minimalAnimationDuration as duration,
	minimalAnimationProgress as progress
} from './MinimalMeadowCombatAnimationEvents.js';
import { advanceMinimalCombatAnimation } from './MinimalMeadowCombatAnimationTimeline.js';

export class MinimalMeadowCombatAnimationController {
	constructor(runtime) {
		this.runtime = runtime;
		this.state = 'standing';
		this.elapsed = 0;
		this.duration = 0;
		this.progress = 0;
		this.payload = null;
		this.sequence = 0;
		this.unsubscribers = bindMinimalMeadowCombatAnimation(runtime.bus, this);
	}
	update(deltaSeconds) {
		advanceMinimalCombatAnimation(this, deltaSeconds);
	}
	animationState() {
		return this.locked ? this.state : minimalMeadowLocomotionState(this.runtime);
	}
	castStart(payload = {}) {
		this.runtime.bus.emit('equipment:draw', { source: 'cast-animation' });
		this.enter('cast-windup', duration(payload.duration, 1), payload);
	}
	castProgress(payload = {}) {
		if (!this.state.startsWith('cast-') || this.state === 'cast-release') return;
		this.payload = payload;
		this.progress = progress(payload.progress);
		if (this.progress >= 0.3 && this.state === 'cast-windup') {
			this.enter('cast-channel', duration(payload.duration, this.duration), payload, false);
		}
	}
	castLaunch(payload = {}) {
		this.progress = 1;
		this.enter('cast-release', 0.34, payload);
	}
	castCancel(payload = {}) {
		if (this.state.startsWith('cast-')) this.enter('cast-release', 0.18, payload);
	}
	meleeStart(payload = {}) {
		this.runtime.bus.emit('equipment:draw', { source: 'melee-animation' });
		const milliseconds = payload.attack?.windupMilliseconds
			|| payload.attack?.impactDelayMilliseconds;
		this.enter('melee-windup', duration(milliseconds / 1000, 0.22), payload);
	}
	meleeResult(payload = {}) {
		if (this.state.startsWith('melee-')) this.enter('melee-impact', 0.14, payload);
	}
	hit(payload = {}) {
		this.enter('hit-reaction', 0.28, payload);
	}
	defeat(payload = {}) {
		this.enter('death', Infinity, payload, true, true);
	}
	enter(state, nextDuration, payload, resetTime = true, force = false) {
		if (!force && priority(state) < priority(this.state)) return false;
		this.state = state;
		this.duration = nextDuration;
		this.payload = payload;
		if (resetTime) this.elapsed = 0;
		if (!state.startsWith('cast-')) this.progress = 0;
		this.sequence += 1;
		this.runtime.bus.emit('animation:state', this.snapshot());
		return true;
	}
	clear() {
		if (this.state === 'death') return;
		this.state = 'standing';
		this.elapsed = 0;
		this.duration = 0;
		this.progress = 0;
		this.payload = null;
		this.sequence += 1;
	}
	snapshot() {
		return {
			duration: this.duration,
			elapsed: this.elapsed,
			locked: this.locked,
			progress: this.progress,
			sequence: this.sequence,
			state: this.state
		};
	}
	get locked() {
		return priority(this.state) > 0;
	}
	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function priority(state) {
	return PRIORITY[state] || 0;
}
