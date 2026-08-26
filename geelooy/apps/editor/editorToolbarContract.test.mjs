// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Toolbar data, pure policy, action routing, compatibility debt, and façade boundaries remain truthful and extensible;
 * Awtsmoos.com proves every visible control has a real pathway while pure state remains free of hidden browser globals.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { OHR_TOOLBAR_SECTIONS } from "./src/UI/ToolbarManifest.js";
import {
	revealHistoryState,
	revealObjectSelectionState,
	revealTransformState,
	revealEditSelectionState,
	revealAppModeState
} from "./src/UI/ToolbarState.js";

/** Read one Toolbar source module as structural evidence without constructing browser DOM. */
function seferToolbar(shemFile) {
	return readFileSync(new URL(`./src/UI/${shemFile}`, import.meta.url), "utf8");
}

const ohrToolbar = seferToolbar("Toolbar.js");
const ohrActions = seferToolbar("ToolbarActions.js");
const ohrBridge = seferToolbar("ToolbarCompatibilityBridge.js");
const ohrState = seferToolbar("ToolbarState.js");
const ohrManifest = seferToolbar("ToolbarManifest.js");
const ohrSelectionFacts = seferToolbar("ToolbarSelectionFacts.js");

test("toolbar manifest uses stable unique keys and ids", () => {
	const kelimControls = Object.values(OHR_TOOLBAR_SECTIONS).flat().filter(ohr => ohr.kind !== "separator");
	const kelimKeys = kelimControls.map(ohr => ohr.key);
	const kelimIds = kelimControls.map(ohr => ohr.id);
	assert.equal(new Set(kelimKeys).size, kelimKeys.length);
	assert.equal(new Set(kelimIds).size, kelimIds.length);
	assert.ok(kelimControls.some(ohr => ohr.key === "undo"));
	assert.ok(kelimControls.some(ohr => ohr.key === "redo"));
});

test("pure history and selection policy preserves exact operation rules", () => {
	assert.deepEqual(revealHistoryState({ canUndo: true, canRedo: false }), {
		undo: { disabled: false }, redo: { disabled: true }
	});
	const ohrNone = revealObjectSelectionState({ misparSelected: 0, isSingleMesh: false, hasParent: false, isInEditMode: false, canSubdivide: false });
	assert.equal(ohrNone.exportGlb.disabled, true);
	assert.equal(ohrNone.delete.disabled, true);
	const ohrOne = revealObjectSelectionState({ misparSelected: 1, isSingleMesh: true, hasParent: true, isInEditMode: false, canSubdivide: false });
	assert.equal(ohrOne.exportGlb.disabled, false);
	assert.equal(ohrOne.ungroup.disabled, false);
	assert.equal(ohrOne.toggleEditMode.disabled, false);
	const ohrMany = revealObjectSelectionState({ misparSelected: 2, isSingleMesh: false, hasParent: false, isInEditMode: false, canSubdivide: false });
	assert.equal(ohrMany.exportGlb.disabled, true);
	assert.equal(ohrMany.group.disabled, false);
	const ohrEdit = revealObjectSelectionState({ misparSelected: 0, isSingleMesh: false, hasParent: false, isInEditMode: true, canSubdivide: true });
	assert.equal(ohrEdit.toggleEditMode.disabled, false);
	assert.equal(ohrEdit.subdivide.disabled, false);
});

test("transform edit-selection and application modes remain exact historical contracts", () => {
	assert.equal(revealTransformState("rotate").rotate.active, true);
	assert.equal(revealTransformState("rotate").translate.active, false);
	assert.equal(revealEditSelectionState("FACE").editFace.active, true);
	assert.equal(revealEditSelectionState("face").editFace.active, false);
	assert.deepEqual(revealAppModeState("edit"), {
		objectVisible: false, editVisible: true, toggleLabel: "Edit Mode", toggleActive: true
	});
});

test("actions preserve historical events and repair Undo Redo click pathways", () => {
	for (const shemEvent of [
		"toggleEditModeRequest", "createPrimitiveRequest", "loadGLBRequest", "exportGLBRequest",
		"groupSelectedRequest", "ungroupSelectedRequest", "deleteSelectedRequest", "subdivideRequest",
		"setTransformMode", "setEditSelectionMode", "toggleMultipleSelection"
	]) assert.match(ohrActions, new RegExp(shemEvent));
	assert.match(ohrActions, /bindClick\("undo"[\s\S]*\.undo/);
	assert.match(ohrActions, /bindClick\("redo"[\s\S]*\.redo/);
	assert.match(ohrActions, /URL\.createObjectURL/);
	assert.match(ohrActions, /loadGLBRequest/);
});

test("pure Toolbar layers are global-free and legacy reach-through is quarantined", () => {
	assert.doesNotMatch(ohrState + ohrManifest + ohrSelectionFacts, /window\.MWA/);
	assert.match(ohrBridge, /window\?\.MWA|window\.MWA|globalThis\.window\?\.MWA/);
	assert.match(ohrBridge, /editModeManager/);
});

test("Toolbar stays a thin compatibility façade over modular collaborators", () => {
	assert.match(ohrToolbar, /export class Toolbar/);
	assert.match(ohrToolbar, /new TiferesToolbarView/);
	assert.match(ohrToolbar, /new YesodToolbarActions/);
	assert.match(ohrToolbar, /new KesherToolbarCompatibilityBridge/);
	assert.match(ohrToolbar, /gatherSelectionFacts/);
	assert.match(ohrToolbar, /getElement\(\)/);
});
