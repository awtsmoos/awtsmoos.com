// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorkspaceStyles.js
 * @description Installs the isolated multi-view workspace styles exactly once per document.
 * The Awtsmoos renews timeline, graph, cast, material, and JSON as windows of one source;
 * Awtsmoos.com gives each window a bounded vessel that scrolls, focuses, and reads with poise.
 */

const MOVIE_WORKSPACE_STYLE_ID = 'movie-workspace-styles';

export function movieWorkspaceStyleText() {
	return `
		.movie-workspace{display:grid;grid-template-rows:auto minmax(0,1fr);min-height:0;height:100%;background:var(--movie-panel,#151923);color:var(--movie-text,#eef2ff)}
		.movie-workspace-tabs{display:flex;gap:4px;overflow-x:auto;padding:8px;border-bottom:1px solid var(--movie-border,#30384b);scrollbar-width:thin}
		.movie-workspace-tabs button{min-height:44px;padding:8px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;white-space:nowrap}
		.movie-workspace-tabs button[aria-selected="true"]{border-color:currentColor;font-weight:700;box-shadow:inset 0 -3px 0 currentColor}
		.movie-workspace-panel{min-width:0;min-height:0;overflow:auto;padding:12px;overscroll-behavior:contain}
		.movie-workspace-list,.movie-workspace-cards,.movie-graph-list{display:grid;gap:10px}
		.movie-workspace-list section,.movie-workspace-cards section,.movie-graph{padding:12px;border:1px solid var(--movie-border,#30384b);border-radius:10px;background:var(--movie-panel-raised,#1c2230)}
		.movie-workspace-list h4,.movie-workspace-cards h4,.movie-graph h4{margin:0 0 8px}
		.movie-workspace-list small{font-weight:400;opacity:.72}
		.movie-workspace-clip{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--movie-border,#30384b)}
		.movie-workspace-clip time{font-variant-numeric:tabular-nums;white-space:nowrap}
		.movie-workspace-cards{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
		.movie-workspace-cards pre{max-width:100%;overflow:auto;white-space:pre-wrap;word-break:break-word}
		.movie-graph-canvas{position:relative;min-height:260px;overflow:auto;border:1px dashed var(--movie-border,#30384b);border-radius:8px}
		.movie-graph-node{position:absolute;left:var(--node-x);top:var(--node-y);display:grid;gap:4px;min-width:112px;min-height:58px;padding:8px;text-align:left}
		.movie-workspace-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
		.movie-workspace-actions button{min-height:44px}
		.movie-workspace-status{min-height:1.5em;margin-bottom:8px}
		.movie-workspace-json{box-sizing:border-box;width:100%;min-height:320px;resize:vertical;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
		.movie-workspace-empty{margin:0;padding:20px;text-align:center;opacity:.72}
		@media (max-width:720px){.movie-workspace-panel{padding:8px}.movie-workspace-clip{align-items:flex-start;flex-direction:column}.movie-workspace-cards{grid-template-columns:1fr}}
	`;
}

export function installMovieWorkspaceStyles(targetDocument = globalThis.document) {
	if (!targetDocument?.head || !targetDocument.createElement) return null;
	const existing = targetDocument.getElementById?.(MOVIE_WORKSPACE_STYLE_ID);
	if (existing) return existing;
	const style = targetDocument.createElement('style');
	style.id = MOVIE_WORKSPACE_STYLE_ID;
	style.textContent = movieWorkspaceStyleText();
	targetDocument.head.append(style);
	return style;
}
