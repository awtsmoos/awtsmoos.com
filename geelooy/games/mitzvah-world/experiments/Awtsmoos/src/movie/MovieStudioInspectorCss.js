// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInspectorCss.js
 * @description Styles the current inspector shell, JSON actions, appearance controls, and mobile-safe scrolling.
 * The Awtsmoos hides infinite detail inside a finite pane;
 * Awtsmoos.com gives every label and action a calm and readable lane.
 */

export function movieStudioInspectorCss() {
	return `
		.movie-studio-inspector {
			display: grid;
			grid-template-rows: auto minmax(0, 1fr);
			min-width: 0;
			min-height: 0;
			overflow: hidden;
			border-left: 1px solid var(--movie-border);
			background: var(--movie-surface-inspector);
		}
		.movie-inspector-heading {
			position: relative;
			z-index: 3;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
			min-height: 52px;
			padding: var(--movie-space-2) var(--movie-space-3);
			border-bottom: 1px solid var(--movie-border);
			background: color-mix(in srgb, var(--movie-surface-inspector) 92%, transparent);
			backdrop-filter: blur(12px);
		}
		.movie-inspector-heading button {
			min-width: var(--movie-control-height);
			padding: 0;
		}
		.movie-inspector-body {
			min-height: 0;
			padding: var(--movie-space-3);
			overflow: auto;
			overscroll-behavior: contain;
		}
		.movie-project-json-panel,
		.movie-appearance-panel {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-project-json-panel textarea {
			width: 100%;
			min-height: 180px;
			padding: var(--movie-space-3);
			resize: vertical;
			font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		}
		.movie-project-json-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-appearance-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-appearance-heading h3 {
			margin: 0;
		}
		.movie-appearance-heading output {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-appearance-panel > label,
		.movie-overlay-options label {
			display: grid;
			gap: var(--movie-space-1);
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-appearance-panel select {
			width: 100%;
			min-height: var(--movie-control-height);
			padding-inline: var(--movie-space-2);
		}
		.movie-overlay-options {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-overlay-options label {
			grid-template-columns: auto minmax(0, 1fr);
			align-items: center;
			min-height: var(--movie-control-height);
		}
		@media (max-width: 420px) {
			.movie-project-json-actions,
			.movie-overlay-options {
				grid-template-columns: 1fr;
			}
		}
	`;
}
