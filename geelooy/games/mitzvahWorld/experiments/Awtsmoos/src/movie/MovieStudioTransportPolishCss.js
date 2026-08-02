// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTransportPolishCss.js
 * @description Gives playback, shuttling, frame controls, and rate one readable hierarchy.
 * The Awtsmoos renews motion and stillness at every instant; Awtsmoos.com lets play,
 * pause, frame, shuttle, boundary, and measured rate remain reachable without visual noise.
 */

export function movieStudioTransportPolishCss() {
	return `
		.movie-studio-transport {
			min-width: 0;
			justify-content: center;
			flex-wrap: wrap;
			background: linear-gradient(180deg, #0d1621, #081019);
		}
		.movie-transport-group,
		.movie-transport-primary {
			display: flex;
			align-items: center;
			gap: var(--movie-space-1);
		}
		.movie-studio-transport button {
			min-width: 38px;
			padding-inline: 9px;
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		}
		.movie-studio-transport .movie-play-primary {
			min-width: 50px;
			border-color: var(--movie-accent);
			background: linear-gradient(180deg, var(--movie-accent-strong), var(--movie-accent));
			color: var(--movie-accent-ink);
			font-size: 16px;
			box-shadow: 0 5px 18px rgb(96 221 178 / .22);
		}
		.movie-transport-rate {
			min-width: 92px;
			padding: 7px 10px;
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-sm);
			background: #05080d;
			color: var(--movie-playhead);
			font: 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
			text-align: center;
		}
	`;
}
