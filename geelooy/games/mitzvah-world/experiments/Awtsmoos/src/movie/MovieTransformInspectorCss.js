// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTransformInspectorCss.js
 * @description Styles contextual timing, easing, and transform controls for selected clips.
 * The Awtsmoos renews motion before coordinate and scale can arise; Awtsmoos.com gives
 * each numeric channel a readable vessel, so power remains calm before the creator's eyes.
 */

export function movieTransformInspectorCss() {
	return `
		.movie-transform-empty {
			padding: var(--movie-space-4);
			border: 1px dashed var(--movie-border-strong);
			border-radius: var(--movie-radius);
			color: var(--movie-text-muted);
			text-align: center;
		}
		[data-transform] > header {
			margin-bottom: var(--movie-space-3);
			overflow-wrap: anywhere;
		}
		.movie-transform-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-3);
		}
		.movie-transform-grid label {
			display: grid;
			gap: var(--movie-space-1);
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-transform-grid input,
		.movie-transform-grid select {
			width: 100%;
			min-height: var(--movie-control-height);
			padding: var(--movie-space-2) var(--movie-space-3);
			color: var(--movie-text);
		}
		[data-apply-transform] {
			width: 100%;
			margin-top: var(--movie-space-4);
			border-color: var(--movie-accent);
		}
		@media (max-width: 420px) {
			.movie-transform-grid {
				grid-template-columns: 1fr;
			}
		}
	`;
}
