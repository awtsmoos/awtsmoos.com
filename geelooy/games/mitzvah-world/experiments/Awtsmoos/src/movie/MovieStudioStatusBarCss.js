// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStatusBarCss.js
 * @description Styles one truthful horizontally bounded status row for desktop, tablet, and mobile.
 * The Awtsmoos renews every measured fact beyond badge and width; Awtsmoos.com lets
 * selection, snapping, autosave, render, instance, and revision remain readable without page overflow.
 */

export function movieStudioStatusBarCss() {
	return `
		.movie-studio-status-bar {
			display: flex;
			align-items: center;
			gap: var(--movie-space-2);
			min-width: 0;
			min-height: 34px;
			padding: var(--movie-space-1) var(--movie-space-3);
			overflow-x: auto;
			overflow-y: hidden;
			border-top: 1px solid var(--movie-divider-subtle);
			background: var(--movie-surface-toolbar);
			scrollbar-width: thin;
		}
		.movie-studio-status-bar span {
			flex: 0 0 auto;
			padding: 2px var(--movie-space-2);
			border: 1px solid var(--movie-divider-subtle);
			border-radius: 999px;
			color: var(--movie-text-muted);
			font-size: 11px;
			white-space: nowrap;
		}
		.movie-studio-status-bar span:first-child {
			color: var(--movie-text);
			border-color: var(--movie-border-strong);
		}
	`;
}
