// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTokensCss.js
 * @description Defines the complete semantic visual language for the MitzvahWorld Movie Studio.
 * The Awtsmoos renews color, measure, rhythm, and edge from nothing; Awtsmoos.com names
 * those sparks so every monitor, track, inspector, button, and mobile sheet shares one truth.
 */

export function movieStudioTokensCss() {
	return `
		.Awtsmoos-movie-studio {
			--movie-bg-deep: #05070b;
			--movie-bg: #090e16;
			--movie-panel: #101923;
			--movie-panel-raised: #172434;
			--movie-panel-hover: #203248;
			--movie-panel-glass: rgb(15 24 35 / .94);
			--movie-surface-canvas: #020407;
			--movie-surface-toolbar: #0a1018;
			--movie-surface-inspector: #101923;
			--movie-surface-floating: #18283a;
			--movie-surface-track-even: #0c1520;
			--movie-surface-track-odd: #101a27;
			--movie-text: #f4f8fc;
			--movie-text-muted: #a8b7ca;
			--movie-text-subtle: #788ba3;
			--movie-border: #293b51;
			--movie-border-strong: #47617e;
			--movie-divider-subtle: #203147;
			--movie-divider-strong: #5e789b;
			--movie-accent: #60ddb2;
			--movie-accent-strong: #9af2d5;
			--movie-accent-ink: #041d15;
			--movie-selection: #b5ffe9;
			--movie-selection-soft: rgb(96 221 178 / .19);
			--movie-danger: #ff808c;
			--movie-warning: #ffcd70;
			--movie-success: #7ae2ad;
			--movie-focus: #c4ffed;
			--movie-ruler: #132034;
			--movie-track: #0d1723;
			--movie-playhead: #ffd262;
			--movie-track-actor: #a88cff;
			--movie-track-audio: #58d094;
			--movie-track-camera: #67a6ff;
			--movie-track-crowd: #cd86ff;
			--movie-track-dialogue: #f5bd69;
			--movie-track-door: #ff9668;
			--movie-track-event: #f274a5;
			--movie-track-scene: #55cdc5;
			--movie-track-sequence: #94a8c4;
			--movie-shadow-sm: 0 5px 16px rgb(0 0 0 / .24);
			--movie-shadow: 0 18px 52px rgb(0 0 0 / .42);
			--movie-shadow-lg: 0 30px 80px rgb(0 0 0 / .58);
			--movie-space-1: 4px;
			--movie-space-2: 8px;
			--movie-space-3: 12px;
			--movie-space-4: 16px;
			--movie-space-5: 24px;
			--movie-space-6: 32px;
			--movie-radius-sm: 6px;
			--movie-radius: 10px;
			--movie-radius-lg: 16px;
			--movie-radius-xl: 22px;
			--movie-control-height: 38px;
			--movie-touch-height: 46px;
			--movie-header-height: 60px;
			--movie-program-header-height: 42px;
			--movie-ruler-height: 32px;
			--movie-track-height: 54px;
			--movie-clip-height: 38px;
			--movie-clip-offset: 8px;
			--movie-trim-width: 14px;
			--movie-splitter-size: 8px;
			--movie-timeline-height: 360px;
			--movie-track-header-width: 172px;
			--movie-inspector-width: 360px;
			--movie-transition-fast: 90ms;
			--movie-transition: 170ms;
			--movie-safe-top: env(safe-area-inset-top, 0px);
			--movie-safe-right: env(safe-area-inset-right, 0px);
			--movie-safe-bottom: env(safe-area-inset-bottom, 0px);
			--movie-safe-left: env(safe-area-inset-left, 0px);
			color: var(--movie-text);
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			font-size: 14px;
			line-height: 1.45;
			color-scheme: dark;
		}
	`;
}
