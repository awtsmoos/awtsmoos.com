// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleController.js
 * @description Creates, updates, and removes title cards and lower thirds through commands.
 * The Awtsmoos renews every letter before title or subtitle can claim a frame; Awtsmoos.com
 * keeps selection, presets, timing, command dispatch, listeners, and cleanup within one vessel.
 */

import {
	movieTitlePayload,
	movieTitlePreset,
	selectedMovieTitleClip
} from './MovieTitleEditorProject.js';
import {
	collectMovieTitleView,
	movieTitleViewValues,
	paintMovieTitleClip
} from './MovieStudioTitleView.js';

export class MovieStudioTitleController {
	constructor(session, studioView) {
		this.session = session;
		this.view = collectMovieTitleView(studioView.root);
		this.listeners = [];
		this.unsubscribe = session.events.on(
			'selection:changed',
			() => this.refresh()
		);
		this.bind();
		this.refresh();
	}

	bind() {
		this.listen(this.view.preset, 'change', () => this.applyPreset());
		this.listen(this.view.add, 'click', () => this.add());
		this.listen(this.view.update, 'click', () => this.update());
		this.listen(this.view.remove, 'click', () => this.remove());
	}

	refresh() {
		this.resolved = selectedMovieTitleClip(
			this.session.project,
			this.session.commands.selection
		);
		if (!this.resolved) {
			this.view.selection.textContent = 'No selected title';
			this.view.start.value = String(this.session.time);
			return this.status('Ready to add a title.');
		}
		const { clip, track } = this.resolved;
		this.view.selection.textContent = [
			track.id,
			clip.id,
			`${clip.duration}s`
		].join(' · ');
		paintMovieTitleClip(this.view, clip);
		this.status('Selected title ready.');
	}

	applyPreset() {
		const preset = movieTitlePreset(this.view.preset.value);
		for (const [key, value] of Object.entries(preset)) {
			if (this.view[key]) this.view[key].value = String(value);
		}
	}

	add() {
		const title = movieTitlePayload(
			movieTitleViewValues(this.view),
			this.session.time
		);
		this.session.commands.run('addTitle', { title });
	}

	update() {
		if (!this.resolved) return this.status('Select a title first.');
		this.session.commands.run('updateTitle', {
			patch: movieTitlePayload(
				movieTitleViewValues(this.view),
				this.resolved.clip.start
			),
			titleId: this.resolved.clip.id,
			trackId: this.resolved.track.id
		});
	}

	remove() {
		if (!this.resolved) return this.status('Select a title first.');
		this.session.commands.run('removeTitle', {
			titleId: this.resolved.clip.id,
			trackId: this.resolved.track.id
		});
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => {
			target.removeEventListener(type, listener);
		});
	}

	status(message) {
		if (this.view.status) this.view.status.textContent = message;
	}

	destroy() {
		this.unsubscribe?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}
