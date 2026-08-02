// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspaceCss.js
 * @description Styles media bins, delivery health, proxy jobs, and source transport responsively.
 * The Awtsmoos renews every visible boundary; Awtsmoos.com keeps search, health, repair,
 * playback, marks, track targeting, and edit actions readable without hiding any control.
 */

export function movieStudioMediaWorkspaceCss() {
	return `
		.movie-media-workspace { display: grid; gap: var(--movie-space-3); padding-bottom: var(--movie-space-4); border-bottom: 1px solid var(--movie-divider-subtle); }
		.movie-media-workspace-heading,
		.movie-media-operations header,
		.movie-source-monitor header { display: flex; align-items: center; justify-content: space-between; gap: var(--movie-space-2); }
		.movie-media-workspace-heading h3,
		.movie-media-operations h4,
		.movie-source-monitor h4 { margin: 0; }
		.movie-media-workspace-heading output,
		.movie-media-operations output,
		.movie-source-monitor output { color: var(--movie-text-muted); font-size: 11px; }
		.movie-media-workspace-filters,
		.movie-media-workspace-searches,
		.movie-source-monitor-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--movie-space-2); }
		.movie-media-workspace-check { display: flex !important; align-items: center; gap: var(--movie-space-2) !important; }
		.movie-media-workspace-check input { width: auto; }
		.movie-media-workspace-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--movie-space-1); align-items: end; }
		.movie-media-workspace-list { display: grid; gap: var(--movie-space-1); max-height: 240px; overflow: auto; }
		.movie-media-workspace-item { display: grid; gap: 2px; text-align: left; padding: var(--movie-space-2); border: 1px solid var(--movie-divider-subtle); }
		.movie-media-workspace-item[aria-selected="true"] { outline: 2px solid var(--movie-accent); outline-offset: -2px; }
		.movie-media-workspace-item small { color: var(--movie-text-muted); }
		.movie-media-operations,
		.movie-source-monitor { display: grid; gap: var(--movie-space-2); padding: var(--movie-space-3); border: 1px solid var(--movie-divider-subtle); border-radius: var(--movie-radius); background: var(--movie-panel); }
		.movie-media-operations > output { display: block; padding: var(--movie-space-2); background: var(--movie-canvas); border-radius: calc(var(--movie-radius) / 2); }
		.movie-source-monitor-preview { display: grid; place-items: center; min-height: 140px; overflow: hidden; background: var(--movie-canvas); }
		.movie-source-monitor-preview video,
		.movie-source-monitor-preview audio,
		.movie-source-monitor-preview img { width: 100%; max-height: 260px; object-fit: contain; }
		.movie-source-transport { display: grid; grid-template-columns: auto minmax(100px, 1fr) auto minmax(110px, 1fr); gap: var(--movie-space-1); align-items: center; }
		.movie-source-transport output { text-align: right; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
		@media (max-width: 720px) {
			.movie-media-workspace-filters, .movie-media-workspace-searches,
			.movie-source-monitor-fields, .movie-media-workspace-actions,
			.movie-source-transport { grid-template-columns: 1fr; }
		}
	`;
}
