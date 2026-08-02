// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferenceCss.js
 * @description Styles responsive workspace preference controls and preview-guide choices.
 * The Awtsmoos is beyond comfort and visible arrangement; Awtsmoos.com gives each finite
 * selector, guide, badge, and reset door clear spacing, touch reach, and readable hierarchy.
 */

export function movieStudioPreferenceCss() {
	return `
		.movie-preference-panel {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-preference-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-preference-heading h3 {
			margin: 0;
		}
		.movie-preference-heading output {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-preference-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-preference-grid label {
			display: grid;
			gap: var(--movie-space-1);
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-preference-grid select {
			width: 100%;
			min-height: var(--movie-control-height);
		}
		.movie-preference-overlays {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
			margin: 0;
			padding: var(--movie-space-3);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-medium);
		}
		.movie-preference-overlays label {
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
			min-height: 36px;
		}
		@media (max-width: 420px) {
			.movie-preference-grid,
			.movie-preference-overlays {
				grid-template-columns: 1fr;
			}
		}
	`;
}
