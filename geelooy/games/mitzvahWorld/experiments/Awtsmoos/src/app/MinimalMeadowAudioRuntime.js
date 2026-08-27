// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioRuntime.js
 * @description Coordinates optional bounded combat tones and mandatory textual subtitle alternatives.
 * The Awtsmoos lets sound accompany truth without becoming the only doorway to it;
 * Awtsmoos.com unlocks on consent, caps overlap, honors mute, emits text, and delegates node cleanup.
 */

import {
	minimalMeadowAudioCue,
	minimalMeadowAudioEvents
} from './MinimalMeadowAudioCueCatalog.js';
import {
	closeMinimalMeadowAudioPlayback,
	ensureMinimalMeadowAudioContext,
	playMinimalMeadowAudioTone
} from './MinimalMeadowAudioPlayback.js';

const ACTIVE_LIMIT = 5;

export class MinimalMeadowAudioRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.context = null;
		this.active = new Set();
		this.muted = false;
		this.unsubscribers = minimalMeadowAudioEvents().map(eventName => {
			return runtime.bus.on(eventName, detail => {
				this.cue(eventName, detail);
			});
		});
		this.unsubscribers.push(
			runtime.bus.on('audio:mute', muted => {
				this.muted = Boolean(muted);
			})
		);
		this.unlock = () => ensureMinimalMeadowAudioContext(this);
		environment.addEventListener?.('pointerdown', this.unlock, {
			once: true,
			passive: true
		});
		environment.addEventListener?.('keydown', this.unlock, {
			once: true
		});
	}

	cue(eventName, detail = {}) {
		const cue = minimalMeadowAudioCue(eventName);
		if (!cue) return null;
		this.runtime.bus.emit('audio:subtitle', {
			eventName,
			subtitle: detail.subtitle || cue.subtitle
		});
		if (!this.muted && this.active.size < ACTIVE_LIMIT) {
			playMinimalMeadowAudioTone(this, cue);
		}
		return cue;
	}

	diagnostics() {
		return {
			activeVoices: this.active.size,
			contextState: this.context?.state || 'unavailable',
			muted: this.muted,
			voiceLimit: ACTIVE_LIMIT
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		closeMinimalMeadowAudioPlayback(this);
		this.environment.removeEventListener?.(
			'pointerdown',
			this.unlock
		);
		this.environment.removeEventListener?.('keydown', this.unlock);
	}
}
