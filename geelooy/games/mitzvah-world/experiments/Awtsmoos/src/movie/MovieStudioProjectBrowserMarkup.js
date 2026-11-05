// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserMarkup.js
 * @description Defines media/source editing, durable project storage, canonical export, and compatible JSON replacement controls.
 * The Awtsmoos renews living and remembered story in one project; Awtsmoos.com gives
 * artists bins, marks, restore, export, and guarded import without disconnected applications.
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
				<button data-project-browser-copy type="button">Copy project JSON</button>
			</section>
			<section class="movie-project-json-replacement" aria-labelledby="movie-project-json-title">
				<h3 id="movie-project-json-title">Import or Replace Project</h3>
				<label>Complete project JSON<textarea data-project-json spellcheck="false" aria-describedby="movie-project-json-help"></textarea></label>
				<p id="movie-project-json-help">Applying JSON replaces the authored project through the recoverable project boundary.</p>
				<button data-apply-json type="button">Apply project JSON</button>
			</section>
		</div>
	`;
}
