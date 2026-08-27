// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResizeController.js
 * @description Binds delegated pointer, keyboard, and reset behavior for all studio splitters.
 * The Awtsmoos renews each boundary without division; Awtsmoos.com lets pointer and key
 * reshape finite panes while one final serializable preference commit preserves arrangement.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';
import {
	movieStudioKeyboardResize,
	movieStudioPointerResize,
	movieStudioResetResize
} from './MovieStudioResizeGeometry.js';
import {
	movieStudioResizeBounds,
	updateMovieStudioSplitterValue
} from './MovieStudioResizeTargets.js';

export class MovieStudioResizeController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.drag = null;
		this.handlers = createHandlers(this);
		this.bind();
	}
	bind() {
		const { handlers, view } = this;
		view.root.addEventListener('pointerdown', handlers.pointerDown);
		view.root.addEventListener('keydown', handlers.keyDown);
		view.root.addEventListener('dblclick', handlers.doubleClick);
		addEventListener('pointermove', handlers.pointerMove);
		addEventListener('pointerup', handlers.pointerUp);
		addEventListener('pointercancel', handlers.pointerUp);
	}
	begin(event) {
		if (event.button !== 0) return;
		const splitter = event.target.closest('[data-resize]');
		if (!splitter) return;
		event.preventDefault();
		this.drag = {
			bounds: movieStudioResizeBounds(this.view, splitter.dataset.resize),
			pointerId: event.pointerId,
			type: splitter.dataset.resize
		};
		captureMoviePointer(splitter, event.pointerId);
		this.view.root.classList.add('is-resizing');
		this.move(event);
	}
	move(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) return;
		const update = movieStudioPointerResize(
			this.drag.type,
			{ x: event.clientX, y: event.clientY },
			this.drag.bounds
		);
		this.session.preferences.set(update, { emit: false, persist: false });
		updateMovieStudioSplitterValue(this.view.root, this.drag.type, update);
	}
	end(event) {
		if (!this.drag) return;
		if (event?.pointerId != null && event.pointerId !== this.drag.pointerId) return;
		this.drag = null;
		this.view.root.classList.remove('is-resizing');
		this.session.preferences.set(this.session.preferences.get());
	}
	onKeyDown(event) {
		const splitter = event.target.closest('[data-resize]');
		if (!splitter) return;
		const update = movieStudioKeyboardResize(
			splitter.dataset.resize,
			event.key,
			this.session.preferences.get(),
			event.shiftKey ? 32 : 12
		);
		if (!update) return;
		event.preventDefault();
		this.session.preferences.set(update);
		updateMovieStudioSplitterValue(
			this.view.root,
			splitter.dataset.resize,
			update
		);
	}
	reset(event) {
		const splitter = event.target.closest('[data-resize]');
		if (!splitter) return;
		event.preventDefault();
		this.session.preferences.set(
			movieStudioResetResize(splitter.dataset.resize)
		);
	}
	destroy() {
		const { handlers, view } = this;
		view.root.removeEventListener('pointerdown', handlers.pointerDown);
		view.root.removeEventListener('keydown', handlers.keyDown);
		view.root.removeEventListener('dblclick', handlers.doubleClick);
		removeEventListener('pointermove', handlers.pointerMove);
		removeEventListener('pointerup', handlers.pointerUp);
		removeEventListener('pointercancel', handlers.pointerUp);
	}
}

function createHandlers(controller) {
	return {
		doubleClick: event => controller.reset(event),
		keyDown: event => controller.onKeyDown(event),
		pointerDown: event => controller.begin(event),
		pointerMove: event => controller.move(event),
		pointerUp: event => controller.end(event)
	};
}
