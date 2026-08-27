// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityState.js
 * @description Owns one responsive utility surface, mobile inertness, backdrop, ARIA state, and focus return.
 * The Awtsmoos renews open and closed without being held by either; Awtsmoos.com lets
 * desktop drawers remain free while mobile sheets become one bounded modal vessel with no residue.
 */

import { focusMovieUtilityPanel, trapMovieUtilityFocus } from './MovieStudioUtilityFocus.js';

export class MovieStudioUtilityState {
	constructor(view, options = {}) {
		this.view = view;
		this.isCompact = options.isCompact || (() => matchMedia('(max-width: 720px)').matches);
		this.activeName = null;
		this.opener = null;
	}

	open(name, opener = null) {
		if (!this.view.utilityPanels[name]) return false;
		this.close(false);
		this.activeName = name;
		this.opener = opener || this.view.utilityToggles[name] || null;
		this.sync();
		const preferred = name === 'commands' ? this.view.commandSearch : null;
		focusMovieUtilityPanel(this.activePanel(), preferred);
		return true;
	}

	close(restoreFocus = true) {
		if (!this.activeName) return false;
		const previousOpener = this.opener;
		this.activeName = null;
		this.opener = null;
		this.sync();
		if (restoreFocus && previousOpener?.isConnected !== false) {
			previousOpener?.focus?.();
		}
		return true;
	}

	toggle(name, opener = null) {
		return this.activeName === name
			? this.close()
			: this.open(name, opener);
	}

	sync() {
		const compact = Boolean(this.activeName && this.isCompact());
		this.view.root.dataset.utilityOpen = this.activeName || '';
		for (const [name, panel] of Object.entries(this.view.utilityPanels)) {
			const open = name === this.activeName;
			panel.hidden = !open;
			panel.setAttribute('aria-hidden', String(!open));
			panel.setAttribute('aria-modal', String(open && compact));
		}
		for (const [name, toggle] of Object.entries(this.view.utilityToggles)) {
			toggle.setAttribute('aria-expanded', String(name === this.activeName));
		}
		this.view.utilityBackdrop.hidden = !compact;
		this.setBackgroundInert(compact);
		return { activeName: this.activeName, compact };
	}

	onKeyDown(event) {
		if (!this.activeName) return false;
		if (event.key === 'Escape') {
			event.preventDefault();
			this.close();
			return true;
		}
		return this.isCompact()
			? trapMovieUtilityFocus(this.activePanel(), event)
			: false;
	}

	activePanel() {
		return this.activeName
			? this.view.utilityPanels[this.activeName]
			: null;
	}

	destroy() {
		this.close(false);
		this.setBackgroundInert(false);
	}

	setBackgroundInert(inert) {
		for (const element of [
			this.view.workspace,
			this.view.timeline,
			this.view.inspector,
			this.view.statusBar
		]) {
			if (element) element.inert = Boolean(inert);
		}
	}
}
