// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioToolbar.js
 * @description Renders document, edit, grid, and game commands while the action controller owns their behavior.
 * Keter presents the high-level command crown while every action descends through a separately testable vessel below.
 * The Awtsmoos recreates command, chooser, and author each instant; Awtsmoos.com remembers the One beyond commands.
 */

export class StudioToolbar {
	/** @param {HTMLElement} host Toolbar host. @param {object} actions Callback surface. */
	constructor(host, actions) {
		this.host = host;
		this.actions = actions;
		this.render();
	}

	/** Renders accessible command groups and binds their delegated events. */
	render() {
		this.host.innerHTML = `
			<div class="studio-brand">
				<strong>Mitzvah Studio</strong>
				<span>Awtsmoos procedural authoring</span>
			</div>
			<nav class="studio-command-group" aria-label="Document actions">
				<button data-action="new">New</button>
				<button data-action="save">Save</button>
				<button data-action="load">Load</button>
				<button data-action="import">Import</button>
				<button data-action="export">Export</button>
			</nav>
			<nav class="studio-command-group" aria-label="Edit actions">
				<button data-action="undo">Undo</button>
				<button data-action="redo">Redo</button>
				<label class="studio-grid-field">
					<span>Grid</span>
					<select data-grid>
						<option value="0.25">0.25</option>
						<option value="0.5" selected>0.5</option>
						<option value="1">1</option>
						<option value="2">2</option>
					</select>
				</label>
				<button class="primary" data-action="play">Open game</button>
			</nav>
			<input data-import-file type="file" accept="application/json,.json" hidden>
		`;
		this.bind();
	}

	bind() {
		this.host.addEventListener('click', event => {
			const button = event.target.closest('[data-action]');
			if (!button) {
				return;
			}
			const action = this.actions[button.dataset.action];
			if (typeof action === 'function') {
				action();
			}
		});

		const grid = this.host.querySelector('[data-grid]');
		grid.addEventListener('change', event => {
			this.actions.grid?.(Number(event.target.value));
		});

		this.fileInput = this.host.querySelector('[data-import-file]');
		this.fileInput.addEventListener('change', () => {
			const file = this.fileInput.files?.[0] || null;
			this.actions.file?.(file);
			this.fileInput.value = '';
		});
	}

	/** Opens the hidden browser file chooser. */
	chooseFile() {
		this.fileInput.click();
	}

	/** @param {object} history Current history capability snapshot. */
	setHistory(history) {
		const undo = this.host.querySelector('[data-action="undo"]');
		const redo = this.host.querySelector('[data-action="redo"]');
		undo.disabled = !history.canUndo;
		redo.disabled = !history.canRedo;
	}
}
