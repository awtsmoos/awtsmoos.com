// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeController.js
 * @description Connects selected clips to visual effect lanes and immutable history-aware keyframe commands.
 * The Awtsmoos renews point, value, and selected vessel in one present frame; Awtsmoos.com
 * lets humans add, update, inspect, and remove diamonds without touching raw project JSON.
 */

import {
	movieEffectBounds,
	movieKeyframeLanes,
	removeMovieEffectKeyframe,
	selectedMovieKeyframeClip,
	upsertMovieEffectKeyframe
} from './MovieStudioKeyframeProject.js';

export class MovieStudioKeyframeController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.listeners = [];
		this.selected = null;
		this.unsubSelection = session.events.on('selection:changed', () => this.refresh());
		this.bind();
		this.refresh();
	}

	bind() {
		this.listen(this.view.keyframeKind, 'change', () => this.applyBounds());
		this.listen(this.view.keyframeAdd, 'click', () => this.add());
		this.listen(this.view.keyframeRemove, 'click', () => this.remove());
		this.listen(this.view.keyframeLanes, 'click', event => this.choose(event));
	}

	refresh() {
		const resolved = selectedMovieKeyframeClip(
			this.session.project,
			this.session.commands.selection
		);
		this.resolved = resolved;
		this.selected = null;
		if (this.view.keyframeSelection) {
			this.view.keyframeSelection.textContent = resolved
				? `${resolved.track.id} · ${resolved.clip.id} · ${resolved.clip.duration}s`
				: 'No selected clip';
		}
		this.renderLanes();
		this.status(resolved ? 'Ready for keyframes.' : 'Select a clip.');
	}

	renderLanes() {
		if (!this.view.keyframeLanes) return;
		const clip = this.resolved?.clip;
		const lanes = movieKeyframeLanes(clip);
		this.view.keyframeLanes.innerHTML = lanes.length
			? lanes.map(lane => laneMarkup(lane, clip.duration)).join('')
			: '<p class="movie-keyframe-empty">No effect lanes yet. Choose a property and add a diamond.</p>';
	}

	choose(event) {
		const button = event.target?.closest?.('[data-keyframe-diamond]');
		if (!button || !this.resolved) return;
		const lane = movieKeyframeLanes(this.resolved.clip)
			.find(record => record.id === button.dataset.effectId);
		const frame = lane?.keyframes.find(record => record.time === Number(button.dataset.time));
		if (!lane || !frame) return;
		this.selected = { effectId: lane.id, time: frame.time };
		this.view.keyframeKind.value = lane.kind;
		this.view.keyframeBaseValue.value = String(lane.value);
		this.view.keyframeTime.value = String(frame.time);
		this.view.keyframeValue.value = String(frame.value);
		this.view.keyframeEasing.value = frame.easing;
		for (const item of this.view.keyframeLanes.querySelectorAll('[data-keyframe-diamond]')) {
			item.setAttribute('aria-pressed', String(item === button));
		}
	}

	add() {
		if (!this.resolved) return this.status('Select a clip first.');
		const effect = upsertMovieEffectKeyframe(this.resolved.clip, {
			baseValue: this.view.keyframeBaseValue.value,
			easing: this.view.keyframeEasing.value,
			kind: this.view.keyframeKind.value,
			time: this.view.keyframeTime.value,
			value: this.view.keyframeValue.value
		});
		this.session.commands.run('upsertClipEffect', { effect });
	}

	remove() {
		if (!this.resolved || !this.selected) return this.status('Choose a diamond first.');
		const effect = removeMovieEffectKeyframe(
			this.resolved.clip, this.selected.effectId, this.selected.time
		);
		this.session.commands.run('upsertClipEffect', { effect });
	}

	applyBounds() {
		const bounds = movieEffectBounds(this.view.keyframeKind.value);
		for (const input of [this.view.keyframeBaseValue, this.view.keyframeValue]) {
			if (!input || !bounds) continue;
			input.min = String(bounds.minimum);
			input.max = String(bounds.maximum);
		}
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}

	status(message) { if (this.view.keyframeStatus) this.view.keyframeStatus.textContent = message; }

	destroy() {
		this.unsubSelection?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function laneMarkup(lane, duration) {
	const diamonds = lane.keyframes.map(frame => `<button class="movie-keyframe-diamond" data-keyframe-diamond data-effect-id="${lane.id}" data-time="${frame.time}" style="left:${duration ? frame.time / duration * 100 : 0}%" aria-label="${lane.kind} ${frame.value} at ${frame.time} seconds" aria-pressed="false"></button>`).join('');
	return `<div class="movie-keyframe-lane"><strong>${lane.kind}</strong><div class="movie-keyframe-lane-track">${diamonds}</div></div>`;
}
