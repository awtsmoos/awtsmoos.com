// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleController.js
 * @description Binds the structured title form to immutable title actions and selected timeline clips.
 * The Awtsmoos renews every word before card or lower third can claim a frame; Awtsmoos.com
 * keeps visual controls, public agent methods, timeline selection, and canonical history in one covenant.
 */
import {
	addMovieStudioTitle,
	findMovieStudioTitleTrack,
	movieStudioTitleBounds,
	removeMovieStudioTitle,
	requireMovieStudioTitle,
	updateMovieStudioTitle
} from './MovieStudioTitleActions.js';
import {
	applyMovieStudioTitleFormPreset,
	movieStudioTitleFormPayload,
	selectedMovieStudioTitle
} from './MovieStudioTitleForm.js';
import { collectMovieTitleView, paintMovieTitleClip } from './MovieStudioTitleView.js';
export class MovieStudioTitleController {
	constructor(session, studioView) {
		this.session = session;
		this.view = collectMovieTitleView(studioView.root);
		this.listeners = [];
		this.selectedId = null;
		this.unsubscribe = session.events?.on?.(
			'selection:changed',
			() => this.refresh()
		);
		this.bind();
		this.refresh();
	}
	bind() {
		this.listen(this.view.preset, 'change', () => {
			applyMovieStudioTitleFormPreset(this.view);
		});
		this.listen(this.view.add, 'click', () => this.addFromView());
		this.listen(this.view.update, 'click', () => this.updateFromView());
		this.listen(this.view.remove, 'click', () => this.removeSelected());
	}
	refresh() {
		const resolved = selectedMovieStudioTitle(this.session);
		if (resolved) this.selectedId = resolved.clip.id;
		if (!this.list().some(title => title.id === this.selectedId)) {
			this.selectedId = null;
		}
		const title = this.selectedId
			? requireMovieStudioTitle(this.session.project, this.selectedId)
			: null;
		this.view.selection.textContent = title
			? `${title.id} · ${title.start}s · ${title.duration}s`
			: 'No selected title';
		if (title) paintMovieTitleClip(this.view, title);
		else this.view.start.value = String(this.session.time);
		this.status(title ? 'Selected title ready.' : 'Ready to add a title.');
	}
	list() {
		return [...(findMovieStudioTitleTrack(this.session.project)?.clips || [])]
			.sort((left, right) => {
				return left.start - right.start || left.id.localeCompare(right.id);
			});
	}
	select(id) {
		this.selectedId = requireMovieStudioTitle(this.session.project, id).id;
		this.session.seek(movieStudioTitleBounds(this.session.project, id).start);
		this.refresh();
		return id;
	}
	add(source = {}) {
		this.selectedId = addMovieStudioTitle(this.session, source);
		this.refresh();
		return this.selectedId;
	}
	update(id, patch = {}) {
		this.selectedId = updateMovieStudioTitle(this.session, id, patch);
		this.refresh();
		return this.selectedId;
	}
	remove(id) {
		removeMovieStudioTitle(this.session, id);
		if (this.selectedId === id) this.selectedId = null;
		this.refresh();
		return id;
	}
	addFromView() {
		return this.add(movieStudioTitleFormPayload(
			this.view,
			this.session.time
		));
	}
	updateFromView() {
		if (!this.selectedId) return this.status('Select a title first.');
		return this.update(
			this.selectedId,
			movieStudioTitleFormPayload(this.view, this.session.time)
		);
	}
	removeSelected() {
		if (!this.selectedId) return this.status('Select a title first.');
		return this.remove(this.selectedId);
	}
	status(message) {
		if (this.view.status) this.view.status.textContent = message;
	}
	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}
	destroy() {
		this.unsubscribe?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}
export default MovieStudioTitleController;
