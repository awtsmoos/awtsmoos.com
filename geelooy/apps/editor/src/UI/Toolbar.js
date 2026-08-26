// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers toolbar view, pure state, actions, and compatibility into one thin public façade without mixing their responsibilities.
 * Awtsmoos.com preserves the historical Toolbar API while its inner architecture becomes modular enough for stable infinite expansion.
 */
import { TiferesToolbarView } from "./ToolbarView.js";
import { YesodToolbarActions } from "./ToolbarActions.js";
import { KesherToolbarCompatibilityBridge } from "./ToolbarCompatibilityBridge.js";
import { gatherSelectionFacts } from "./ToolbarSelectionFacts.js";
import {
	revealHistoryState,
	revealObjectSelectionState,
	revealTransformState,
	revealEditSelectionState,
	revealAppModeState
} from "./ToolbarState.js";

/** Historical Toolbar façade coordinating existing Editor events with modular view, action, fact, and state collaborators. */
export class Toolbar {
	/**
	 * Preserve the established constructor contract while composing the new declarative toolbar subsystem.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} chochmahHistoryManager Existing undo/redo service.
	 * @param {object} olamObjectManager Existing scene-object service.
	 */
	constructor(ohrEmitter, chochmahHistoryManager, olamObjectManager) {
		this.eventEmitter = ohrEmitter;
		this.objectManager = olamObjectManager;
		this.isInEditMode = false;
		this.tiferesView = new TiferesToolbarView();
		this.buttons = this.tiferesView.kelimControls;
		this.objectModeToolbar = this.tiferesView.kliObjectSection;
		this.editModeToolbar = this.tiferesView.kliEditSection;
		this.element = this.tiferesView.kliToolbar;
		this.kesherLegacy = new KesherToolbarCompatibilityBridge();
		this.yesodActions = new YesodToolbarActions(ohrEmitter, this.buttons, chochmahHistoryManager);
		this.yesodActions.connect();
		this.bindToolbarRevelations();
	}

	/** Subscribe the façade to historical Editor state revelations while action side effects remain elsewhere. */
	bindToolbarRevelations() {
		this.eventEmitter.on("historyChanged", ohrHistory => this.updateHistoryButtons(ohrHistory));
		this.eventEmitter.on("selectionChanged", kelimIds => this.updateSelectionBasedButtons(kelimIds));
		this.eventEmitter.on("transformModeChanged", shemMode => this.updateTransformButtons(shemMode));
		this.eventEmitter.on("editModeEntered", () => this.setMode("edit"));
		this.eventEmitter.on("editModeExited", () => this.setMode("object"));
		this.eventEmitter.on("editSelectionModeChanged", shemMode => this.updateEditModeButtons(shemMode));
	}

	/**
	 * Apply a pure state patch to indexed controls while synchronizing disabled, active, and aria-pressed truth.
	 * @param {Record<string,{disabled?:boolean,active?:boolean}>} ohrState Pure toolbar state patch.
	 */
	applyState(ohrState) {
		for (const [shemKey, reshimuState] of Object.entries(ohrState ?? {})) {
			const kliControl = this.buttons[shemKey];
			if (!kliControl) continue;
			if (typeof reshimuState.disabled === "boolean") kliControl.disabled = reshimuState.disabled;
			if (typeof reshimuState.active === "boolean") {
				kliControl.classList.toggle("active", reshimuState.active);
				kliControl.setAttribute("aria-pressed", String(reshimuState.active));
			}
		}
	}

	/** Update Undo/Redo button truth from the existing HistoryManager event payload. */
	updateHistoryButtons(ohrHistory) {
		this.applyState(revealHistoryState(ohrHistory));
	}

	/**
	 * Gather explicit scene/edit facts and feed them into pure object-operation policy.
	 * @param {string[]} [kelimSelectedIds] Historical selection UUID payload.
	 */
	updateSelectionBasedButtons(kelimSelectedIds = this.objectManager.getSelectedObjectUUIDs()) {
		const reshimuEdit = this.kesherLegacy.revealEditSelectionFacts();
		const reshimuSelection = gatherSelectionFacts(
			this.objectManager,
			kelimSelectedIds,
			this.isInEditMode,
			reshimuEdit
		);
		this.applyState(revealObjectSelectionState(reshimuSelection));
	}

	/** Synchronize transform-mode active styling from the historical transform event. */
	updateTransformButtons(shemMode) {
		this.applyState(revealTransformState(shemMode));
	}

	/** Synchronize edit-selection active styling from the historical uppercase selection-mode event. */
	updateEditModeButtons(shemMode) {
		this.applyState(revealEditSelectionState(shemMode));
	}

	/**
	 * Switch Object/Edit sections and refresh selection policy while preserving historical mode entry points.
	 * @param {string} shemMode `edit` or `object` from existing Editor events.
	 */
	setMode(shemMode) {
		const ohrMode = revealAppModeState(shemMode);
		this.isInEditMode = ohrMode.editVisible;
		this.objectModeToolbar.style.display = ohrMode.objectVisible ? "flex" : "none";
		this.editModeToolbar.style.display = ohrMode.editVisible ? "flex" : "none";
		this.buttons.toggleEditMode.textContent = ohrMode.toggleLabel;
		this.buttons.toggleEditMode.classList.toggle("active", ohrMode.toggleActive);
		this.buttons.toggleEditMode.setAttribute("aria-pressed", String(ohrMode.toggleActive));
		this.updateSelectionBasedButtons();
	}

	/** @returns {HTMLElement} Complete rendered toolbar vessel used by UIManager. */
	getElement() {
		return this.element;
	}
}
