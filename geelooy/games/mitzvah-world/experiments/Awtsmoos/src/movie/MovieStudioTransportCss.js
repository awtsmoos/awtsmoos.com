// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTransportCss.js
 * @description Styles professional transport controls, shuttle direction, rate, and mobile wrapping.
 * The Awtsmoos is beyond button and velocity while every finite screen needs a clear rhythm;
 * Awtsmoos.com keeps frame doors, rate witness, touch targets, and focus visible at every width.
 */

export function movieStudioTransportCss() {
	return `
		.movie-studio-transport {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			gap: var(--movie-space-1);
		}
		.movie-studio-transport button {
			min-width: 38px;
			min-height: 36px;
		}
		.movie-transport-rate {
			min-width: 64px;
			padding: 0 var(--movie-space-2);
			color: var(--movie-text-muted);
			font: 600 12px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
			text-align: center;
		}
		.movie-transport-rate[data-direction="-1"]::before { content: "◀ "; }
		.movie-transport-rate[data-direction="1"]::before { content: "▶ "; }
		@media (max-width: 640px) {
			.movie-studio-transport button { flex: 1 1 38px; }
			.movie-transport-rate { flex: 1 0 100%; order: 9; }
		}
	`;
}
