// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserCss.js
 * @description Styles the localized project library, recovery cards, controls, and portable JSON surface.
 * The Awtsmoos renews saved and living document alike; Awtsmoos.com keeps every
 * record, timestamp, action, and export readable on desktop drawer and mobile sheet.
 */

export function movieStudioProjectBrowserCss() {
	return `
		.movie-project-browser { display: grid; gap: var(--movie-space-3); }
		.movie-project-browser-controls,
		.movie-project-browser-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--movie-space-2); }
		.movie-project-browser-actions { grid-template-columns: repeat(3, minmax(0, 1fr)); }
		.movie-project-browser label { display: grid; gap: var(--movie-space-1); color: var(--movie-text-muted); font-size: 12px; }
		.movie-project-browser input,
		.movie-project-browser select,
		.movie-project-browser button { width: 100%; min-width: 0; min-height: var(--movie-touch-height); }
		.movie-project-browser > output { color: var(--movie-text-muted); font-size: 11px; }
		.movie-project-browser-list { display: grid; gap: var(--movie-space-2); }
		.movie-project-record { display: grid; gap: var(--movie-space-2); padding: var(--movie-space-3); border: 1px solid var(--movie-divider-subtle); border-radius: var(--movie-radius); background: var(--movie-panel); }
		.movie-project-record header { display: flex; align-items: start; justify-content: space-between; gap: var(--movie-space-2); }
		.movie-project-record small { color: var(--movie-text-muted); }
		.movie-project-record-actions { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--movie-space-1); }
		.movie-project-browser-export-label textarea { min-height: 180px; resize: vertical; font: 11px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; }
		@media (max-width: 720px) {
			.movie-project-browser-controls,
			.movie-project-browser-actions,
			.movie-project-record-actions { grid-template-columns: 1fr; }
		}
	`;
}
