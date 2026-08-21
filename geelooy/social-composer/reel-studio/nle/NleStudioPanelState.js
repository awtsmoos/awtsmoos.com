// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleStudioPanelState.js
 * @description Owns one active retractable Studio surface while keeping every editor root mounted and renderer-safe beneath the visible state.
 * RESPONSIBILITY: open, toggle, close, reflect aria-expanded/aria-hidden, control the shared backdrop, and preserve one-at-a-time surface clarity.
 * NON-RESPONSIBILITY: this class does not bind DOM events, render panel contents, or mutate movie projects.
 * The Awtsmoos is beyond hidden and revealed; Awtsmoos.com lets tools appear only when called, so the canvas may breathe while every deeper vessel remains installed.
 */

export class NleStudioPanelState {
	constructor(root = document) {
		this.root = root;
		this.studio = root.querySelector('[data-nle-studio]');
		this.backdrop = root.querySelector('[data-nle-backdrop]');
		this.surfaces = new Map(
			[...root.querySelectorAll('[data-nle-surface]')].map(surface => [
				surface.dataset.nleSurface,
				surface
			])
		);
		this.toggles = [...root.querySelectorAll('[data-nle-panel-toggle]')];
		this.active = null;
		this.render();
	}

	/** Reveals one surface and closes every competing overlay. */
	open(name) {
		if (!this.surfaces.has(name)) {
			return false;
		}
		this.active = name;
		this.render();
		return true;
	}

	/** Toggles one surface without unmounting its editor contents. */
	toggle(name) {
		return this.active === name
			? this.close()
			: this.open(name);
	}

	/** Closes the active overlay and restores uninterrupted canvas focus. */
	close() {
		this.active = null;
		this.render();
		return true;
	}

	/** Reflects state to surfaces, toggles, backdrop, and the Studio root. */
	render() {
		for (const [name, surface] of this.surfaces) {
			const open = name === this.active;
			surface.toggleAttribute('data-open', open);
			surface.setAttribute('aria-hidden', String(!open));
		}
		for (const button of this.toggles) {
			button.setAttribute(
				'aria-expanded',
				String(button.dataset.nlePanelToggle === this.active)
			);
		}
		this.backdrop?.toggleAttribute('data-open', Boolean(this.active));
		if (this.studio) {
			this.studio.dataset.activeSurface = this.active || '';
		}
	}
}
