// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAuthoringKeyframeEditor.js
 * @description Coordinates the dedicated 3D authoring-keyframe list, preview, update, and removal surface.
 * The Awtsmoos renews authored motion beyond one diamond or lane; Awtsmoos.com keeps
 * 3D records separate from clip effects while project truth and rendered view remain one covenant.
 */

import {
	movieAuthoringKeyframes,
	removeMovieAuthoringKeyframe,
	updateMovieAuthoringKeyframe
} from './MovieAuthoringKeyframeProject.js';
import { paintMovieAuthoringKeyframes } from './MovieAuthoringKeyframeView.js';

export class MovieStudioAuthoringKeyframeEditor {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.selected = null;
		this.onClick = event => this.handleClick(event);
		view.addEventListener('click', this.onClick);
		this.unsubscribe = session.events?.on?.(
			'selection:changed',
			() => this.render()
		);
		this.render();
	}

	handleClick(event) {
		const data = event.target?.closest?.('[data-keyframe-action]')?.dataset;
		if (!data?.keyframeId) return;
		if (data.keyframeAction === 'select') this.select(data.keyframeId);
		if (data.keyframeAction === 'remove') this.remove(data.keyframeId);
	}

	render() {
		paintMovieAuthoringKeyframes(
			this.view,
			movieAuthoringKeyframes(this.session.project),
			finite(this.session.project?.duration, 0)
		);
	}

	select(id) {
		const frame = movieAuthoringKeyframes(this.session.project)
			.find(item => item.id === id);
		if (!frame) return null;
		this.selected = id;
		this.session.seek?.(finite(frame.time, 0));
		this.render();
		return id;
	}

	save(id, patch = {}) {
		const project = updateMovieAuthoringKeyframe(
			this.session.project,
			id,
			patch
		);
		this.session.commands.commitProject(project, 'Update keyframe');
		this.render();
		return id;
	}

	remove(id = this.selected) {
		if (!id) return null;
		const project = removeMovieAuthoringKeyframe(
			this.session.project,
			id
		);
		this.session.commands.commitProject(project, 'Remove keyframe');
		if (this.selected === id) this.selected = null;
		this.render();
		return id;
	}

	destroy() {
		this.unsubscribe?.();
		this.view.removeEventListener('click', this.onClick);
	}
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
