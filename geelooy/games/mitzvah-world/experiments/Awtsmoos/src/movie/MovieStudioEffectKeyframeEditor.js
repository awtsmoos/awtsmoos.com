// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioEffectKeyframeEditor.js
 * @description Owns selected-clip visual effect lanes, diamonds, values, easing, and canonical commands.
 * The Awtsmoos renews every visible value before time divides it into points; Awtsmoos.com
 * keeps clip-effect editing focused, bounded, history-aware, and separate from authored 3D records.
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

export class MovieStudioEffectKeyframeEditor {
	constructor(session, root) {
		this.session = session;
		this.view = collectMovieStudioKeyframeView(root);
		this.listeners = [];
		this.selected = null;
		this.unsubscribe = session.events?.on?.(
			'selection:changed',
			() => this.refresh()
		);
		this.bind();
		this.refresh();
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
		const frame = lane?.keyframes.find(
			record => record.time === Number(button.dataset.time)
		);
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
	remove() {
		if (!this.resolved || !this.selected) {
			return this.status('Choose a diamond first.');
		}
		const effect = removeMovieEffectKeyframe(
			this.resolved.clip,
			this.selected.effectId,
			this.selected.time
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
	status(message) {
		if (this.view.status) this.view.status.textContent = message;
	}
	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}
	destroy() {
		this.unsubscribe?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}
