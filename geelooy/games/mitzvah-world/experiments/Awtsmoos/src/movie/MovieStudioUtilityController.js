// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityController.js
 * @description Coordinates four utility drawers, complete API parity, shortcuts, and cleanup.
 * The Awtsmoos renews tool and workspace without collision; Awtsmoos.com keeps project browser,
 * command palette, render evidence, diagnostics, API mirror, focus, and backdrop in one lifecycle.
 */

import { MovieStudioApiExplorerController } from './MovieStudioApiExplorerController.js';
import { MovieStudioCommandPalette } from './MovieStudioCommandPalette.js';
import { MovieStudioStatusController } from './MovieStudioStatusController.js';
import { MovieStudioUtilityContent } from './MovieStudioUtilityContent.js';
import { MovieStudioUtilityState } from './MovieStudioUtilityState.js';

const CONTENT_EVENTS = new Set([
	'autosave:saved', 'error', 'history:changed', 'persistence:loaded',
	'persistence:removed', 'persistence:saved', 'project:changed',
	'render:cancelled', 'render:progress', 'render:state', 'selection:changed'
]);

export class MovieStudioUtilityController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.state = new MovieStudioUtilityState(view);
		this.status = new MovieStudioStatusController(session, view);
		this.content = new MovieStudioUtilityContent(session, view);
		this.palette = new MovieStudioCommandPalette(session, view, () => this.close());
		this.apiExplorer = new MovieStudioApiExplorerController(session, view);
		session.apiExplorerController = this.apiExplorer;
		this.disposers = [];
		this.bind();
	}

	bind() {
		for (const [name, toggle] of Object.entries(this.view.utilityToggles)) {
			this.listen(toggle, 'click', () => this.toggle(name, toggle));
		}
		for (const button of this.view.utilityCloseButtons) this.listen(button, 'click', () => this.close());
		this.listen(this.view.utilityBackdrop, 'click', () => this.close());
		this.listen(window, 'resize', () => this.state.sync());
		this.disposers.push(this.session.events.on('*', event => {
			if (CONTENT_EVENTS.has(event.type)) this.refreshActiveContent();
		}));
	}

	toggle(name, opener = null) {
		const opened = this.state.toggle(name, opener);
		if (this.state.activeName) this.refresh(this.state.activeName);
		return opened;
	}

	open(name, opener = null) {
		const opened = this.state.open(name, opener);
		if (opened) this.refresh(name);
		return opened;
	}

	close() {
		return this.state.close();
	}

	refresh(name) {
		if (name === 'projects') return this.session.projectBrowserController?.refresh?.();
		if (name === 'commands') return this.palette.render(this.view.commandSearch?.value || '');
		if (name === 'diagnostics') {
			this.content.refresh(name);
			return this.apiExplorer.render();
		}
		return this.content.refresh(name);
	}

	refreshActiveContent() {
		if (this.state.activeName) this.refresh(this.state.activeName);
	}

	onKeyDown(event) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			this.open('commands', this.view.utilityToggles.commands);
			return true;
		}
		if (this.state.onKeyDown(event)) return true;
		if (event.key === 'Enter' && document.activeElement === this.view.commandSearch && this.state.activeName === 'commands') {
			event.preventDefault();
			this.palette.executeFirst();
			return true;
		}
		return false;
	}

	destroy() {
		this.apiExplorer.destroy();
		this.palette.destroy();
		this.content.destroy();
		this.status.destroy();
		this.state.destroy();
		for (const dispose of this.disposers.splice(0)) dispose?.();
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.disposers.push(() => target?.removeEventListener?.(type, listener));
	}
}
