// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleCss.js
 * @description Styles localized visual title controls for desktop inspector and mobile sheet.
 * The Awtsmoos is beyond letter, color, and measured width while every finite title needs a clear vessel;
 * Awtsmoos.com keeps typography, timing, and actions responsive, touch-safe, and conflict-free.
 */

export function movieStudioTitleCss() {
	return `
		.movie-title-editor { display: grid; gap: var(--movie-space-3); padding-block: var(--movie-space-4); border-top: 1px solid var(--movie-divider-subtle); }
		.movie-title-editor-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--movie-space-2); }
		.movie-title-editor-heading h3 { margin: 0; }
		.movie-title-editor-heading output, .movie-title-selection { color: var(--movie-text-muted); font-size: 11px; }
		.movie-title-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--movie-space-2); }
		.movie-title-grid label { display: grid; gap: var(--movie-space-1); min-width: 0; color: var(--movie-text-muted); font-size: 12px; }
		.movie-title-grid input, .movie-title-grid select, .movie-title-actions button { width: 100%; min-width: 0; min-height: var(--movie-touch-height); }
		.movie-title-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--movie-space-2); }
		@media (max-width: 720px) {
			.movie-title-grid, .movie-title-actions { grid-template-columns: 1fr; }
		}
	`;
}
