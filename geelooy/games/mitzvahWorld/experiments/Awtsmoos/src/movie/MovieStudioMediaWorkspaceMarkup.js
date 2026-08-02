// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspaceMarkup.js
 * @description Defines media bins, saved searches, source transport, marks, and edit controls.
 * The Awtsmoos is one before source and program divide; Awtsmoos.com gives the editor
 * a visible vessel where assets are found, played, bounded, and placed side by side.
 */

export function movieStudioMediaWorkspaceMarkup() {
	return `
		<section class="movie-media-workspace" data-media-workspace aria-labelledby="movie-media-workspace-title">
			<header class="movie-media-workspace-heading"><h3 id="movie-media-workspace-title">Media &amp; Source Monitor</h3><output data-media-workspace-status aria-live="polite">Media workspace ready.</output></header>
			<div class="movie-media-workspace-filters">
				<label>Search<input type="search" data-media-workspace-query autocomplete="off" placeholder="Label, tag, metadata…"></label>
				<label>Folder<select data-media-workspace-folder></select></label>
				<label>Kind<select data-media-workspace-kind><option value="">All media</option><option value="video">Video</option><option value="audio">Audio</option><option value="image">Image</option></select></label>
				<label class="movie-media-workspace-check"><input type="checkbox" data-media-workspace-recursive>Include subfolders</label>
			</div>
			<div class="movie-media-workspace-searches">
				<label>Search name<input data-media-workspace-search-name maxlength="80" autocomplete="off"></label>
				<label>Saved search<select data-media-workspace-saved></select></label>
				<div class="movie-media-workspace-actions"><button data-media-workspace-action="save-search">Save search</button><button data-media-workspace-action="apply-search">Apply</button><button data-media-workspace-action="remove-search">Delete</button></div>
			</div>
			<div class="movie-media-workspace-list" data-media-workspace-list role="listbox" aria-label="Media bin" tabindex="0"></div>
			<section class="movie-source-monitor" aria-labelledby="movie-source-monitor-title">
				<header><h4 id="movie-source-monitor-title">Source Monitor</h4><strong data-media-workspace-source-label>No source selected</strong></header>
				<div class="movie-source-monitor-preview" data-media-workspace-preview></div>
				<div class="movie-source-transport" data-media-workspace-source-transport aria-label="Source playback controls">
					<button data-source-transport-action="back" aria-label="Step source back one frame">◀|</button>
					<button data-source-transport-action="toggle" data-media-workspace-source-toggle aria-pressed="false">Play source</button>
					<button data-source-transport-action="forward" aria-label="Step source forward one frame">|▶</button>
					<output data-media-workspace-preview-time aria-live="polite">0.000s / 0.000s</output>
				</div>
				<output data-media-workspace-range>In 0.000 · Out 0.000</output>
				<div class="movie-source-monitor-fields"><label>In<input type="number" min="0" step="0.001" data-media-workspace-in></label><label>Out<input type="number" min="0" step="0.001" data-media-workspace-out></label><label>Target track<select data-media-workspace-track></select></label><label>Still duration<input type="number" min="0.001" step="0.001" value="5" data-media-workspace-duration></label></div>
				<div class="movie-media-workspace-actions"><button data-media-workspace-action="mark-in">Mark In at player</button><button data-media-workspace-action="mark-out">Mark Out at player</button><button data-media-workspace-action="clear-marks">Clear marks</button><button data-media-workspace-action="insert">Insert at playhead</button><button data-media-workspace-action="overwrite">Overwrite at playhead</button></div>
			</section>
		</section>
	`;
}
