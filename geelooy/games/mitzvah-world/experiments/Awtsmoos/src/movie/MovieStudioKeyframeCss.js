// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeCss.js
 * @description Styles selected-clip effect lanes, controls, and interactive keyframe diamonds responsively.
 * The Awtsmoos is beyond line and point while every authored value deserves a visible measured witness;
 * Awtsmoos.com keeps lanes readable, diamonds touchable, and inspector flow localized on desk and hand.
 */

export function movieStudioKeyframeCss() {
	return `
		.movie-keyframe-panel {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-keyframe-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-keyframe-heading h3 { margin: 0; }
		.movie-keyframe-heading output,
		.movie-keyframe-selection {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-keyframe-controls {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-keyframe-controls label {
			display: grid;
			gap: var(--movie-space-1);
			min-width: 0;
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-keyframe-controls input,
		.movie-keyframe-controls select,
		.movie-keyframe-actions button {
			width: 100%;
			min-width: 0;
			min-height: var(--movie-touch-height);
		}
		.movie-keyframe-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-keyframe-lanes { display: grid; gap: var(--movie-space-2); }
		.movie-keyframe-lane {
			display: grid;
			grid-template-columns: 76px minmax(0, 1fr);
			align-items: center;
			gap: var(--movie-space-2);
		}
		.movie-keyframe-lane-track {
			position: relative;
			height: 34px;
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
			background: linear-gradient(90deg, var(--movie-surface-raised), var(--movie-surface));
		}
		.movie-keyframe-diamond {
			position: absolute;
			top: 50%;
			width: 18px;
			height: 18px;
			min-height: 18px;
			padding: 0;
			border: 2px solid var(--movie-warning);
			background: var(--movie-surface);
			transform: translate(-50%, -50%) rotate(45deg);
		}
		.movie-keyframe-diamond[aria-pressed="true"] { background: var(--movie-warning); }
		@media (max-width: 640px) {
			.movie-keyframe-controls,
			.movie-keyframe-actions { grid-template-columns: 1fr; }
			.movie-keyframe-lane { grid-template-columns: 1fr; }
		}
	`;
}
