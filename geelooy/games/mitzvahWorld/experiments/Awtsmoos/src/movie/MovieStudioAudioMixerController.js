// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAudioMixerController.js
 * @description Connects selected audio clips to waveform, clip mix, mute, and solo controls.
 * The Awtsmoos renews sound and silence before any fader moves; Awtsmoos.com routes
 * every bounded clip and track change through canonical history while listeners depart cleanly.
 */

import { selectedMovieAudioClip, updateMovieAudioClip } from './MovieAudioMixerProject.js';
import { movieAudioWaveform, movieAudioWaveformPath } from './MovieAudioWaveform.js';

export class MovieStudioAudioMixerController {
	constructor(session, studioView) {
		this.session = session;
		this.view = collectView(studioView.root);
		this.listeners = [];
		this.unsubscribe = session.events.on('selection:changed', () => this.refresh());
		this.bind();
		this.refresh();
	}

	bind() {
		this.listen(this.view.apply, 'click', () => this.apply());
		this.listen(this.view.mute, 'click', () => this.toggleTrack('muted'));
		this.listen(this.view.solo, 'click', () => this.toggleTrack('solo'));
	}

	refresh() {
		this.resolved = selectedMovieAudioClip(
			this.session.project,
			this.session.commands.selection
		);
		if (!this.resolved) return this.paintEmpty();
		const { clip, track } = this.resolved;
		this.view.selection.textContent = `${track.id} · ${clip.id} · ${clip.duration}s`;
		this.view.volume.value = String(clip.volume ?? 0.04);
		this.view.frequency.value = String(clip.frequency ?? 110);
		this.view.pan.value = String(clip.pan ?? 0);
		this.paintTrackButton(this.view.mute, track.muted === true);
		this.paintTrackButton(this.view.solo, track.solo === true);
		this.view.path.setAttribute('d', movieAudioWaveformPath(
			movieAudioWaveform(this.session.project, this.session.commands.selection)
		));
		this.status('Audio clip ready.');
	}

	paintEmpty() {
		this.view.selection.textContent = 'No selected audio clip';
		this.view.path.setAttribute('d', '');
		this.paintTrackButton(this.view.mute, false);
		this.paintTrackButton(this.view.solo, false);
		this.status('Select an audio clip.');
	}

	apply() {
		if (!this.resolved) return this.status('Select an audio clip first.');
		const project = updateMovieAudioClip(
			this.session.project,
			this.session.commands.selection,
			{
				frequency: this.view.frequency.value,
				pan: this.view.pan.value,
				volume: this.view.volume.value
			}
		);
		this.session.commands.commitProject(project, 'Update audio clip mix');
	}

	toggleTrack(name) {
		if (!this.resolved) return this.status('Select an audio clip first.');
		const value = this.resolved.track[name] !== true;
		this.session.commands.run('setTrackState', {
			[name]: value,
			trackId: this.resolved.track.id
		});
	}

	paintTrackButton(button, active) {
		button?.setAttribute('aria-pressed', String(active));
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}

	status(message) {
		if (this.view.status) this.view.status.textContent = message;
	}

	destroy() {
		this.unsubscribe?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function collectView(root) {
	const find = name => root.querySelector(`[data-audio-${name}]`);
	return {
		apply: find('apply'),
		frequency: find('frequency'),
		mute: find('mute'),
		pan: find('pan'),
		path: find('waveform-path'),
		selection: find('selection'),
		solo: find('solo'),
		status: find('mixer-status'),
		volume: find('volume')
	};
}
