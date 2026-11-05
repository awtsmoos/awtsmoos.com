// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioDensityCss.js
 * @description Maps compact, comfortable, and touch preferences onto shared editor geometry.
 * The Awtsmoos renews one creative purpose through many bodily scales; Awtsmoos.com
 * changes spacing and targets coherently instead of scattering contradictory viewport exceptions.
 */

export function movieStudioDensityCss() {
	return `
		.Awtsmoos-movie-studio[data-density="compact"] {
			--movie-control-height: 32px;
			--movie-touch-height: 36px;
			--movie-header-height: 50px;
			--movie-track-height: 42px;
			--movie-clip-height: 30px;
			--movie-clip-offset: 6px;
			--movie-trim-width: 10px;
			font-size: 12px;
		}
		.Awtsmoos-movie-studio[data-density="comfortable"] {
			--movie-control-height: 40px;
			--movie-touch-height: 44px;
			--movie-header-height: 58px;
			--movie-track-height: 52px;
			--movie-clip-height: 36px;
			--movie-clip-offset: 8px;
			--movie-trim-width: 12px;
			font-size: 14px;
		}
		.Awtsmoos-movie-studio[data-density="touch"] {
			--movie-control-height: 48px;
			--movie-touch-height: 52px;
			--movie-header-height: 66px;
			--movie-track-height: 64px;
			--movie-clip-height: 46px;
			--movie-clip-offset: 9px;
			--movie-trim-width: 18px;
			font-size: 15px;
		}
		.movie-preference-controls > label {
			display: grid;
			gap: var(--movie-space-1);
			margin-bottom: var(--movie-space-3);
			color: var(--movie-text-muted);
		}
		.movie-overlay-controls {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--movie-space-2);
			margin: var(--movie-space-3) 0;
		}
		.movie-overlay-controls label {
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
			min-height: var(--movie-control-height);
			padding: var(--movie-space-2);
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-sm);
			background: var(--movie-panel-raised);
		}
	`;
}
