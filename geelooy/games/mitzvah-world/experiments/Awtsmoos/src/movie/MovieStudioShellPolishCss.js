// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioShellPolishCss.js
 * @description Finishes the editor root, top bar, project identity, toolbar, and controls.
 * The Awtsmoos renews each visible shell around one canonical movie; Awtsmoos.com
 * gives project, command, focus, and action a calm hierarchy without hiding their source.
 */

export function movieStudioShellPolishCss() {
	return `
		.Awtsmoos-movie-studio {
			isolation: isolate;
			background:
				radial-gradient(circle at 38% -15%, rgb(52 109 113 / .18), transparent 34%),
				linear-gradient(145deg, #05070b, var(--movie-bg-deep) 56%, #080d15);
			-webkit-font-smoothing: antialiased;
			text-rendering: optimizeLegibility;
		}
		.Awtsmoos-movie-studio *, .Awtsmoos-movie-studio *::before, .Awtsmoos-movie-studio *::after {
			box-sizing: border-box;
		}
		.movie-studio-bar {
			position: relative;
			z-index: 22;
			gap: var(--movie-space-2);
			min-height: var(--movie-header-height);
			border-bottom-color: var(--movie-border);
			background: linear-gradient(180deg, rgb(15 23 34 / .98), rgb(8 14 22 / .98));
			box-shadow: 0 8px 24px rgb(0 0 0 / .2);
		}
		.movie-studio-identity {
			display: grid;
			min-width: 190px;
			max-width: min(33vw, 420px);
			line-height: 1.15;
		}
		.movie-studio-kicker {
			color: var(--movie-accent);
			font-size: 9px !important;
			font-weight: 800;
			letter-spacing: .14em;
			text-transform: uppercase;
		}
		.movie-studio-brand strong {
			margin-block: 2px;
			font-size: clamp(14px, 1.3vw, 18px);
			letter-spacing: -.015em;
		}
		.movie-studio-primary-actions, .movie-studio-toolbar-scroll {
			display: flex;
			align-items: center;
			gap: var(--movie-space-1);
		}
		.movie-studio-toolbar-scroll {
			min-width: 0;
			overflow-x: auto;
			scrollbar-width: none;
			overscroll-behavior-inline: contain;
		}
		.movie-studio-toolbar-scroll::-webkit-scrollbar { display: none; }
		.Awtsmoos-movie-studio button, .Awtsmoos-movie-studio select, .Awtsmoos-movie-studio input, .Awtsmoos-movie-studio textarea {
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius-sm);
			background: linear-gradient(180deg, var(--movie-panel-raised), var(--movie-panel));
			color: var(--movie-text);
			font: inherit;
		}
		.Awtsmoos-movie-studio button, .Awtsmoos-movie-studio select { min-height: var(--movie-control-height); }
		.Awtsmoos-movie-studio button {
			padding: 0 var(--movie-space-3);
			font-weight: 700;
			cursor: pointer;
			transition: border-color var(--movie-transition-fast), background var(--movie-transition-fast), transform var(--movie-transition-fast);
		}
		.Awtsmoos-movie-studio button:hover:not(:disabled) {
			border-color: var(--movie-border-strong);
			background: var(--movie-panel-hover);
		}
		.Awtsmoos-movie-studio button:active:not(:disabled) { transform: translateY(1px); }
		.Awtsmoos-movie-studio button[aria-pressed="true"], .Awtsmoos-movie-studio button.is-active {
			border-color: var(--movie-accent);
			background: var(--movie-selection-soft);
			color: var(--movie-accent-strong);
		}
	`;
}
