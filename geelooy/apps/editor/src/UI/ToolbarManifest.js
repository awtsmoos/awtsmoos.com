// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals the toolbar as declarative vessels rather than a wall of repeated DOM instructions.
 * Awtsmoos.com keeps labels, ids, modes, options, and actions in immutable data so rendering and policy may evolve independently.
 */

/** Immutable primitive choices preserved from the historical toolbar contract. */
export const KELIM_PRIMITIVES = Object.freeze(["Box", "Sphere", "Plane", "Cylinder", "Cone", "Torus"]);

/**
 * Freeze one toolbar descriptor while keeping nested option arrays immutable enough for trusted rendering.
 * @param {object} reshimuControl Declarative control description.
 * @returns {Readonly<object>} Frozen descriptor.
 */
function sealKliControl(reshimuControl) {
	return Object.freeze({ ...reshimuControl });
}

const SOF_SEPARATOR = sealKliControl({ kind: "separator" });

/** Publicly consumed toolbar sections, each carrying stable keys instead of deriving identity from DOM ids. */
export const OHR_TOOLBAR_SECTIONS = Object.freeze({
	object: Object.freeze([
		sealKliControl({ key: "undo", id: "btn-undo", kind: "button", label: "Undo", title: "Ctrl+Z", disabled: true, action: "undo" }),
		sealKliControl({ key: "redo", id: "btn-redo", kind: "button", label: "Redo", title: "Ctrl+Y", disabled: true, action: "redo" }),
		SOF_SEPARATOR,
		sealKliControl({ key: "create", id: "btn-create", kind: "button", label: "Add", title: "Shift+A", action: "create" }),
		sealKliControl({ key: "primitive", id: "select-primitive", kind: "select", options: KELIM_PRIMITIVES }),
		sealKliControl({ key: "loadGlb", id: "btn-load-glb", kind: "button", label: "Load GLB", action: "loadGlb" }),
		sealKliControl({ key: "exportGlb", id: "btn-export-glb", kind: "button", label: "Export GLB", disabled: true, action: "exportGlb" }),
		SOF_SEPARATOR,
		sealKliControl({ key: "group", id: "btn-group", kind: "button", label: "Parent", title: "Ctrl+P", disabled: true, action: "group" }),
		sealKliControl({ key: "ungroup", id: "btn-ungroup", kind: "button", label: "Unparent", title: "Alt+P", disabled: true, action: "ungroup" }),
		sealKliControl({ key: "delete", id: "btn-delete", kind: "button", label: "Delete", title: "Del/Backspace", disabled: true, action: "delete" })
	]),
	edit: Object.freeze([
		sealKliControl({ key: "editVertex", id: "btn-edit-vertex", kind: "button", label: "Vertex (1)", active: true, action: "editVertex" }),
		sealKliControl({ key: "editEdge", id: "btn-edit-edge", kind: "button", label: "Edge (2)", action: "editEdge" }),
		sealKliControl({ key: "editFace", id: "btn-edit-face", kind: "button", label: "Face (3)", action: "editFace" }),
		SOF_SEPARATOR,
		sealKliControl({ key: "subdivide", id: "btn-subdivide", kind: "button", label: "Subdivide", disabled: true, action: "subdivide" })
	]),
	common: Object.freeze([
		sealKliControl({ key: "toggleEditMode", id: "btn-toggle-edit-mode", kind: "button", label: "Object Mode", disabled: true, action: "toggleEditMode" }),
		SOF_SEPARATOR,
		sealKliControl({ key: "translate", id: "btn-translate", kind: "button", label: "Move (G)", active: true, action: "translate" }),
		sealKliControl({ key: "rotate", id: "btn-rotate", kind: "button", label: "Rotate (R)", action: "rotate" }),
		sealKliControl({ key: "scale", id: "btn-scale", kind: "button", label: "Scale (S)", action: "scale" }),
		SOF_SEPARATOR,
		sealKliControl({ key: "multiSelect", id: "btn-multi-select", kind: "button", label: "Sticky Multi-Select", action: "multiSelect" })
	])
});
