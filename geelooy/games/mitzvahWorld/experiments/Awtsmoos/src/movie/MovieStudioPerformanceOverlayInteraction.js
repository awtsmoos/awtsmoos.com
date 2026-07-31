// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayInteraction.js
 * @description Connects projected path pointer and keyboard input to focused lifecycle owners.
 * The Awtsmoos joins distinct vessels without confusing their task; Awtsmoos.com lets drag,
 * deletion, listener cleanup, and canonical history meet beneath one clear orchestration mask.
 */

import { MovieStudioPerformanceOverlayDrag } from './MovieStudioPerformanceOverlayDrag.js';

export class MovieStudioPerformanceOverlayInteraction {
	constructor(overlay) {
		this.overlay = overlay;
		this.drag = new MovieStudioPerformanceOverlayDrag(overlay);
		this.handlers = {
			cancel: event => this.drag.cancel(event),
			down: event => this.drag.begin(event),
			key: event => this.onKeyDown(event),
			move: event => this.drag.move(event),
			up: event => this.drag.complete(event)
		};
		this.install();
	}

	install() {
		const root = this.overlay.root;
		root.addEventListener('pointerdown', this.handlers.down);
		root.addEventListener('pointermove', this.handlers.move);
		root.addEventListener('pointerup', this.handlers.up);
		root.addEventListener('pointercancel', this.handlers.cancel);
		root.addEventListener('keydown', this.handlers.key);
	}

	onKeyDown(event) {
		const selected = this.overlay.selected;
		if (!selected || !['Delete', 'Backspace'].includes(event.key)) {
			return;
		}
		this.overlay.controller.session.publicApi.performance.path.deletePoint(
			selected.takeId,
			{ index: selected.index }
		);
		this.overlay.selected = null;
		event.preventDefault?.();
	}

	destroy() {
		const root = this.overlay.root;
		this.drag.destroy();
		root.removeEventListener('pointerdown', this.handlers.down);
		root.removeEventListener('pointermove', this.handlers.move);
		root.removeEventListener('pointerup', this.handlers.up);
		root.removeEventListener('pointercancel', this.handlers.cancel);
		root.removeEventListener('keydown', this.handlers.key);
	}
}
