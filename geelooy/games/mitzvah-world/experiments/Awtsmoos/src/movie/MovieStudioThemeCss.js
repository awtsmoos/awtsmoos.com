// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioThemeCss.js
 * @description Maps serializable theme names onto semantic studio color tokens.
 * The Awtsmoos renews light and darkness without opposition; Awtsmoos.com changes only
 * named finite colors so every component, track, focus ring, and divider remains coherent.
 */

export function movieStudioThemeCss() {
	return `
		.Awtsmoos-movie-studio[data-theme="neutral-dark"] {
			--movie-bg-deep: #0a0b0d;
			--movie-bg: #111317;
			--movie-panel: #181b20;
			--movie-panel-raised: #22262d;
			--movie-panel-hover: #2b3038;
			--movie-surface-canvas: #050607;
			--movie-surface-toolbar: #111317;
			--movie-surface-inspector: #181b20;
			--movie-surface-track-even: #15181d;
			--movie-surface-track-odd: #191d23;
			--movie-accent: #c2c8d0;
			--movie-accent-strong: #f2f4f7;
			--movie-accent-ink: #14171b;
			--movie-focus: #ffffff;
		}
		.Awtsmoos-movie-studio[data-theme="light"] {
			--movie-bg-deep: #e8edf3;
			--movie-bg: #f7f9fc;
			--movie-panel: #ffffff;
			--movie-panel-raised: #eef3f8;
			--movie-panel-hover: #e4ebf3;
			--movie-surface-canvas: #cfd8e4;
			--movie-surface-toolbar: #ffffff;
			--movie-surface-inspector: #ffffff;
			--movie-surface-floating: #ffffff;
			--movie-surface-track-even: #f1f5f9;
			--movie-surface-track-odd: #e8eef5;
			--movie-text: #172130;
			--movie-text-muted: #59697e;
			--movie-border: #c1ccd9;
			--movie-border-strong: #8192a8;
			--movie-divider-subtle: #d4dde8;
			--movie-divider-strong: #6e8199;
			--movie-accent: #087f69;
			--movie-accent-strong: #05604f;
			--movie-accent-ink: #ffffff;
			--movie-focus: #005fcc;
			--movie-ruler: #dce5ef;
			--movie-track: #eef3f8;
			color-scheme: light;
		}
		.Awtsmoos-movie-studio[data-theme="high-contrast"] {
			--movie-bg-deep: #000;
			--movie-bg: #000;
			--movie-panel: #050505;
			--movie-panel-raised: #111;
			--movie-panel-hover: #222;
			--movie-surface-canvas: #000;
			--movie-surface-toolbar: #000;
			--movie-surface-inspector: #000;
			--movie-text: #fff;
			--movie-text-muted: #fff;
			--movie-border: #fff;
			--movie-border-strong: #fff;
			--movie-divider-subtle: #fff;
			--movie-divider-strong: #fff;
			--movie-accent: #00ffbf;
			--movie-accent-strong: #fff;
			--movie-accent-ink: #000;
			--movie-focus: #ffff00;
			--movie-playhead: #ffff00;
		}
	`;
}
