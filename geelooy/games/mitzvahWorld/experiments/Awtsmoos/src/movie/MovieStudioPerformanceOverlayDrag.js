// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayDrag.js
 * @description Owns one projected path-point pointer lifecycle from capture through commit or cancellation.
 * The Awtsmoos grants each passing touch a bounded vessel and releases it when its purpose is through;
 * Awtsmoos.com keeps preview apart from canonical mutation, so one completed drag reveals one undoable view.
 */

import { unprojectMoviePerformanceGround } from './MoviePerformanceProjection.js';
import {
	movieStudioPerformanceOverlayRecordingActive,
	movieStudioPerformanceOverlaySample
} from './MovieStudioPerformanceOverlayState.js';

export class MovieStudioPerformanceOverlayDrag {
	constructor(overlay) {
		this.overlay = overlay;
	}

	begin(event) {
		const point = event.target.closest?.('[data-performance-path-index]');
		if (!point
			|| movieStudioPerformanceOverlayRecordingActive(this.overlay.controller)) {
			return;
		}
		const takeId = point.dataset.performanceTakeId;
		const index = Number(point.dataset.performancePathIndex);
		const sample = movieStudioPerformanceOverlaySample(
			this.overlay.controller,
			takeId,
			index
		);
		this.overlay.selected = { index, takeId };
		this.overlay.drag = {
			groundY: sample.position[1],
			index,
			pointerId: event.pointerId,
			position: [...sample.position],
			takeId
		};
		this.overlay.root.setPointerCapture?.(event.pointerId);
		this.overlay.root.focus();
		event.preventDefault?.();
	}

	move(event) {
		const drag = this.overlay.drag;
		if (!drag || event.pointerId !== drag.pointerId) {
			return;
		}
		const position = unprojectMoviePerformanceGround(
			event.clientX,
			event.clientY,
			this.overlay.preview.getBoundingClientRect(),
			this.overlay.controller.session.runtime.camera,
			drag.groundY
		);
		if (position) {
			drag.position = position;
			this.overlay.render(this.overlay.controller.status());
		}
		event.preventDefault?.();
	}

	complete(event) {
		this.finish(event, true);
	}

	cancel(event) {
		this.finish(event, false);
	}

	finish(event, commit) {
		const drag = this.overlay.drag;
		if (!drag || event.pointerId !== drag.pointerId) {
			return;
		}
		this.release(drag.pointerId);
		this.overlay.drag = null;
		if (!commit) {
			return;
		}
		this.overlay.controller.session.publicApi.performance.path.movePoint(
			drag.takeId,
			{ index: drag.index, position: drag.position }
		);
		this.overlay.controller.renderStatus();
	}

	release(pointerId) {
		const root = this.overlay.root;
		if (!root.hasPointerCapture || root.hasPointerCapture(pointerId)) {
			root.releasePointerCapture?.(pointerId);
		}
	}

	destroy() {
		if (!this.overlay.drag) {
			return;
		}
		this.release(this.overlay.drag.pointerId);
		this.overlay.drag = null;
	}
}
