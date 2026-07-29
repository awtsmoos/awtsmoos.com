// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityMarkup.js
 * @description Provides semantic compact menus, status facts, backdrop, command, render, and diagnostic surfaces.
 * The Awtsmoos renews hidden and revealed tools through one source; Awtsmoos.com gives
 * desktop drawers and mobile sheets names, focus doors, live facts, and retractable bounded bodies.
 */

export function movieStudioUtilityToolbarMarkup() {
	return `
		<nav class="movie-utility-toolbar" aria-label="Studio menus">
			<button data-utility-toggle="commands" aria-controls="movie-command-palette" aria-expanded="false" aria-label="Open command palette" title="Commands (Ctrl or Command + K)">
				<span aria-hidden="true">⌘</span><span class="movie-secondary-label">Commands</span>
			</button>
			<button data-utility-toggle="renderJobs" aria-controls="movie-render-jobs-panel" aria-expanded="false" aria-label="Open render jobs" title="Render jobs">
				<span aria-hidden="true">▤</span><span class="movie-secondary-label">Jobs</span>
			</button>
			<button data-utility-toggle="diagnostics" aria-controls="movie-diagnostics-panel" aria-expanded="false" aria-label="Open diagnostics" title="Diagnostics">
				<span aria-hidden="true">◇</span><span class="movie-secondary-label">Diagnostics</span>
			</button>
		</nav>
	`;
}

export function movieStudioStatusBarMarkup() {
	return `
		<footer class="movie-studio-status-bar" data-status-bar aria-label="Studio status" aria-live="polite" aria-atomic="false">
			<span data-status-selection>0 selected</span>
			<span data-status-snapping>Snapping on</span>
			<span data-status-autosave>Autosave off</span>
			<span data-status-render>Render idle</span>
			<span data-status-instance>Studio</span>
			<span data-status-revision>Revision 0</span>
		</footer>
	`;
}

export function movieStudioUtilitySurfacesMarkup() {
	return `
		<div class="movie-utility-backdrop" data-utility-backdrop hidden></div>
		${utilityPanelMarkup('commands', 'movie-command-palette', 'Command palette', `<label class="movie-command-search"><span class="movie-sr-only">Search commands</span><input data-command-search type="search" autocomplete="off" enterkeyhint="go" placeholder="Search commands…"></label><output data-command-count aria-live="polite"></output><div class="movie-command-list" data-command-list role="listbox" aria-label="Available commands"></div>`)}
		${utilityPanelMarkup('renderJobs', 'movie-render-jobs-panel', 'Render jobs', '<div class="movie-utility-list" data-render-jobs-list aria-live="polite"></div>')}
		${utilityPanelMarkup('diagnostics', 'movie-diagnostics-panel', 'Diagnostics', '<pre class="movie-diagnostics-output" data-diagnostics-output tabindex="0" aria-label="Serializable studio diagnostics"></pre>')}
	`;
}

function utilityPanelMarkup(name, id, title, body) {
	return `
		<section class="movie-utility-panel movie-utility-${name}" data-utility-panel="${name}" id="${id}" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="${id}-title" tabindex="-1" hidden>
			<header class="movie-utility-panel-header">
				<h2 id="${id}-title">${title}</h2>
				<button data-utility-close="${name}" aria-label="Close ${title}" title="Close">×</button>
			</header>
			<div class="movie-utility-panel-body">${body}</div>
		</section>
	`;
}
