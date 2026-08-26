// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets hierarchy interaction flow through one small covenant while rendering remains pure and scene policy remains elsewhere.
 * Awtsmoos.com keeps selection, keyboard activation, and disclosure mutation in a focused vessel whose every side effect is named and visible.
 */
import { HTML } from "../Core/HTML.js";
import { revealEtzNode, toggleEtzCollapsed } from "./ObjectTreeSemantics.js";

/** Own user-driven Object Tree mutations while preserving the historical `objectClicked` event contract. */
export class YesodObjectTreeNodeInteraction {
	/**
	 * Bind hierarchy interaction to the existing Editor event emitter and one recursive child-list factory.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {(kelimChildren:object[]) => HTMLElement} shaliachChildrenFactory Recursive child-group factory supplied by the view.
	 */
	constructor(ohrEmitter, shaliachChildrenFactory) {
		this.ohrEmitter = ohrEmitter;
		this.shaliachChildrenFactory = shaliachChildrenFactory;
	}

	/**
	 * Emit the historical object-selection request without coupling hierarchy interaction to ObjectManager.
	 * @param {object} kliObject Scene object selected through pointer or keyboard revelation.
	 */
	revealSelection(kliObject) {
		this.ohrEmitter.emit("objectClicked", kliObject);
	}

	/**
	 * Translate Enter or Space on a focused tree row into the same selection revelation used by pointer activation.
	 * @param {KeyboardEvent} ohrKey Native keyboard event.
	 * @param {object} kliObject Scene object represented by the focused row.
	 */
	receiveSelectionKey(ohrKey, kliObject) {
		if (ohrKey.key !== "Enter" && ohrKey.key !== " ") return;
		ohrKey.preventDefault();
		this.revealSelection(kliObject);
	}

	/**
	 * Flip stored disclosure truth, synchronize ARIA/icon state, and replace only this node's child group.
	 * @param {MouseEvent} ohrClick Native disclosure-button click.
	 * @param {object} kliObject Scene object whose hierarchy state changes.
	 */
	toggleNode(ohrClick, kliObject) {
		ohrClick.stopPropagation();
		const kliButton = ohrClick.currentTarget;
		const kliItem = kliButton.closest("li.object-tree-item");
		const isCollapsed = toggleEtzCollapsed(kliObject);
		const ohrNode = revealEtzNode(kliObject);
		const kliRow = kliItem?.querySelector(":scope > .tree-item-header");
		kliButton.textContent = isCollapsed ? "▸" : "▾";
		kliButton.setAttribute("aria-expanded", String(!isCollapsed));
		kliButton.setAttribute("aria-label", `${isCollapsed ? "Expand" : "Collapse"} ${ohrNode.shem}`);
		kliRow?.setAttribute("aria-expanded", String(!isCollapsed));
		kliItem?.querySelector("ul.object-tree-children")?.remove();
		if (!isCollapsed && kliItem) HTML.add(kliItem, this.shaliachChildrenFactory(ohrNode.kelimChildren));
	}
}
