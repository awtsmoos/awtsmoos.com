// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferenceController.js
 * @description Synchronizes appearance controls with the serializable studio preference document.
 * The Awtsmoos renews control and chosen appearance through one source; Awtsmoos.com
 * keeps density, theme, zoom, overlays, and reset truthful without entering movie history.
 */

export class MovieStudioPreferenceController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.handlers = createHandlers(this);
		this.unsubscribe = session.events.on(
			'ui:preferences',
			() => this.sync()
		);
		this.bind();
		this.sync();
	}

	bind() {
		const { handlers, view } = this;
		view.density.addEventListener('change', handlers.density);
		view.theme.addEventListener('change', handlers.theme);
		view.previewZoom.addEventListener('change', handlers.previewZoom);
		view.resetPreferences.addEventListener('click', handlers.reset);
		for (const input of view.overlayInputs) {
			input.addEventListener('change', handlers.overlay);
		}
	}

	sync() {
		const value = this.session.preferences.get();
		this.view.density.value = value.density;
		this.view.theme.value = value.theme;
		this.view.previewZoom.value = value.previewZoom;
		this.view.previewBadge.textContent = `${
			value.previewZoom
		} · ${this.session.project.resolution.width}×${
			this.session.project.resolution.height
		}`;
		for (const input of this.view.overlayInputs) {
			input.checked = Boolean(value.overlays[input.dataset.overlay]);
		}
	}

	destroy() {
		const { handlers, view } = this;
		view.density.removeEventListener('change', handlers.density);
		view.theme.removeEventListener('change', handlers.theme);
		view.previewZoom.removeEventListener('change', handlers.previewZoom);
		view.resetPreferences.removeEventListener('click', handlers.reset);
		for (const input of view.overlayInputs) {
			input.removeEventListener('change', handlers.overlay);
		}
		this.unsubscribe?.();
	}
}

function createHandlers(controller) {
	return {
		density: event => controller.session.preferences.set({
			density: event.target.value
		}),
		overlay: event => controller.session.preferences.setOverlay(
			event.target.dataset.overlay,
			event.target.checked
		),
		previewZoom: event => controller.session.preferences.set({
			previewZoom: event.target.value
		}),
		reset: () => controller.session.preferences.reset(),
		theme: event => controller.session.preferences.set({
			theme: event.target.value
		})
	};
}
