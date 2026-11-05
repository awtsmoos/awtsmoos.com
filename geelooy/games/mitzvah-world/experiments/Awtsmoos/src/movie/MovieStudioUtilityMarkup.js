// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityMarkup.js
 * @description Builds project recovery, command, render, and combined diagnostic/API parity surfaces.
 * The Awtsmoos renews every utility beneath the living movie; Awtsmoos.com preserves four
 * bounded drawers while recovery, diagnostics, callable methods, and visible actions remain named.
 */

import { movieStudioApiExplorerBodyMarkup } from './MovieStudioApiExplorerMarkup.js';
import { movieStudioProjectBrowserMarkup } from './MovieStudioProjectBrowserMarkup.js';

export function movieStudioUtilityToolbarMarkup() {
	return `
		<div class="movie-utility-toolbar" role="group" aria-label="Studio utility panels">
			<button type="button" data-utility-toggle="projects" aria-controls="movie-projects-panel" aria-expanded="false">Projects</button>
			<button type="button" data-utility-toggle="commands" aria-controls="movie-commands-panel" aria-expanded="false">Commands</button>
			<button type="button" data-utility-toggle="renderJobs" aria-controls="movie-render-jobs-panel" aria-expanded="false">Render jobs</button>
			<button type="button" data-utility-toggle="diagnostics" aria-controls="movie-diagnostics-panel" aria-expanded="false">Diagnostics & API</button>
		</div>
	`;
}

export function movieStudioUtilitySurfacesMarkup() {
	return `
		<div class="movie-utility-backdrop" data-utility-backdrop hidden></div>
		${utilityPanelMarkup('projects', 'movie-projects-panel', 'Projects & Recovery', movieStudioProjectBrowserMarkup())}
		${utilityPanelMarkup('commands', 'movie-commands-panel', 'Command Palette', commandPaletteMarkup())}
		${utilityPanelMarkup('renderJobs', 'movie-render-jobs-panel', 'Render Jobs', '<div data-render-jobs-list></div>')}
		${utilityPanelMarkup('diagnostics', 'movie-diagnostics-panel', 'Diagnostics & API Parity', diagnosticsMarkup())}
	`;
}

export function movieStudioStatusBarMarkup() {
	return `
		<footer class="movie-studio-status-bar" data-status-bar>
			<span data-status-revision>Revision 0</span>
			<span data-status-selection>No selection</span>
			<span data-status-snapping>Snap on</span>
			<span data-status-autosave>Autosave ready</span>
			<span data-status-render>No render jobs</span>
			<span data-status-instance>Instance ready</span>
		</footer>
	`;
}

function utilityPanelMarkup(name, id, title, body) {
	const titleId = `${id}-title`;
	return `
		<section class="movie-utility-panel movie-utility-${name}" id="${id}" data-utility-panel="${name}" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="${titleId}" hidden>
			<header class="movie-utility-panel-header">
				<h2 id="${titleId}">${title}</h2>
				<button type="button" data-utility-close="${name}" aria-label="Close ${title}">×</button>
			</header>
			<div class="movie-utility-panel-body">${body}</div>
		</section>
	`;
}

function commandPaletteMarkup() {
	return `
		<div class="movie-command-palette">
			<label>Search commands <input data-command-search type="search" placeholder="Undo, split, render…" autocomplete="off"></label>
			<output data-command-count aria-live="polite">0 commands</output>
			<div data-command-list role="listbox"></div>
		</div>
	`;
}

function diagnosticsMarkup() {
	return `
		<pre data-diagnostics-output tabindex="0"></pre>
		${movieStudioApiExplorerBodyMarkup()}
	`;
}
