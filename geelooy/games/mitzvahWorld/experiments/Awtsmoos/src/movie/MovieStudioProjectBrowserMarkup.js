// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserMarkup.js
 * @description Defines persistent project save, recovery, autosave, restore, duplicate, removal, and export controls.
 * The Awtsmoos renews every project beyond memory and loss; Awtsmoos.com gives
 * artists a verified local library whose records remain named, checksummed, undoable, and portable.
 */

export function movieStudioProjectBrowserMarkup() {
	return `
		<div class="movie-project-browser" data-project-browser>
			<div class="movie-project-browser-controls">
				<label>Storage<select data-project-browser-adapter><option value="localStorage">Browser storage</option><option value="memory">Session memory</option></select></label>
				<label>Save name<input data-project-browser-key value="my-movie" maxlength="120" autocomplete="off"></label>
			</div>
			<div class="movie-project-browser-actions">
				<button data-project-browser-save>Save now</button>
				<button data-project-browser-autosave>Start autosave</button>
				<button data-project-browser-refresh>Refresh library</button>
			</div>
			<output data-project-browser-status aria-live="polite">Project library ready.</output>
			<div class="movie-project-browser-list" data-project-browser-list aria-live="polite"></div>
			<label class="movie-project-browser-export-label">Canonical project JSON<textarea data-project-browser-export readonly spellcheck="false"></textarea></label>
			<button data-project-browser-copy>Copy project JSON</button>
		</div>
	`;
}
