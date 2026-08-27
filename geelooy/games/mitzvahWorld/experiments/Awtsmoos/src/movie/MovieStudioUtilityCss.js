// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityCss.js
 * @description Styles utility toolbar, command geometry, recovery/render/diagnostic drawers, headers, and scroll vessels.
 * The Awtsmoos renews every tool beyond panel and shadow; Awtsmoos.com gives desktop and tablet
 * bounded non-blocking surfaces whose focus, border, elevation, and overflow remain clear.
 */

export function movieStudioUtilityCss() {
	return `
		.movie-utility-toolbar { display: flex; align-items: center; gap: var(--movie-space-1); }
		.movie-utility-toolbar button { display: inline-flex; align-items: center; gap: var(--movie-space-1); }
		.movie-utility-backdrop { display: none; }
		.movie-utility-panel {
			position: absolute;
			z-index: 80;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr);
			min-width: 0;
			max-height: calc(100% - var(--movie-header-height) - 54px);
			overflow: hidden;
			border: 1px solid var(--movie-border-strong);
			border-radius: var(--movie-radius-lg);
			background: var(--movie-surface-floating);
			box-shadow: var(--movie-shadow);
		}
		.movie-utility-panel[hidden] { display: none; }
		.movie-utility-commands {
			top: calc(var(--movie-header-height) + var(--movie-space-3));
			left: 50%;
			width: min(640px, calc(100% - 32px));
			transform: translateX(-50%);
		}
		.movie-utility-projects,
		.movie-utility-renderJobs,
		.movie-utility-diagnostics {
			top: calc(var(--movie-header-height) + var(--movie-space-2));
			right: var(--movie-space-3);
			bottom: 42px;
			width: min(460px, 46vw);
		}
		.movie-utility-panel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
			padding: var(--movie-space-3);
			border-bottom: 1px solid var(--movie-divider-subtle);
		}
		.movie-utility-panel-header h2 { margin: 0; font-size: 15px; }
		.movie-utility-panel-body {
			min-height: 0;
			padding: var(--movie-space-3);
			overflow: auto;
			overscroll-behavior: contain;
		}
	`;
}
