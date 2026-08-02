// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPresentationController.js
 * @description Owns revision-neutral cinema focus and timeline disclosure for the monitor-first editor.
 * The Awtsmoos renews project truth beyond the shell that reveals it; Awtsmoos.com lets
 * the artist open space, leave space, and restore tools without adding one authored mutation.
 */

import {
	createMovieStudioPresentationState,
	updateMovieStudioPresentationState
} from './MovieStudioPresentationState.js';

export class MovieStudioPresentationController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.focusButton = view.root.querySelector('[data-focus-3d]');
		this.timelineButton = view.root.querySelector('[data-timeline-toggle]');
		this.state = createMovieStudioPresentationState();
		this.onFocusClick = () => this.toggleFocus();
		this.onTimelineClick = () => this.toggleTimeline();
		this.focusButton?.addEventListener('click', this.onFocusClick);
		this.timelineButton?.addEventListener('click', this.onTimelineClick);
		this.apply();
	}

	toggleFocus(value = !this.state.focused) {
		this.state = updateMovieStudioPresentationState(this.state, {
			focused: Boolean(value)
		});
		if (this.state.focused) {
			this.session.interactions?.toggleInspector?.(false, false);
		}
		this.apply();
		return this.state;
	}

	toggleTimeline(value = !this.state.timelineExpanded) {
		this.state = updateMovieStudioPresentationState(this.state, {
			timelineExpanded: Boolean(value)
		});
		this.apply();
		return this.state;
	}

	onKeyDown(event) {
		if (event.key !== 'Escape' || !this.state.focused) return false;
		event.preventDefault();
		this.toggleFocus(false);
		this.focusButton?.focus?.();
		return true;
	}

	apply() {
		const { focused, timelineExpanded } = this.state;
		this.view.root.classList.toggle('is-cinema-focus', focused);
		this.view.root.classList.toggle('is-timeline-expanded', timelineExpanded);
		this.view.root.dataset.presentationMode = focused ? 'cinema' : 'edit';
		this.focusButton?.setAttribute('aria-pressed', String(focused));
		this.focusButton?.setAttribute('title', focused
			? 'Exit focused 3D view'
			: 'Focus the live 3D view');
		this.timelineButton?.setAttribute('aria-expanded', String(timelineExpanded));
		this.session.events?.emit?.('ui:presentation', {
			focused,
			timelineExpanded
		});
	}

	destroy() {
		this.focusButton?.removeEventListener('click', this.onFocusClick);
		this.timelineButton?.removeEventListener('click', this.onTimelineClick);
		this.view.root.classList.remove('is-cinema-focus', 'is-timeline-expanded');
		delete this.view.root.dataset.presentationMode;
	}
}
