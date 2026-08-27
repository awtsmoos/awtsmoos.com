//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CommandSheetController
 * @description The Awtsmoos lets one mobile doorway reveal many focused rooms; Awtsmoos.com opens one command sheet at a time, applies trusted themes, and disappears after intention becomes action.
 */
import { applyPresentationTheme } from '../../model/PresentationThemes.js';
import { getSheetDefinition } from './ActionRegistry.js';
import {
	createCommandSheetShell,
	renderCommandSheet
} from './CommandSheetRenderer.js';

export class CommandSheetController {
	constructor(root, store, panels) {
		this.root = root;
		this.store = store;
		this.panels = panels;
		this.mode = '';
		this.snapshot = store.snapshot('command-sheet-initial');
		this.shell = createCommandSheetShell();
		this.root.append(this.shell.backdrop, this.shell.sheet);
		this.root.addEventListener('click', event => this.onClick(event));
		document.addEventListener('keydown', event => this.onKey(event));
		this.unsubscribe = store.subscribe(snapshot => this.onStore(snapshot));
	}

	onClick(event) {
		const opener = event.target.closest('[data-sheet-open]');
		if (opener) {
			this.open(opener.dataset.sheetOpen);
			return;
		}
		if (event.target.closest('[data-sheet-close]')) {
			this.close();
			return;
		}
		const theme = event.target.closest('[data-theme-id]');
		if (theme) {
			this.applyTheme(theme.dataset.themeId);
			this.close();
			return;
		}
		const command = event.target.closest('.command-sheet [data-action], .command-sheet [data-insert]');
		if (command) queueMicrotask(() => this.close());
	}

	onKey(event) {
		if (event.key === 'Escape' && this.mode) {
			event.preventDefault();
			this.close();
		}
	}

	onStore(snapshot) {
		this.snapshot = snapshot;
		if (this.mode) this.render();
	}

	open(mode) {
		this.mode = mode;
		this.panels.closeMobilePanels();
		this.render();
		this.shell.backdrop.hidden = false;
		this.shell.sheet.hidden = false;
		this.root.classList.add('is-command-sheet-open');
		this.updatePressedState();
		this.shell.sheet.querySelector('button')?.focus({ preventScroll: true });
	}

	close() {
		if (!this.mode) return;
		this.mode = '';
		this.shell.backdrop.hidden = true;
		this.shell.sheet.hidden = true;
		this.root.classList.remove('is-command-sheet-open');
		this.updatePressedState();
	}

	render() {
		renderCommandSheet(this.shell, getSheetDefinition(this.mode), this.snapshot);
	}

	applyTheme(themeId) {
		this.store.commit('apply-theme', draft => {
			applyPresentationTheme(draft, themeId);
		});
	}

	updatePressedState() {
		for (const button of this.root.querySelectorAll('[data-sheet-open]')) {
			button.setAttribute('aria-pressed', String(button.dataset.sheetOpen === this.mode));
		}
	}
}
