// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets the Properties panel reveal selected-object truth while data, codecs, commands, fields, and synchronization live in smaller vessels.
 * Awtsmoos.com preserves the historical PropertiesPanel contract while its inner architecture becomes declarative, testable, and ready to expand.
 */
import { HTML } from "../Core/HTML.js";
import { BasePanel } from "./BasePanel.js";
import { YesodPropertyActions } from "./PropertyActions.js";
import { TiferesPropertyFieldView } from "./PropertyFieldView.js";
import { TiferesPropertyVectorView } from "./PropertyVectorView.js";
import { MalchusPropertyInputSync } from "./PropertyInputSync.js";
import { revealPropertyGroups } from "./PropertyManifest.js";

/** Thin compatibility façade coordinating selected-object property presentation and historical Editor revelations. */
export class PropertiesPanel extends BasePanel {
	/**
	 * Preserve the historical constructor while composing focused property collaborators around existing Editor services.
	 */
	constructor(ohrEmitter, olamObjectManager, netzachTimelineManager, chochmahHistoryManager) {
		super("properties-panel", "Properties", ohrEmitter);
		this.objectManager = olamObjectManager;
		this.timelineManager = netzachTimelineManager;
		this.currentObject = null;
		this.yesodActions = new YesodPropertyActions(
			ohrEmitter,
			olamObjectManager,
			netzachTimelineManager,
			chochmahHistoryManager
		);
		this.tiferesFieldView = new TiferesPropertyFieldView(this.yesodActions);
		this.tiferesVectorView = new TiferesPropertyVectorView(this.yesodActions);
		this.malchusSync = new MalchusPropertyInputSync(this.contentElement);
		this.bindPropertyRevelations();
		this.updateProperties();
	}

	/** Subscribe once to the historical Editor revelations that change visible property or keyframe truth. */
	bindPropertyRevelations() {
		this.eventEmitter.on("selectionChanged", kelimIds => this.updateProperties(kelimIds));
		this.eventEmitter.on("objectTransformed", () => this.syncVisibleFields());
		this.eventEmitter.on("timeChanged", () => this.syncVisibleFields());
		this.eventEmitter.on("timelineDataChanged", () => this.syncKeyframeButtons());
	}

	/**
	 * Resolve exactly one selected object and reveal its descriptor-driven property groups, or a complete empty state.
	 * @param {string[]} [kelimSelectedIds] Historical selection UUID payload.
	 */
	updateProperties(kelimSelectedIds = this.objectManager.getSelectedObjectUUIDs()) {
		const kelimIds = Array.from(kelimSelectedIds ?? []);
		this.currentObject = kelimIds.length === 1
			? this.objectManager.getObjectByUUID(kelimIds[0])
			: null;
		this.revealCurrentObject();
	}

	/** Rebuild the property surface from immutable descriptors while preserving internal scroll position. */
	revealCurrentObject() {
		const reshimuScroll = this.contentElement.scrollTop;
		HTML.clear(this.contentElement);
		if (!this.currentObject) {
			HTML.add(this.contentElement, HTML.create({
				tag: "p",
				class: "property-empty",
				text: "Select one object to reveal its properties."
			}));
			return;
		}
		for (const ohrGroup of revealPropertyGroups(this.currentObject)) {
			const kelimFields = ohrGroup.fields.map(ohrField => this.createField(ohrField));
			HTML.add(this.contentElement, this.tiferesFieldView.createGroup(ohrGroup.title, kelimFields));
		}
		this.contentElement.scrollTop = reshimuScroll;
	}

	/**
	 * Delegate one descriptor to the correct semantic scalar/color or vector/Euler field renderer.
	 * @param {object} ohrField Immutable property descriptor.
	 * @returns {HTMLElement} Rendered field vessel.
	 */
	createField(ohrField) {
		return ohrField.kind === "vector"
			? this.tiferesVectorView.createField(this.currentObject, ohrField)
			: this.tiferesFieldView.createField(this.currentObject, ohrField);
	}

	/** Refresh visible field values and keyframe truth without rebuilding the panel or stealing active-input focus. */
	syncVisibleFields() {
		this.malchusSync.sync(this.currentObject);
		this.syncKeyframeButtons();
	}

	/** Synchronize every visible keyframe button against the current timeline instant using its explicit property-path metadata. */
	syncKeyframeButtons() {
		if (!this.currentObject) return;
		for (const kliButton of this.contentElement.querySelectorAll("button.keyframe-btn[data-path]")) {
			const shemPath = kliButton.getAttribute("data-path");
			const hasKeyframe = this.yesodActions.hasKeyframeNow(this.currentObject, shemPath);
			kliButton.classList.toggle("active", hasKeyframe);
			kliButton.setAttribute("aria-pressed", String(hasKeyframe));
		}
	}
}
