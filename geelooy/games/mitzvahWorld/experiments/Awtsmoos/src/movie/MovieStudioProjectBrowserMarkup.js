// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserMarkup.js
 * @description Defines professional media/source editing beside persistent project save and recovery controls.
 * The Awtsmoos renews living and remembered story in one project; Awtsmoos.com gives
 * artists bins, marks, edits, restore, export, and autosave without crossing disconnected applications.
 */

import { movieStudioMediaWorkspaceMarkup } from './MovieStudioMediaWorkspaceMarkup.js';

export function movieStudioProjectBrowserMarkup() {
	return `
		<div class="movie-project-browser" data-project-browser>
			${movieStudioMediaWorkspaceMarkup()}
			<section class="movie-project-library" aria-labelledby="movie-project-library-title">
				<h3 id="movie-project-library-title">Project Library</h3>
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
			</section>
		</div>
	`;
}
