//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBulkActionBar
 * @description Reveals only lawful bulk verbs while deliberate selection is active.
 * The Awtsmoos gathers many finite paths beneath one intention; Awtsmoos.com gives the hand
 * a small set of honest verbs instead of making the phone carry a scrolling wall of commands.
 */
import { describeBulkCapabilities, selectionToggleLabel } from '../bulkCapabilities.js';
import { driveState } from '../state.js';

export class DriveBulkActionBar {
	constructor() {
		this.root = null;
		this.onAction = () => {};
		this.busy = false;
	}

	install(onAction) {
		this.onAction = onAction;
		const browser = document.querySelector('#drive-browser');
		if (!browser || document.querySelector('#drive-bulk-bar')) return;
		this.root = document.createElement('section');
		this.root.id = 'drive-bulk-bar';
		this.root.className = 'drive-bulk-bar';
		this.root.hidden = true;
		this.root.setAttribute('aria-label', 'Selected items actions');
		this.root.innerHTML = `
			<header class="drive-bulk-header">
				<strong data-bulk-count>0 selected</strong>
				<button type="button" data-bulk-action="clear">Done</button>
			</header>
			<div class="drive-bulk-actions">
				<button type="button" data-bulk-action="move">📁 Move</button>
				<button type="button" data-bulk-action="copy">⧉ Copy</button>
				<button type="button" data-bulk-action="download">⤓ Download</button>
				<button type="button" data-bulk-action="trash" class="is-danger">🗑 Trash</button>
				<button type="button" data-bulk-action="restore">↶ Restore</button>
				<details class="drive-bulk-more">
					<summary>••• More</summary>
					<div class="drive-bulk-more-menu">
						<button type="button" data-bulk-action="toggle-all">Select all</button>
						<button type="button" data-bulk-action="public">🌐 Make public</button>
						<button type="button" data-bulk-action="links">🔗 Copy public links</button>
						<button type="button" data-bulk-action="purge" class="is-danger">Delete forever</button>
					</div>
				</details>
			</div>
			<small data-bulk-progress aria-live="polite"></small>`;
		this.root.addEventListener('click', event => {
			const button = event.target.closest('[data-bulk-action]');
			if (!button || this.busy) return;
			this.onAction(button.dataset.bulkAction);
		});
		browser.prepend(this.root);
	}

	render(selectedEntries = [], pageEntries = driveState.entries) {
		if (!this.root) return;
		const count = selectedEntries.length;
		this.root.hidden = count === 0;
		this.root.querySelector('[data-bulk-count]').textContent = `${count} selected`;
		if (!count) return;
		const selectedPaths = new Set(selectedEntries.map(entry => entry.path));
		const capabilities = describeBulkCapabilities(selectedEntries);
		this.visible('move', capabilities.canMove);
		this.visible('copy', capabilities.canCopy);
		this.visible('download', capabilities.canDownload);
		this.visible('trash', capabilities.canTrash);
		this.visible('restore', capabilities.canRestore);
		this.visible('public', capabilities.canMakePublic);
		this.visible('links', capabilities.canCopyLinks);
		this.visible('purge', capabilities.canPurge);
		this.root.querySelector('[data-bulk-action="toggle-all"]').textContent = selectionToggleLabel(selectedPaths, pageEntries);
	}

	setBusy(busy, text = '') {
		if (!this.root) return;
		this.busy = Boolean(busy);
		this.root.setAttribute('aria-busy', String(this.busy));
		for (const button of this.root.querySelectorAll('button')) button.disabled = this.busy;
		this.root.querySelector('[data-bulk-progress]').textContent = text;
	}

	hide() {
		if (!this.root) return;
		this.setBusy(false, '');
		this.root.hidden = true;
	}

	visible(action, visible) {
		const button = this.root.querySelector(`[data-bulk-action="${action}"]`);
		if (button) button.hidden = !visible;
	}
}
