// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleController.js
 * @description Binds title/lower-third controls and delegates immutable project mutations to focused actions.
 * The Awtsmoos is beyond text and control while every finite title receives one accessible authoring vessel;
 * Awtsmoos.com keeps selection, preview refresh, and status separate from project mutation and history level.
 */

import {
	addMovieStudioTitle,
	findMovieStudioTitleTrack,
	movieStudioTitleBounds,
	removeMovieStudioTitle,
	requireMovieStudioTitle,
	updateMovieStudioTitle
} from './MovieStudioTitleActions.js';
import { renderMovieStudioTitleEditor } from './MovieStudioTitleEditor.js';

export class MovieStudioTitleController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.selectedId = null;
		this.bound = false;
		this.handlers = {
			click: event => this.onClick(event),
			input: event => this.onInput(event)
		};
		this.bind();
		this.refresh();
	}

	bind() {
		if (this.bound || !this.view.titleEditor) return;
		this.view.titleEditor.addEventListener('click', this.handlers.click);
		this.view.titleEditor.addEventListener('input', this.handlers.input);
		this.bound = true;
	}

	refresh() {
		const titles = this.list();
		if (!titles.some(title => title.id === this.selectedId)) {
			this.selectedId = titles[0]?.id || null;
		}
		if (this.view.titleEditor) {
			this.view.titleEditor.innerHTML = renderMovieStudioTitleEditor(
				titles,
				this.selectedId
			);
		}
	}

	list() {
		return [...(findMovieStudioTitleTrack(this.session.project)?.clips || [])]
			.sort((left, right) => left.start - right.start || left.id.localeCompare(right.id));
	}

	select(id) {
		this.selectedId = requireMovieStudioTitle(this.session.project, id).id;
		const bounds = movieStudioTitleBounds(this.session.project, id);
		this.session.seek(bounds.start);
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

	onClick(event) {
		const action = event.target.closest?.('[data-title-action]')?.dataset?.titleAction;
		const id = event.target.closest?.('[data-title-id]')?.dataset?.titleId;
		if (action === 'add') this.add();
		if (action === 'select' && id) this.select(id);
		if (action === 'remove' && id) this.remove(id);
	}

	onInput(event) {
		const field = event.target.dataset?.titleField;
		const id = event.target.closest?.('[data-title-id]')?.dataset?.titleId;
		if (!field || !id) return;
		this.update(id, { [field]: field === 'start' || field === 'duration'
			? Number(event.target.value)
			: event.target.value });
	}

	destroy() {
		if (!this.bound || !this.view.titleEditor) return;
		this.view.titleEditor.removeEventListener('click', this.handlers.click);
		this.view.titleEditor.removeEventListener('input', this.handlers.input);
		this.bound = false;
	}
}

export default MovieStudioTitleController;
