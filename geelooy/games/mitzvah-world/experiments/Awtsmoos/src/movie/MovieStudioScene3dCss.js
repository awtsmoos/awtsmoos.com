// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioScene3dCss.js
 * @description Styles object/edit mode, draggable transform handles, mesh, and raw vertex controls.
 * The Awtsmoos renews whole form and single point in measured light; Awtsmoos.com
 * keeps dense desktop precision and touch-sized mobile controls within one localized vessel.
 */

export function movieStudioScene3dCss() {
	return `
		.movie-scene3d-editor { display: grid; gap: var(--movie-space-3); padding: var(--movie-space-3); border: 1px solid var(--movie-divider-subtle); border-radius: var(--movie-radius); background: var(--movie-panel); }
		.movie-scene3d-editor header { display: flex; justify-content: space-between; gap: var(--movie-space-2); align-items: center; }
		.movie-scene3d-editor h3 { margin: 0; font-size: 14px; }
		.movie-scene3d-editor output { color: var(--movie-text-muted); font-size: 11px; }
		.movie-scene3d-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--movie-space-2); }
		.movie-scene3d-editor label { display: grid; gap: var(--movie-space-1); color: var(--movie-text-muted); font-size: 11px; }
		.movie-scene3d-editor fieldset { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--movie-space-2); margin: 0; padding: var(--movie-space-2); border: 1px solid var(--movie-divider-subtle); }
		.movie-scene3d-editor legend { padding: 0 var(--movie-space-1); color: var(--movie-text-muted); font-size: 11px; }
		.movie-scene3d-editor input, .movie-scene3d-editor select, .movie-scene3d-editor button { width: 100%; min-width: 0; min-height: var(--movie-touch-height); }
		.movie-scene3d-actions, .movie-scene3d-gizmo-modes, .movie-scene3d-gizmo-axes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--movie-space-2); }
		.movie-scene3d-gizmo { display: grid; gap: var(--movie-space-2); padding: var(--movie-space-2); border: 1px solid var(--movie-divider-subtle); border-radius: var(--movie-radius); background: var(--movie-surface-sunken); }
		.movie-scene3d-gizmo-modes button.is-active { outline: 2px solid var(--movie-accent); outline-offset: -2px; }
		.movie-scene3d-gizmo-axes button { touch-action: none; cursor: ew-resize; font-weight: 800; user-select: none; }
		.movie-scene3d-gizmo-axes button.is-x { border-color: #ef5a5a; }
		.movie-scene3d-gizmo-axes button.is-y { border-color: #57c96f; cursor: ns-resize; }
		.movie-scene3d-gizmo-axes button.is-z { border-color: #5f8df7; }
		.movie-scene3d-gizmo-axes button.is-dragging { transform: scale(0.96); box-shadow: inset 0 0 0 2px currentColor; }
		.movie-scene3d-editor textarea { min-height: 180px; resize: vertical; font: 11px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; }
		@media (max-width: 720px) { .movie-scene3d-grid, .movie-scene3d-actions { grid-template-columns: 1fr; } }
	`;
}
