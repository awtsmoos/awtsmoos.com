// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceView.js
 * @description Owns removable manual acting listeners and delegates their installation and rendering.
 * The Awtsmoos joins hand, keyboard, finger, and API without divided state; Awtsmoos.com
 * keeps every range, record, action, take, filter, and preference operation in canonical rhyme.
 */

import { bindMovieStudioPerformanceView } from './MovieStudioPerformanceViewBindings.js';
import {
	readMovieStudioPerformancePreferenceChanges,
	readMovieStudioPerformanceRecordingOptions
} from './MovieStudioPerformanceViewOptions.js';
import { collectMovieStudioPerformanceView } from './MovieStudioPerformanceViewRefs.js';
import { renderMovieStudioPerformanceView } from './MovieStudioPerformanceViewRender.js';

export class MovieStudioPerformanceView {
	constructor(controller, root) {
		this.controller = controller;
		this.elements = collectMovieStudioPerformanceView(root);
		this.disposers = [];
		bindMovieStudioPerformanceView(this);
	}

	recordingOptions() {
		return readMovieStudioPerformanceRecordingOptions(this.elements);
	}

	persistPreferences() {
		return this.controller.updatePreferences(
			readMovieStudioPerformancePreferenceChanges(this.elements)
		);
	}

	onActionClick(event) {
		const button = event.target.closest?.('[data-performance-action-id]');
		if (button) {
			this.controller.triggerAction(
				button.dataset.performanceActionId
			);
		}
	}

	onTakeClick(event) {
		const button = event.target.closest?.('[data-performance-take-action]');
		if (button) {
			this.controller.handleTakeAction(
				button.dataset.performanceTakeAction,
				button.dataset.performanceTargetId
			);
		}
	}

	render(snapshot) {
		renderMovieStudioPerformanceView(this.elements, snapshot);
	}

	change(element, handler) {
		this.listen(element, 'change', handler);
	}

	click(element, handler) {
		this.listen(element, 'click', handler);
	}

	listen(element, name, handler) {
		if (!element) {
			return;
		}
		element.addEventListener(name, handler);
		this.disposers.push(() => (
			element.removeEventListener(name, handler)
		));
	}

	destroy() {
		for (const dispose of this.disposers.splice(0)) {
			dispose();
		}
	}
}
