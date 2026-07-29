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
import {
	collectMovieStudioKeyframeView,
	paintMovieKeyframeLanes,
	paintMovieKeyframeSelection
} from './MovieStudioKeyframeView.js';

export class MovieStudioKeyframeController {
	constructor(session, studioView) {
		this.session = session;
		this.authoringView = studioView.keyframeEditor || null;
		if (this.authoringView && !studioView.root) {
			this.view = studioView;
			this.listeners = [];
			this.selected = null;
			this.unsubSelection = typeof session.events?.on === 'function'
				? session.events.on('selection:changed', () => this.renderAuthoring())
				: null;
			this.bindAuthoring();
			this.renderAuthoring();
			return;
		}
		this.view = collectMovieStudioKeyframeView(studioView.root);
		this.listeners = [];
		this.selected = null;
		this.unsubSelection = typeof session.events?.on === 'function'
			? session.events.on('selection:changed', () => this.refresh())
			: null;
		this.bind();
		this.refresh();
	}

	bindAuthoring() {
		this.listen(this.authoringView, 'click', event => {
			const action = event.target?.closest?.('[data-keyframe-action]')?.dataset;
			if (!action?.keyframeId) return;
			if (action.keyframeAction === 'select') this.select(action.keyframeId);
			if (action.keyframeAction === 'remove') this.remove(action.keyframeId);
		});
	}

	renderAuthoring() {
		if (!this.authoringView) return;
		const duration = finite(this.session.project?.duration, 0);
		const frames = authoringKeyframes(this.session.project);
		this.authoringView.innerHTML = [
			'<section class="movie-keyframe-authoring" aria-label="3D keyframe editor">',
			frames.length
				? frames.map(frame => authoringKeyframeMarkup(frame, duration)).join('')
				: '<p class="movie-keyframe-empty">No 3D keyframes yet.</p>',
			'</section>'
		].join('');
	}

	select(id) {
		const frame = authoringKeyframes(this.session.project).find(item => item.id === id);
		if (!frame) return null;
		this.selected = id;
		this.session.seek?.(finite(frame.time, 0));
		this.renderAuthoring();
		return id;
	}

	save(id, patch = {}) {
		const project = cloneProject(this.session.project);
		const frames = ensureAuthoringKeyframes(project);
		const index = frames.findIndex(frame => frame.id === id);
		if (index < 0) throw new Error(`Keyframe ${id} was not found.`);
		frames[index] = normalizeAuthoringKeyframe(
			{ ...frames[index], ...patch, id },
			project.duration
		);
		frames.sort(compareAuthoringKeyframes);
		this.session.commands.commitProject(project, 'Update keyframe');
		this.renderAuthoring();
		return id;
	}

	bind() {
		this.listen(this.view.kind, 'change', () => this.applyBounds());
		this.listen(this.view.add, 'click', () => this.add());
		this.listen(this.view.remove, 'click', () => this.remove());
		this.listen(this.view.lanes, 'click', event => this.choose(event));
	}

	refresh() {
		this.resolved = selectedMovieKeyframeClip(
			this.session.project,
			this.session.commands.selection
		);
		this.selected = null;
		if (this.view.selection) {
			this.view.selection.textContent = this.resolved
				? `${this.resolved.track.id} · ${this.resolved.clip.id} · ${this.resolved.clip.duration}s`
				: 'No selected clip';
		}
		paintMovieKeyframeLanes(
			this.view,
			movieKeyframeLanes(this.resolved?.clip),
			this.resolved?.clip.duration || 0
		);
		this.status(this.resolved ? 'Ready for keyframes.' : 'Select a clip.');
	}

	choose(event) {
		const button = event.target?.closest?.('[data-keyframe-diamond]');
		if (!button || !this.resolved) return;
		const lane = movieKeyframeLanes(this.resolved.clip)
			.find(record => record.id === button.dataset.effectId);
		const frame = lane?.keyframes.find(record => record.time === Number(button.dataset.time));
		if (!lane || !frame) return;
		this.selected = { effectId: lane.id, time: frame.time };
		paintMovieKeyframeSelection(this.view, lane, frame, button);
	}

	add() {
		if (!this.resolved) return this.status('Select a clip first.');
		const effect = upsertMovieEffectKeyframe(this.resolved.clip, {
			baseValue: this.view.baseValue.value,
			easing: this.view.easing.value,
			kind: this.view.kind.value,
			time: this.view.time.value,
			value: this.view.value.value
		});
		this.session.commands.run('upsertClipEffect', { effect });
	}

	remove(id = null) {
		if (this.authoringView) {
			const keyframeId = id || this.selected;
			if (!keyframeId) return null;
			const project = cloneProject(this.session.project);
			const frames = ensureAuthoringKeyframes(project);
			const next = frames.filter(frame => frame.id !== keyframeId);
			if (next.length === frames.length) {
				throw new Error(`Keyframe ${keyframeId} was not found.`);
			}
			project.authoring3d.keyframes = next;
			this.session.commands.commitProject(project, 'Remove keyframe');
			if (this.selected === keyframeId) this.selected = null;
			this.renderAuthoring();
			return keyframeId;
		}
		if (!this.resolved || !this.selected) return this.status('Choose a diamond first.');
		const effect = removeMovieEffectKeyframe(
			this.resolved.clip, this.selected.effectId, this.selected.time
		);
		this.session.commands.run('upsertClipEffect', { effect });
	}

	applyBounds() {
		const bounds = movieEffectBounds(this.view.kind?.value);
		for (const input of [this.view.baseValue, this.view.value]) {
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

	status(message) { if (this.view.status) this.view.status.textContent = message; }

	destroy() {
		this.unsubSelection?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function authoringKeyframes(project) {
	return Array.isArray(project?.authoring3d?.keyframes)
		? project.authoring3d.keyframes
		: [];
}

function ensureAuthoringKeyframes(project) {
	project.authoring3d ||= {};
	project.authoring3d.keyframes ||= [];
	return project.authoring3d.keyframes;
}

function normalizeAuthoringKeyframe(frame, duration) {
	return {
		...frame,
		easing: String(frame.easing || 'linear'),
		targetId: String(frame.targetId || ''),
		time: Math.min(Math.max(finite(frame.time, 0), 0), finite(duration, 0))
	};
}

function compareAuthoringKeyframes(left, right) {
	return finite(left.time, 0) - finite(right.time, 0) ||
		String(left.id).localeCompare(String(right.id));
}

function authoringKeyframeMarkup(frame, duration) {
	const value = escapeHtml(JSON.stringify(frame.value ?? {}));
	const id = escapeHtml(frame.id);
	return `<article class="movie-keyframe-record" data-keyframe-id="${id}">
		<button type="button" data-keyframe-action="select" data-keyframe-id="${id}">${id}</button>
		<label>Time <input data-keyframe-field="time" type="range" min="0" max="${duration}" value="${finite(frame.time, 0)}"></label>
		<label>Easing <select data-keyframe-field="easing"><option>${escapeHtml(frame.easing || 'linear')}</option><option>linear</option><option>smoothstep</option></select></label>
		<label>Target <input data-keyframe-field="targetId" value="${escapeHtml(frame.targetId)}"></label>
		<label>Value <textarea data-keyframe-field="value">${value}</textarea></label>
		<button type="button" data-keyframe-action="remove" data-keyframe-id="${id}">Remove</button>
	</article>`;
}

function cloneProject(project) {
	return typeof structuredClone === 'function'
		? structuredClone(project)
		: JSON.parse(JSON.stringify(project));
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
