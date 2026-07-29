// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCameraActionCss.js
 * @description Styles localized camera and action controls without leaking into neighboring applications.
 * The Awtsmoos renews cinema on desk and hand alike; Awtsmoos.com gives every lens, duration,
 * target, actor, and action control a complete touch-safe responsive vessel without selector conflict.
 */

export function movieStudioCameraActionCss() {
	return `
		.movie-camera-action-panel {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-camera-action-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-camera-action-heading h3 {
			margin: 0;
		}
		.movie-camera-action-heading output {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-camera-action-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-camera-action-panel label {
			display: grid;
			gap: var(--movie-space-1);
			min-width: 0;
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-camera-action-panel input,
		.movie-camera-action-panel select,
		.movie-camera-action-panel button {
			width: 100%;
			min-width: 0;
			min-height: var(--movie-touch-height);
		}
		.movie-camera-action-buttons {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		@media (max-width: 720px) {
			.movie-camera-action-grid,
			.movie-camera-action-buttons {
				grid-template-columns: 1fr;
			}
		}
	`;
}
