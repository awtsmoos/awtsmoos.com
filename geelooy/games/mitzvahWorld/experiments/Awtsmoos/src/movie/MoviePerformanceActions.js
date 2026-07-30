// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceActions.js
 * @description Dispatches real phased actions and records stable actor, target, payload, and time.
 * The Awtsmoos joins intention and deed without storing a living object; Awtsmoos.com
 * preserves exact action boundaries and authored target identities so playback remains in rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export class MoviePerformanceActions {
	constructor(options = {}) {
		this.events = [];
		this.now = options.now || (() => 0);
		this.onEvent = options.onEvent;
	}

	available(target) {
		return moviePerformanceClone(target?.actionCapabilities?.() || []);
	}

	trigger(target, actionId, payload = {}, phase = 'start') {
		if (!target) {
			return { accepted: false, reason: 'CHARACTER_NOT_SELECTED' };
		}
		const definition = target.actionCapabilities().find(item => item.id === actionId);
		if (!definition) {
			return { accepted: false, actionId, reason: 'ACTION_UNAVAILABLE' };
		}
		const stablePayload = normalizePayload(payload);
		const result = dispatch(target, definition, phase, stablePayload);
		const event = {
			actionId,
			id: `action-${this.events.length + 1}`,
			payload: stablePayload,
			phase,
			time: Math.max(0, Number(this.now()) || 0)
		};
		if (result?.accepted !== false) {
			this.events.push(event);
			this.onEvent?.(moviePerformanceClone(event));
		}
		return { event: moviePerformanceClone(event), result };
	}

	drain() {
		const events = moviePerformanceClone(this.events);
		this.events.length = 0;
		return events;
	}

	clear() {
		this.events.length = 0;
	}
}

function dispatch(target, definition, phase, payload) {
	const message = {
		...payload,
		phase,
		type: definition.messageType
	};
	if (target.kind === 'player') {
		return target.runtime.dispatchPlayerAction?.(message)
			|| { accepted: false, reason: 'ACTION_DISPATCH_UNAVAILABLE' };
	}
	return target.actions?.dispatch?.(message)
		|| { accepted: false, reason: 'ACTION_DISPATCH_UNAVAILABLE' };
}

function normalizePayload(payload) {
	const clone = moviePerformanceClone(payload || {});
	for (const key of Object.keys(clone)) {
		if (/target/i.test(key) && typeof clone[key] === 'object') {
			clone[key] = String(clone[key]?.id || 'missing-target');
		}
	}
	return clone;
}
