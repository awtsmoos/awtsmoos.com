// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineSurfacePolishCss.js
 * @description Polishes timeline containment, toolbar, ruler, tracks, labels, and lane grid.
 * The Awtsmoos renews every lane while measured time moves beneath the eye; Awtsmoos.com
 * keeps names near, tools stable, scrolling bounded, and each semantic track visibly distinct.
 */

export function movieTimelineSurfacePolishCss() {
	return `
		.movie-studio-timeline {
			position: relative;
			isolation: isolate;
			border-top: 1px solid var(--movie-border);
			background: linear-gradient(180deg, #101924, #09111a);
			scrollbar-color: var(--movie-border-strong) var(--movie-bg);
		}
		.movie-studio-timeline::-webkit-scrollbar { width: 12px; height: 12px; }
		.movie-studio-timeline::-webkit-scrollbar-thumb {
			border: 3px solid var(--movie-bg);
			border-radius: 999px;
			background: var(--movie-border-strong);
		}
		.movie-timeline-toolbar, .movie-timeline-tools, .movie-timeline-command-bar {
			position: sticky;
			left: 0;
			z-index: 14;
			border-bottom-color: var(--movie-divider-subtle);
			background: rgb(10 17 26 / .97);
			backdrop-filter: blur(12px);
		}
		.movie-timeline-toolbar button, .movie-timeline-command-bar button {
			min-height: 34px;
			padding-inline: 10px;
			font-size: 11px;
		}
		.movie-timeline-ruler {
			position: sticky;
			top: 0;
			z-index: 12;
			min-height: var(--movie-ruler-height);
			border-bottom: 1px solid var(--movie-border-strong);
			background: linear-gradient(180deg, #17263a, var(--movie-ruler));
			box-shadow: 0 5px 12px rgb(0 0 0 / .18);
		}
		.movie-track {
			min-height: var(--movie-track-height);
			border-bottom-color: var(--movie-divider-subtle);
		}
		.movie-track:hover .movie-track-lane { filter: brightness(1.08); }
		.movie-track-label {
			grid-template-columns: minmax(0, 1fr);
			align-content: center;
			gap: 2px;
			border-right: 1px solid var(--movie-border-strong);
			background: linear-gradient(90deg, #111c2a, var(--movie-surface-inspector));
			box-shadow: 5px 0 12px rgb(0 0 0 / .18);
		}
		.movie-track-label::before {
			position: absolute;
			inset: 8px auto 8px 0;
			content: "";
			width: 3px;
			border-radius: 0 999px 999px 0;
			background: var(--movie-clip-color, var(--movie-accent));
		}
		.movie-track-label strong { font-size: 12px; letter-spacing: .01em; }
		.movie-track-label span { color: var(--movie-text-subtle); font-size: 9px; }
		.movie-track-lane {
			background-size: var(--movie-timeline-second-width, 40px) 100%;
			transition: filter var(--movie-transition-fast);
		}
	`;
}
