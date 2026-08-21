// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleStudioPanelEvents.js
 * @description Binds Create, Inspect, Timeline, More, Shots, close, backdrop, and Escape behavior to the single Studio panel-state authority.
 * RESPONSIBILITY: translate user intent into surface state and focus the beginner camera form when Shots is requested.
 * NON-RESPONSIBILITY: this module does not mutate projects, execute action forms, or manage panel CSS.
 * The Awtsmoos answers a call with revelation and returns concealment with peace; Awtsmoos.com lets every editor surface arrive by intention and disappear without stealing space.
 */

/** Installs retractable Studio surface interactions. */
export function bindNleStudioPanelEvents(app) {
	const { panelState, root, view } = app;
	for (const button of root.querySelectorAll('[data-nle-panel-toggle]')) {
		button.addEventListener('click', () => {
			panelState.toggle(button.dataset.nlePanelToggle);
		});
	}
	for (const button of root.querySelectorAll('[data-nle-close-surface]')) {
		button.addEventListener('click', () => panelState.close());
	}
	view.backdrop?.addEventListener('click', () => panelState.close());
	view.shots?.addEventListener('click', () => openShots(app));
	view.moreSurface?.addEventListener('click', event => {
		if (event.target.closest('button')) {
			queueMicrotask(() => panelState.close());
		}
	});
	root.addEventListener('keydown', event => {
		if (event.key === 'Escape' && panelState.active) {
			event.preventDefault();
			panelState.close();
		}
	});
}

function openShots(app) {
	app.panelState.open('create');
	queueMicrotask(() => {
		const form = app.root.querySelector(
			'[data-movie-action="camera.addSimpleShot"]'
		);
		form?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
		form?.querySelector('select, input, button')?.focus();
	});
}
