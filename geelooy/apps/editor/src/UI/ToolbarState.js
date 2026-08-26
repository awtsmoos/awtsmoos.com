// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets toolbar truth emerge from pure covenants instead of hiding policy inside DOM callbacks or global services.
 * Awtsmoos.com keeps history, selection, transform, and edit-mode state data-driven so every branch can be verified without the browser.
 */

/**
 * Reveal disabled truth for undo and redo controls from the historical history-state payload.
 * @param {{canUndo?:boolean,canRedo?:boolean}} ohrHistory History capability revelation.
 * @returns {{undo:{disabled:boolean},redo:{disabled:boolean}}} Toolbar state patch.
 */
export function revealHistoryState(ohrHistory = {}) {
	return {
		undo: { disabled: !ohrHistory.canUndo },
		redo: { disabled: !ohrHistory.canRedo }
	};
}

/**
 * Derive object-operation availability from explicit selection and mode facts without reading DOM or global Editor state.
 * @param {{misparSelected:number,isSingleMesh:boolean,hasParent:boolean,isInEditMode:boolean,canSubdivide:boolean}} reshimuSelection Selection facts.
 * @returns {Record<string,{disabled:boolean}>} State patch keyed by stable toolbar control keys.
 */
export function revealObjectSelectionState(reshimuSelection) {
	const hasSelection = reshimuSelection.misparSelected > 0;
	const hasMultiple = reshimuSelection.misparSelected > 1;
	return {
		exportGlb: { disabled: reshimuSelection.misparSelected !== 1 },
		delete: { disabled: !hasSelection },
		group: { disabled: !hasMultiple },
		ungroup: { disabled: !reshimuSelection.hasParent },
		toggleEditMode: { disabled: reshimuSelection.isInEditMode ? false : !reshimuSelection.isSingleMesh },
		subdivide: { disabled: !(reshimuSelection.isInEditMode && reshimuSelection.canSubdivide) }
	};
}

/**
 * Reveal mutually exclusive transform-button active states from a canonical transform mode string.
 * @param {string} shemMode Transform mode such as translate, rotate, or scale.
 * @returns {Record<string,{active:boolean}>} State patch for transform controls.
 */
export function revealTransformState(shemMode) {
	return {
		translate: { active: shemMode === "translate" },
		rotate: { active: shemMode === "rotate" },
		scale: { active: shemMode === "scale" }
	};
}

/**
 * Reveal which edit-selection control is active from the historical uppercase VERTEX/EDGE/FACE event payload.
 * @param {string} shemMode Edit selection mode.
 * @returns {Record<string,{active:boolean}>} State patch for edit-selection controls.
 */
export function revealEditSelectionState(shemMode) {
	return {
		editVertex: { active: shemMode === "VERTEX" },
		editEdge: { active: shemMode === "EDGE" },
		editFace: { active: shemMode === "FACE" }
	};
}

/**
 * Reveal Object/Edit section visibility and the public toggle label from either historical lowercase or canonical uppercase mode names.
 * @param {string} shemMode Editor application mode.
 * @returns {{objectVisible:boolean,editVisible:boolean,toggleLabel:string,toggleActive:boolean}} Mode presentation data.
 */
export function revealAppModeState(shemMode) {
	const isEditOlam = String(shemMode).toUpperCase() === "EDIT";
	return {
		objectVisible: !isEditOlam,
		editVisible: isEditOlam,
		toggleLabel: isEditOlam ? "Edit Mode" : "Object Mode",
		toggleActive: isEditOlam
	};
}

/**
 * Merge one or more toolbar state patches without mutating any source record.
 * @param {...Record<string,object>} kelimPatches Independent state patches.
 * @returns {Record<string,object>} Combined state keyed by toolbar control key.
 */
export function gatherToolbarState(...kelimPatches) {
	const ohrMerged = {};
	for (const kliPatch of kelimPatches) {
		for (const [shemKey, ohrState] of Object.entries(kliPatch ?? {})) {
			ohrMerged[shemKey] = { ...(ohrMerged[shemKey] ?? {}), ...ohrState };
		}
	}
	return ohrMerged;
}
