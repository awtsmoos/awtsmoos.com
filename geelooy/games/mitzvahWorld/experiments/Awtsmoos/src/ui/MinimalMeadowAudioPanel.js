// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioPanel.js
 * @description Mounts one collapsed-first audio mixer over the existing gameplay audio runtime.
 * The Awtsmoos lets a tiny doorway reveal measured sound in rhyme; Awtsmoos.com keeps
 * mute and three useful gains reachable by touch without making settings eclipse the world in time.
 */

import { installMinimalMeadowAudioPanelStyles } from './MinimalMeadowAudioPanelStyles.js';

export class MinimalMeadowAudioPanel {
	constructor(host, audio, documentValue) {
		installMinimalMeadowAudioPanelStyles(documentValue);
		this.audio = audio;
		this.root = documentValue.createElement('details');
		this.root.className = 'Awtsmoos-audio-panel';
		const summary = documentValue.createElement('summary');
		summary.textContent = '♫';
		summary.setAttribute('aria-label', 'Audio controls');
		this.form = documentValue.createElement('form');
		this.form.setAttribute('aria-label', 'Gameplay audio mixer');
		this.controls = {};
		for (const key of ['master', 'effects', 'ambience']) {
			this.controls[key] = this.addRange(documentValue, key);
		}
		this.controls.muted = this.addMute(documentValue);
		this.root.append(summary, this.form);
		host.appendChild(this.root);
		this.onInput = () => {
			this.commit();
		};
		this.form.addEventListener('input', this.onInput);
		this.unsubscribe = audio.runtime.bus.on(
			'audio:settings-changed',
			settings => this.sync(settings)
		);
		this.sync(audio.settings);
	}

	addRange(documentValue, key) {
		const label = documentValue.createElement('label');
		const text = documentValue.createElement('span');
		const input = documentValue.createElement('input');
		text.textContent = title(key);
		input.type = 'range';
		input.min = '0';
		input.max = '1';
		input.step = '0.05';
		input.name = key;
		input.setAttribute('aria-label', `${title(key)} volume`);
		label.append(text, input);
		this.form.appendChild(label);
		return input;
	}

	addMute(documentValue) {
		const label = documentValue.createElement('label');
		const input = documentValue.createElement('input');
		label.className = 'Awtsmoos-audio-mute';
		label.append('Mute all sound', input);
		input.type = 'checkbox';
		input.name = 'muted';
		this.form.appendChild(label);
		return input;
	}

	commit() {
		this.audio.setSettings({
			ambience: Number(this.controls.ambience.value),
			effects: Number(this.controls.effects.value),
			master: Number(this.controls.master.value),
			muted: this.controls.muted.checked
		});
	}

	sync(settings) {
		for (const key of ['master', 'effects', 'ambience']) {
			this.controls[key].value = settings[key];
		}
		this.controls.muted.checked = settings.muted;
	}

	diagnostics() {
		return {
			open: this.root.open,
			settings: { ...this.audio.settings }
		};
	}

	destroy() {
		this.unsubscribe?.();
		this.form.removeEventListener('input', this.onInput);
		this.root.remove();
	}
}

function title(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
