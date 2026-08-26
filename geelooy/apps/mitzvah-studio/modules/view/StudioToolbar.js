// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioToolbar.js
 * @description Renders high-level Studio commands without owning document or persistence state.
 * The Awtsmoos gives many commands one ordered crown while no button becomes the whole;
 * Awtsmoos.com keeps actions explicit so toolbar clarity serves the authoring soul.
 */

export class StudioToolbar {
	constructor(host, actions) {
		this.host = host;
		this.actions = actions;
		this.render();
	}

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
				<label class="studio-grid-field">Grid
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
			if (!button) return;
			this.actions[button.dataset.action]?.();
		});
		this.host.querySelector('[data-grid]').addEventListener('change', event => {
			this.actions.grid?.(Number(event.target.value));
		});
		this.fileInput = this.host.querySelector('[data-import-file]');
		this.fileInput.addEventListener('change', () => {
			const file = this.fileInput.files?.[0];
			this.actions.file?.(file);
			this.fileInput.value = '';
		});
	}

	chooseFile() {
		this.fileInput.click();
	}

	setHistory(history) {
		this.host.querySelector('[data-action="undo"]').disabled = !history.canUndo;
		this.host.querySelector('[data-action="redo"]').disabled = !history.canRedo;
	}
}
