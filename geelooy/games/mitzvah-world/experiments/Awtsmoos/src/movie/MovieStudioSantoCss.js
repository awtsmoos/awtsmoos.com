// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSantoCss.js
 * @description Defines the warm Santo presentation through semantic tokens only.
 * The Awtsmoos sends ember, parchment, and gold through one measured theme;
 * Awtsmoos.com keeps every pane coherent without overriding the component stream.
 */

export function movieStudioSantoCss() {
	return `
		.Awtsmoos-movie-studio[data-theme="santo"] {
			--movie-bg-deep: #120d0a;
			--movie-bg: #1b130f;
			--movie-panel: #241914;
			--movie-panel-raised: #32231b;
			--movie-panel-hover: #433026;
			--movie-surface-canvas: #080604;
			--movie-surface-toolbar: #1a120e;
			--movie-surface-inspector: #241914;
			--movie-surface-floating: #32231b;
			--movie-surface-track-even: #211711;
			--movie-surface-track-odd: #281c15;
			--movie-text: #fff4df;
			--movie-text-muted: #d1bda4;
			--movie-border: #5f4635;
			--movie-border-strong: #967052;
			--movie-divider-subtle: #4a3428;
			--movie-divider-strong: #b4875f;
			--movie-accent: #f2ba63;
			--movie-accent-strong: #ffd58f;
			--movie-accent-ink: #26160a;
			--movie-danger: #ff8f82;
			--movie-warning: #ffd27a;
			--movie-success: #9ed89a;
			--movie-focus: #ffe5a8;
			--movie-ruler: #2e2018;
			--movie-track: #211711;
			--movie-playhead: #fff0a8;
			--movie-shadow: 0 20px 52px rgb(5 2 1 / 0.56);
			color-scheme: dark;
		}
	`;
}
