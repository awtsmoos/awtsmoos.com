// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioScene3dMarkup.js
 * @description Defines object/edit mode, draggable transforms, mesh selection, and raw vertex controls.
 * The Awtsmoos renews whole object and single point through one light; Awtsmoos.com
 * gives artists precise drag and numeric controls while the same truth remains available through the public API.
 */

export function movieStudioScene3dMarkup() {
	return `
		<section class="movie-scene3d-editor" data-scene3d-editor aria-labelledby="movie-scene3d-title">
			<header><h3 id="movie-scene3d-title">3D Scene & Edit Mode</h3><output data-scene3d-status aria-live="polite">Ready</output></header>
			<div class="movie-scene3d-grid">
				<label>Model<select data-scene3d-model></select></label>
				<label>Mode<select data-scene3d-mode><option value="object">Object Mode</option><option value="edit">Edit Mode</option></select></label>
				<label>Mesh index<input data-scene3d-mesh type="number" min="0" step="1" value="0"></label>
				<label>Selected vertices<input data-scene3d-vertices value="0" autocomplete="off"></label>
			</div>
			${transformGizmoMarkup()}
			<fieldset><legend>Position</legend>${vectorInputs('position', 0)}</fieldset>
			<fieldset><legend>Rotation radians</legend>${vectorInputs('rotation', 0)}</fieldset>
			<fieldset><legend>Scale</legend>${vectorInputs('scale', 1)}</fieldset>
			<div class="movie-scene3d-actions">
				<button data-scene3d-apply-transform>Apply transform</button>
				<button data-scene3d-read-vertices>Read vertices</button>
				<button data-scene3d-move-vertices>Move selected vertices</button>
			</div>
			<fieldset><legend>Vertex delta</legend>${vectorInputs('delta', 0)}</fieldset>
			<textarea data-scene3d-output readonly spellcheck="false" aria-label="3D selection and vertex output"></textarea>
		</section>
	`;
}

function transformGizmoMarkup() {
	return `
		<div class="movie-scene3d-gizmo" aria-label="Draggable transform gizmo">
			<div class="movie-scene3d-gizmo-modes" role="group" aria-label="Transform mode">
				<button data-scene3d-gizmo-mode="translate" aria-pressed="true">Move</button>
				<button data-scene3d-gizmo-mode="rotate" aria-pressed="false">Rotate</button>
				<button data-scene3d-gizmo-mode="scale" aria-pressed="false">Scale</button>
			</div>
			<div class="movie-scene3d-gizmo-axes" role="group" aria-label="Drag transform axis">
				<button class="is-x" data-scene3d-gizmo-axis="x" title="Drag X axis">X</button>
				<button class="is-y" data-scene3d-gizmo-axis="y" title="Drag Y axis">Y</button>
				<button class="is-z" data-scene3d-gizmo-axis="z" title="Drag Z axis">Z</button>
			</div>
		</div>
	`;
}

function vectorInputs(prefix, value) {
	return ['x', 'y', 'z'].map(axis => {
		return `<label>${axis.toUpperCase()}<input data-scene3d-${prefix}-${axis} type="number" step="0.01" value="${value}"></label>`;
	}).join('');
}
