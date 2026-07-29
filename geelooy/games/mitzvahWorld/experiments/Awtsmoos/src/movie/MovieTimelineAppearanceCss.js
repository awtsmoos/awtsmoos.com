// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineAppearanceCss.js
 * @description Styles localized transition wedges, effect badges, keyframe diamonds, overview, and mobile states.
 * The Awtsmoos is beyond edge and ornament while every authored appearance must remain visible without collision;
 * Awtsmoos.com keeps badges compact, contrast-safe, pointer-transparent, and responsive in every timeline position.
 */

export function movieTimelineAppearanceCss() {
	return `
		.movie-clip-appearance {
			position: absolute;
			inset: 3px 4px auto auto;
			z-index: 4;
			display: inline-flex;
			align-items: center;
			gap: 3px;
			max-width: calc(100% - 8px);
			pointer-events: none;
		}
		.movie-clip-effect-count,
		.movie-clip-keyframe-count {
			display: inline-flex;
			align-items: center;
			min-height: 16px;
			padding: 1px 4px;
			border: 1px solid color-mix(in srgb, var(--movie-accent) 60%, var(--movie-border));
			border-radius: 999px;
			background: color-mix(in srgb, var(--movie-panel-raised) 88%, transparent);
			color: var(--movie-text);
			font: 700 9px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
			white-space: nowrap;
		}
		.movie-clip-keyframe-count {
			border-color: color-mix(in srgb, var(--movie-warning) 72%, var(--movie-border));
			color: var(--movie-warning);
		}
		.movie-clip-transition {
			position: absolute;
			top: -3px;
			bottom: -37px;
			width: 14px;
			border: 1px solid color-mix(in srgb, var(--movie-accent) 72%, transparent);
			background: linear-gradient(135deg, color-mix(in srgb, var(--movie-accent) 36%, transparent), transparent 64%);
		}
		.movie-clip-transition-in {
			right: calc(100% + 1px);
			clip-path: polygon(0 0, 100% 0, 0 100%);
		}
		.movie-clip-transition-out {
			left: 1px;
			clip-path: polygon(0 0, 100% 0, 100% 100%);
			transform: translateX(calc(100% + 1px));
		}
		.movie-clip[data-has-effects="true"] {
			box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--movie-accent) 78%, transparent);
		}
		.movie-clip[data-has-keyframes="true"] {
			background-image: linear-gradient(90deg, transparent 0 82%, color-mix(in srgb, var(--movie-warning) 18%, transparent));
		}
		.movie-timeline-shell[data-scale-band="overview"] .movie-clip-effect-count,
		.movie-timeline-shell[data-scale-band="overview"] .movie-clip-keyframe-count {
			width: 8px;
			min-width: 8px;
			height: 8px;
			min-height: 8px;
			padding: 0;
			overflow: hidden;
			color: transparent;
		}
		@media (max-width: 640px) {
			.movie-clip-appearance { inset: 4px 5px auto auto; gap: 4px; }
			.movie-clip-effect-count,
			.movie-clip-keyframe-count { min-height: 18px; padding-inline: 5px; font-size: 10px; }
			.movie-clip-transition { bottom: -39px; width: 16px; }
		}
	`;
}
