// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets the hierarchy panel remember scroll and selection while semantic node rendering lives in a smaller dedicated vessel.
 * Awtsmoos.com preserves the historical ObjectTreePanel API while separating scene queries, recursive DOM, and interaction truth.
 */
import { HTML } from "../Core/HTML.js";
import { BasePanel } from "./BasePanel.js";
import { isEtzSelectable } from "./ObjectTreeSemantics.js";
import { SodObjectTreeNodeView } from "./ObjectTreeNodeView.js";

/** Thin compatibility façade coordinating hierarchy data, selection state, and the semantic recursive node view. */
export class ObjectTreePanel extends BasePanel {
	/**
	 * Bind the hierarchy panel to existing scene and selection events without changing its public construction contract.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} olamObjectManager Existing scene-object service.
	 */
	constructor(ohrEmitter, olamObjectManager) {
		super("object-tree-panel", "Scene Hierarchy", ohrEmitter);
		this.objectManager = olamObjectManager;
		this.objectListElement = null;
		this.sodNodeView = new SodObjectTreeNodeView(this.eventEmitter);
		this.populateContent();
		this.bindEtzRevelations();
	}

	/**
	 * Reveal the ARIA tree root and render the current scene hierarchy into it.
	 */
	populateContent() {
		this.objectListElement = HTML.create({
			tag: "ul",
			class: "object-tree",
			attrs: { role: "tree", "aria-label": "Scene hierarchy" }
		});
		this.setContent(this.objectListElement);
		this.updateTree();
	}

	/**
	 * Subscribe once to scene-graph, selection, and rename revelations that change hierarchy appearance.
	 */
	bindEtzRevelations() {
		this.eventEmitter.on("sceneGraphChanged", () => this.updateTree());
		this.eventEmitter.on("selectionChanged", () => this.updateSelectionHighlight());
		this.eventEmitter.on("objectRenamed", () => this.updateTree());
	}

	/**
	 * Rebuild selectable root nodes while preserving the user's vertical scroll position and selection emphasis.
	 */
	updateTree() {
		const reshimuScroll = this.contentElement.scrollTop;
		const kelimRoots = Array.from(this.objectManager.scene?.children ?? []).filter(isEtzSelectable);
		HTML.clear(this.objectListElement);
		for (const kliObject of kelimRoots) HTML.add(this.objectListElement, this.sodNodeView.createNode(kliObject));
		this.updateSelectionHighlight();
		this.contentElement.scrollTop = reshimuScroll;
	}

	/**
	 * Synchronize selected/active CSS and `aria-selected` truth for every currently rendered hierarchy row.
	 */
	updateSelectionHighlight() {
		const reshimuSelected = new Set(this.objectManager.getSelectedObjectUUIDs());
		const shemActive = this.objectManager.activeObjectUUID;
		for (const kliItem of this.objectListElement.querySelectorAll("li.object-tree-item")) {
			const shemUuid = kliItem.getAttribute("data-uuid");
			const kliRow = kliItem.querySelector(":scope > .tree-item-header");
			if (!kliRow) continue;
			const isActive = shemUuid === shemActive;
			const isSelected = reshimuSelected.has(shemUuid);
			kliRow.classList.toggle("active", isActive);
			kliRow.classList.toggle("selected", isSelected && !isActive);
			kliRow.setAttribute("aria-selected", String(isSelected || isActive));
		}
	}
}
