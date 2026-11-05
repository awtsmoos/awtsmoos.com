// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAuthoring3dCss.js
 * @description Styles every structured and JSON 3D authoring control through localized responsive rules.
 * The Awtsmoos renews wide desk and narrow hand without conflict or omission; Awtsmoos.com
 * gives each field, builder, JSON vessel, action, status, and disclosure a measured readable place.
 */

export function movieStudioAuthoring3dCss() {
	return `
		.movie-authoring3d-panel {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-authoring3d-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-authoring3d-heading h3 {
			margin: 0;
		}
		.movie-authoring3d-heading output {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-authoring3d-grid,
		.movie-authoring3d-builders {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-authoring3d-builders {
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
			background: var(--movie-surface-raised);
		}
		.movie-authoring3d-panel label {
			display: grid;
			gap: var(--movie-space-1);
			min-width: 0;
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-authoring3d-panel input,
		.movie-authoring3d-panel select,
		.movie-authoring3d-panel button {
			width: 100%;
			min-width: 0;
			min-height: var(--movie-touch-height);
		}
		.movie-authoring3d-panel input,
		.movie-authoring3d-panel select {
			padding-inline: var(--movie-space-2);
		}
		.movie-authoring3d-panel textarea {
			width: 100%;
			min-height: 260px;
			padding: var(--movie-space-3);
			resize: vertical;
			font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		}
		.movie-authoring3d-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-authoring3d-help {
			padding: var(--movie-space-2);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
		}
		.movie-authoring3d-help p {
			margin-bottom: 0;
			color: var(--movie-text-muted);
		}
		@media (max-width: 560px) {
			.movie-authoring3d-grid,
			.movie-authoring3d-builders,
			.movie-authoring3d-actions {
				grid-template-columns: 1fr;
			}
			.movie-authoring3d-panel textarea {
				min-height: 200px;
			}
		}
	`;
}
