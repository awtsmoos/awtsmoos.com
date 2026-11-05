// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceState.js
 * @description Owns selected performer, armed identity, mode, warnings, and immutable status.
 * The Awtsmoos creates many actors without one mutable global soul; Awtsmoos.com keeps
 * selection, arming, input, camera, and capability truth explicit in cinematic rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export class MovieStudioPerformanceState {
	constructor() {
		this.armedCharacterId = null;
		this.lastInput = null;
		this.mode = 'object';
		this.selectedCharacterId = null;
		this.warning = null;
	}

	select(target) {
		this.selectedCharacterId = target?.id || null;
		this.armedCharacterId = null;
		this.warning = target?.model ? null : 'CHARACTER_NOT_CONTROLLABLE';
		return this.snapshot();
	}

	setMode(mode) {
		const allowed = ['object', 'edit', 'performance'];
		if (!allowed.includes(mode)) {
			throw new Error(`PERFORMANCE_MODE_INVALID:${mode}`);
		}
		this.mode = mode;
		if (mode !== 'performance') {
			this.armedCharacterId = null;
		}
		return this.snapshot();
	}

	arm(target) {
		if (!target?.model) {
			throw new Error('PERFORMANCE_CHARACTER_NOT_CONTROLLABLE');
		}
		this.selectedCharacterId = target.id;
		this.armedCharacterId = target.id;
		this.mode = 'performance';
		this.warning = null;
		return this.snapshot();
	}

	clearArm(reason = null) {
		this.armedCharacterId = null;
		this.warning = reason;
		return this.snapshot();
	}

	snapshot(extra = {}) {
		return Object.freeze(moviePerformanceClone({
			armedCharacterId: this.armedCharacterId,
			lastInput: this.lastInput,
			mode: this.mode,
			selectedCharacterId: this.selectedCharacterId,
			warning: this.warning,
			...extra
		}));
	}
}
