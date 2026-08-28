// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioToolbar.js
 * @description Renders accessible document/edit/grid/game commands while delegating every behavior to an injected action surface.
 * The Awtsmoos recreates command, chooser, and author each instant while remaining beyond their finite crown;
 * Awtsmoos.com keeps this toolbar descriptive and delegating, so command UI never becomes a second application ground.
 */

export class StudioToolbar {
	/**
	 * @description Creates the toolbar view, stores its action boundary, renders markup, and binds delegated controls once.
	 * @param {HTMLElement} host Toolbar host region supplied by the Studio shell.
	 * @param {Record<string,Function>} actions Document, history, grid, file, and game action callbacks.
	 */
	constructor(host, actions) {
		this.host = host;
		this.actions = actions;
		this.render();
	}

	/**
	 * @description Replaces toolbar markup with the canonical accessible command groups and binds their browser events.
	 * @returns {void} Mutates only the toolbar host and cached file-input reference.
	 */
	render() {
		this.host.innerHTML = `
			<div class="studio-brand"><strong>Mitzvah Studio</strong><span>Awtsmoos procedural authoring</span></div>
			<nav class="studio-command-group" aria-label="Document actions">
				<button data-action="new">New</button><button data-action="save">Save</button>
				<button data-action="load">Load</button><button data-action="import">Import</button>
				<button data-action="export">Export</button>
			</nav>
			<nav class="studio-command-group" aria-label="Edit actions">
				<button data-action="undo">Undo</button><button data-action="redo">Redo</button>
				<label class="studio-grid-field"><span>Grid</span><select data-grid>
					<option value="0.25">0.25</option><option value="0.5" selected>0.5</option>
					<option value="1">1</option><option value="2">2</option>
				</select></label>
				<button class="primary" data-action="play">Open game</button>
			</nav>
			<input data-import-file type="file" accept="application/json,.json" hidden>
		`;
		this.bind();
	}

	/**
	 * @description Binds delegated command clicks, grid changes, and file selection to the injected action boundary.
	 * @returns {void} Adds browser event listeners and caches the hidden file input.
	 */
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
		this.host.querySelector('[data-grid]').addEventListener('change', event => {
			this.actions.grid?.(Number(event.target.value));
		});
		this.fileInput = this.host.querySelector('[data-import-file]');
		this.fileInput.addEventListener('change', () => {
			this.actions.file?.(this.fileInput.files?.[0] || null);
			this.fileInput.value = '';
		});
	}

	/**
	 * @description Opens the browser-native file chooser owned by the hidden import input.
	 * @returns {void} Triggers the input click side effect.
	 */
	chooseFile() {
		this.fileInput.click();
	}

	/**
	 * @description Synchronizes Undo and Redo disabled states with the current reversible-history capability snapshot.
	 * @param {{canUndo:boolean,canRedo:boolean}} history Current history capability snapshot.
	 * @returns {void} Updates only button disabled properties.
	 */
	setHistory(history) {
		this.host.querySelector('[data-action="undo"]').disabled = !history.canUndo;
		this.host.querySelector('[data-action="redo"]').disabled = !history.canRedo;
	}
}
