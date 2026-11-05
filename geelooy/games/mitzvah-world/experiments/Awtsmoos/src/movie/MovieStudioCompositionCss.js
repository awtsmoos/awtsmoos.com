// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionCss.js
 * @description Styles accessible composition, layer, graph, and evaluation authoring surfaces.
 * The Awtsmoos is beyond surface and spacing; Awtsmoos.com gives finite nested canvases
 * clear touch-safe controls, readable hierarchy, and responsive lanes without leaking styles outward.
 */

export function movieStudioCompositionCss() {
	return `
		.movie-composition-workspace {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-composition-workspace > header,
		.movie-composition-layer-editor > h4 {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
			margin: 0;
		}
		.movie-composition-workspace h3,
		.movie-composition-workspace h4 {
			margin: 0;
		}
		.movie-composition-workspace output {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-composition-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-composition-grid label {
			display: grid;
			gap: var(--movie-space-1);
			min-width: 0;
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-composition-grid input,
		.movie-composition-grid select,
		.movie-composition-grid textarea {
			width: 100%;
			min-height: var(--movie-control-height);
			padding-inline: var(--movie-space-2);
		}
		.movie-composition-grid textarea {
			min-height: 72px;
			padding-block: var(--movie-space-2);
			resize: vertical;
		}
		.movie-composition-check {
			grid-template-columns: auto 1fr !important;
			align-items: center;
		}
		.movie-composition-check input {
			width: auto;
		}
		.movie-composition-text {
			grid-column: 1 / -1;
		}
		.movie-composition-actions {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-composition-layer-list {
			display: grid;
			gap: var(--movie-space-2);
			max-height: 240px;
			overflow: auto;
		}
		.movie-composition-layer-card {
			justify-content: flex-start;
			min-height: 44px;
			text-align: left;
			white-space: normal;
		}
		.movie-composition-layer-card[aria-selected="true"] {
			outline: 2px solid var(--movie-accent);
			outline-offset: -2px;
		}
		.movie-composition-layer-editor {
			display: grid;
			gap: var(--movie-space-3);
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-medium);
		}
		.movie-composition-evaluation,
		.movie-composition-empty {
			display: block;
			padding: var(--movie-space-2);
			border-radius: var(--movie-radius-small);
			background: var(--movie-surface-raised);
		}
		@media (max-width: 420px) {
			.movie-composition-grid {
				grid-template-columns: 1fr;
			}
			.movie-composition-text {
				grid-column: auto;
			}
		}
	`;
}
