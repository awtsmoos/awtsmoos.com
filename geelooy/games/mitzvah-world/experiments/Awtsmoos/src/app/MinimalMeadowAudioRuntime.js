// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioRuntime.js
 * @description Coordinates the existing effects channel, persisted mix, river ambience, and subtitles.
 * The Awtsmoos lets consent open one gate where sound and silence rhyme; Awtsmoos.com keeps
 * accessibility truthful, river proximity gentle, settings durable, and every finite voice in time.
 */

import { minimalMeadowAudioCue, minimalMeadowAudioEvents } from './MinimalMeadowAudioCueCatalog.js';
import { MinimalMeadowRiverAmbience } from './MinimalMeadowRiverAmbience.js';
import {
	loadMinimalMeadowAudioSettings,
	saveMinimalMeadowAudioSettings
} from './MinimalMeadowAudioSettings.js';
import {
	applyMinimalMeadowAudioSettings,
	closeMinimalMeadowAudioPlayback,
	playMinimalMeadowAudioTone,
	resumeMinimalMeadowAudioPlayback
} from './MinimalMeadowAudioPlayback.js';

const ACTIVE_LIMIT = 5;

export class MinimalMeadowAudioRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.context = null;
		this.graph = null;
		this.active = new Set();
		this.settings = loadMinimalMeadowAudioSettings(environment);
		this.ambience = new MinimalMeadowRiverAmbience(runtime, this, environment);
		this.unsubscribers = minimalMeadowAudioEvents().map(eventName => {
			return runtime.bus.on(eventName, detail => this.cue(eventName, detail));
		});
		this.unsubscribers.push(
			runtime.bus.on('audio:mute', muted => {
				this.setSettings({ muted: Boolean(muted) });
			})
		);
		this.unsubscribers.push(
			runtime.bus.on('audio:settings', patch => {
				this.setSettings(patch);
			})
		);
		this.unlock = () => {
			this.unlockAudio();
		};
		environment.addEventListener?.('pointerdown', this.unlock, { passive: true });
		environment.addEventListener?.('keydown', this.unlock);
		environment.addEventListener?.('click', this.unlock);
	}
	async unlockAudio() {
		const running = await resumeMinimalMeadowAudioPlayback(this);
		if (!running) {
			return false;
		}
		applyMinimalMeadowAudioSettings(this);
		this.ambience.start();
		this.removeUnlockListeners();
		return true;
	}

	setSettings(patch = {}) {
		this.settings = saveMinimalMeadowAudioSettings(
			{ ...this.settings, ...patch },
			this.environment
		);
		if (this.context) {
			applyMinimalMeadowAudioSettings(this);
		}
		this.runtime.bus.emit('audio:settings-changed', { ...this.settings });
		return { ...this.settings };
	}

	cue(eventName, detail = {}) {
		const cue = minimalMeadowAudioCue(eventName);
		if (!cue) {
			return null;
		}
		this.runtime.bus.emit('audio:subtitle', {
			eventName,
			subtitle: detail.subtitle || cue.subtitle
		});
		if (!this.settings.muted && this.active.size < ACTIVE_LIMIT) {
			playMinimalMeadowAudioTone(this, cue);
		}
		return cue;
	}

	diagnostics() {
		return {
			activeVoices: this.active.size,
			ambience: this.ambience.diagnostics(),
			contextState: this.context?.state || 'unavailable',
			settings: { ...this.settings },
			voiceLimit: ACTIVE_LIMIT
		};
	}

	removeUnlockListeners() {
		this.environment.removeEventListener?.('pointerdown', this.unlock);
		this.environment.removeEventListener?.('keydown', this.unlock);
		this.environment.removeEventListener?.('click', this.unlock);
	}
	
	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.unsubscribers = [];
		this.removeUnlockListeners();
		this.ambience.destroy();
		closeMinimalMeadowAudioPlayback(this);
	}
}
