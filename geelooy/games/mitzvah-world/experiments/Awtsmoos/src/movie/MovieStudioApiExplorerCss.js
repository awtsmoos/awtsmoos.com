// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiExplorerCss.js
 * @description Styles the complete API method and rendered UI action parity Explorer.
 * The Awtsmoos renews machine path and human surface in one light; Awtsmoos.com gives
 * discovery a bounded, searchable, accessible chamber across desktop, tablet, and touch.
 */

export function movieStudioApiExplorerCss() {
	return `
		.movie-api-explorer {
			display: grid;
			gap: var(--movie-space-4);
			min-height: 0;
		}
		.movie-api-explorer-tools {
			position: sticky;
			top: 0;
			z-index: 3;
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: var(--movie-space-2);
			padding: var(--movie-space-2);
			border: 1px solid var(--movie-divider-subtle);
			border-radius: var(--movie-radius);
			background: var(--movie-panel-glass);
			backdrop-filter: blur(12px);
		}
		.movie-api-explorer-tools input {
			width: 100%;
			min-height: var(--movie-control-height);
			padding-inline: var(--movie-space-3);
		}
		.movie-api-parity {
			display: block;
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-warning);
			border-radius: var(--movie-radius);
			background: rgb(255 205 112 / .08);
			color: var(--movie-warning);
			font-weight: 700;
		}
		.movie-api-parity[data-complete="true"] {
			border-color: var(--movie-success);
			background: rgb(122 226 173 / .08);
			color: var(--movie-success);
		}
		.movie-api-methods, .movie-api-actions {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
			gap: var(--movie-space-2);
		}
		.movie-api-method, .movie-api-action {
			min-width: 0;
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-divider-subtle);
			border-radius: var(--movie-radius);
			background: rgb(255 255 255 / .025);
		}
		.movie-api-method summary {
			display: grid;
			gap: 4px;
			cursor: pointer;
		}
		.movie-api-method summary span,
		.movie-api-action span {
			color: var(--movie-text-subtle);
			font-size: 11px;
		}
		.movie-api-method code, .movie-api-action code {
			overflow-wrap: anywhere;
			color: var(--movie-accent-strong);
			font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
		}
		.movie-api-method textarea {
			width: 100%;
			min-height: 76px;
			margin-block: var(--movie-space-2);
			padding: var(--movie-space-2);
			resize: vertical;
			font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
		}
		.movie-api-method output {
			display: block;
			max-height: 180px;
			margin-top: var(--movie-space-2);
			padding: var(--movie-space-2);
			overflow: auto;
			border-radius: var(--movie-radius-sm);
			background: #05080d;
			white-space: pre-wrap;
			font: 10px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
		}
		.movie-api-action {
			display: grid;
			gap: var(--movie-space-1);
		}
		@media (max-width: 640px) {
			.movie-api-explorer-tools { grid-template-columns: 1fr; }
			.movie-api-methods, .movie-api-actions { grid-template-columns: 1fr; }
		}
	`;
}
