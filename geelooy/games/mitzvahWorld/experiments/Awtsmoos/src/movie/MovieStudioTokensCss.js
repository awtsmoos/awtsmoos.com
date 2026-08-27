// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTokensCss.js
 * @description Defines semantic surfaces, density geometry, track colors, and shared studio tokens.
 * The Awtsmoos renews each shade and measure without division; Awtsmoos.com gathers those
 * sparks into named vessels so themes, tracks, panes, and controls differ without losing unity.
 */

export function movieStudioTokensCss() {
	return `
		.Awtsmoos-movie-studio {
			--movie-bg-deep: #070a10;
			--movie-bg: #0b1018;
			--movie-panel: #111925;
			--movie-panel-raised: #182333;
			--movie-panel-hover: #202e41;
			--movie-surface-canvas: #030508;
			--movie-surface-toolbar: #0b1018;
			--movie-surface-inspector: #111925;
			--movie-surface-floating: #182333;
			--movie-surface-track-even: #0e1622;
			--movie-surface-track-odd: #101a28;
			--movie-text: #f2f6fb;
			--movie-text-muted: #9babbe;
			--movie-border: #2b3a4e;
			--movie-border-strong: #415775;
			--movie-divider-subtle: #243247;
			--movie-divider-strong: #526c91;
			--movie-accent: #62d8b3;
			--movie-accent-strong: #8ff0d1;
			--movie-accent-ink: #052018;
			--movie-danger: #ff7d86;
			--movie-warning: #ffc76a;
			--movie-success: #75e2aa;
			--movie-focus: #b6ffe8;
			--movie-ruler: #162235;
			--movie-track: #0e1622;
			--movie-playhead: #ffcf5f;
			--movie-track-actor: #9d7cff;
			--movie-track-audio: #54c889;
			--movie-track-camera: #5b9dff;
			--movie-track-crowd: #c77dff;
			--movie-track-dialogue: #f3b95f;
			--movie-track-door: #ff8e5b;
			--movie-track-event: #f0669a;
			--movie-track-scene: #4fc9c1;
			--movie-track-sequence: #8a9bb5;
			--movie-shadow: 0 18px 48px rgb(0 0 0 / 0.34);
			--movie-space-1: 4px;
			--movie-space-2: 8px;
			--movie-space-3: 12px;
			--movie-space-4: 16px;
			--movie-space-5: 24px;
			--movie-radius-sm: 6px;
			--movie-radius: 10px;
			--movie-radius-lg: 16px;
			--movie-control-height: 40px;
			--movie-touch-height: 44px;
			--movie-header-height: 58px;
			--movie-track-height: 52px;
			--movie-clip-height: 36px;
			--movie-clip-offset: 8px;
			--movie-trim-width: 12px;
			--movie-splitter-size: 8px;
			--movie-timeline-height: 340px;
			--movie-track-header-width: 148px;
			--movie-inspector-width: 340px;
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
