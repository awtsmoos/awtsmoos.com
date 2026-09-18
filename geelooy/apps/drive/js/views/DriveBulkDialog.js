//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBulkDialog
 * @description Gives Move and Copy one real, count-aware folder-browser destination dialog.
 * The Awtsmoos contains every path without making a person type the path to know it;
 * Awtsmoos.com lets folders become doors, with Up, New folder, and one luminous final commit.
 */
import { DriveFolderChooser } from './DriveFolderChooser.js';
import { renderFolderChooserList } from './DriveFolderChooserList.js';
import { openBulkConfirmation } from './DriveBulkConfirmDialog.js';

export class DriveBulkDialog {
	/** Opens a server-backed destination browser and resolves one canonical folder path. */
	openTransfer(operation, startPath = '', validateDestination = () => {}) {
		const verb = operation === 'copy' ? 'Copy' : 'Move';
		const count = Math.max(1, Number(document.body.dataset.driveSelectionCount || 1));
		const dialog = document.createElement('dialog');
		dialog.className = 'drive-bulk-dialog';
		dialog.innerHTML = this.transferMarkup(verb, count);
		document.body.append(dialog);
		const list = dialog.querySelector('[data-folder-list]');
		const location = dialog.querySelector('[data-folder-location]');
		const up = dialog.querySelector('[data-folder-up]');
		const name = dialog.querySelector('[data-folder-name]');
		const create = dialog.querySelector('[data-folder-create]');
		const error = dialog.querySelector('[data-bulk-error]');
		const submit = dialog.querySelector('[data-folder-submit]');
		const chooser = new DriveFolderChooser(state => {
			location.textContent = `📂 ${state.path || 'My Drive'}`;
			up.disabled = !state.path || state.loading;
			create.disabled = state.loading;
			submit.disabled = state.loading;
			error.textContent = state.error || '';
			renderFolderChooserList(list, state, path => this.run(error, () => chooser.enter(path)));
		});
		up.addEventListener('click', () => this.run(error, () => chooser.up()));
		create.addEventListener('click', async () => {
			const folderName = name.value.trim();
			const changed = await this.run(error, () => chooser.createAndEnter(folderName));
			if (changed) name.value = '';
		});
		const result = this.resolveTransfer(dialog, chooser, validateDestination);
		dialog.showModal();
		chooser.open(startPath).catch(reason => {
			error.textContent = reason?.message || String(reason);
		});
		return result;
	}

	confirmTrash(count) {
		return openBulkConfirmation({
			title: `Move ${count} ${count === 1 ? 'item' : 'items'} to trash?`,
			description: 'You can restore trashed items later from Trash.',
			confirmLabel: 'Move to trash'
		});
	}

	confirmPurge(count) {
		return openBulkConfirmation({
			title: `Delete ${count} ${count === 1 ? 'item' : 'items'} forever?`,
			description: 'This permanently removes the selected items and cannot be undone.',
			confirmLabel: 'Delete forever'
		});
	}

	resolveTransfer(dialog, chooser, validateDestination) {
		return new Promise(resolve => {
			const form = dialog.querySelector('form');
			form.addEventListener('submit', event => {
				event.preventDefault();
				try {
					validateDestination(chooser.path);
					dialog.__driveValue = chooser.path;
					dialog.close('confirm');
				} catch (reason) {
					dialog.querySelector('[data-bulk-error]').textContent = reason.message;
				}
			});
			dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close('cancel'));
			dialog.addEventListener('close', () => {
				resolve(dialog.returnValue === 'confirm' ? dialog.__driveValue : null);
				dialog.remove();
			}, { once: true });
		});
	}

	async run(error, task) {
		try {
			error.textContent = '';
			await task();
			return true;
		} catch (reason) {
			error.textContent = reason?.message || String(reason);
			return false;
		}
	}

	transferMarkup(verb, count) {
		const object = count === 1 ? 'item' : `${count} items`;
		const suffix = count > 1 ? ` (${count})` : '';
		return `<form><h2>${verb} ${object}</h2><p>Choose a destination folder.</p>
			<div class="drive-folder-chooser-location"><strong data-folder-location>📂 My Drive</strong><button type="button" data-folder-up>↑ Up</button></div>
			<div class="drive-folder-chooser-list" data-folder-list aria-live="polite"></div>
			<label>New folder here<input data-folder-name placeholder="Folder name" autocomplete="off"></label>
			<button type="button" data-folder-create>＋ Create new folder</button><p data-bulk-error class="drive-bulk-dialog-error"></p>
			<div class="drive-dialog-actions"><button type="button" data-cancel>Cancel</button><button type="submit" data-folder-submit>${verb} here${suffix}</button></div></form>`;
	}
}
