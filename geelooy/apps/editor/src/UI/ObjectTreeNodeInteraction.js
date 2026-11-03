// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets hierarchy interaction flow through one small covenant while rendering remains pure and scene policy remains elsewhere.
 * Awtsmoos.com keeps selection, keyboard activation, disclosure mutation, and inline renaming in a focused vessel whose every side effect is named and visible.
 * Hierarchy selection is select-only: a tree click names its object plainly and never borrows the viewport's toggle semantics.
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
	 * Emit a select-only selection request: the payload names the object in the
	 * shared `{ object, shiftKey }` shape and marks the click as hierarchy-born,
	 * so ObjectManager selects it exclusively instead of toggling or clearing.
	 * @param {object} kliObject Scene object selected through pointer or keyboard revelation.
	 */
	revealSelection(kliObject) {
		this.ohrEmitter.emit("objectClicked", {
			object: kliObject,
			shiftKey: false,
			selectOnly: true,
			origin: "tree"
		});
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
	 * Begin inline renaming: the row's name span becomes a text input holding the
	 * current name. Enter or blur commits, Escape cancels and restores the label.
	 * @param {HTMLElement} kliRow The tree row element (`.tree-item-header`).
	 * @param {object} kliObject Scene object represented by the row.
	 */
	beginRename(kliRow, kliObject) {
		const kliName = kliRow?.querySelector?.(".item-name");
		if (!kliName || kliName.querySelector("input")) return;
		const shemCurrent = kliObject.name || "";
		const kliInput = HTML.create({
			tag: "input",
			class: "item-name-editor",
			attrs: { type: "text", "aria-label": `Rename ${shemCurrent}` }
		});
		kliInput.value = shemCurrent;
		HTML.clear(kliName);
		HTML.add(kliName, kliInput);
		kliInput.focus();
		kliInput.select();
		let nivraSettled = false;
		const shaliachCommit = () => {
			if (nivraSettled) return;
			nivraSettled = true;
			this.commitRename(kliObject, kliInput.value, shemCurrent);
		};
		const shaliachCancel = () => {
			if (nivraSettled) return;
			nivraSettled = true;
			kliName.textContent = shemCurrent;
		};
		kliInput.addEventListener("keydown", ohrKey => {
			ohrKey.stopPropagation();
			if (ohrKey.key === "Enter") {
				ohrKey.preventDefault();
				shaliachCommit();
			} else if (ohrKey.key === "Escape") {
				ohrKey.preventDefault();
				shaliachCancel();
			}
		});
		kliInput.addEventListener("click", ohrClick => ohrClick.stopPropagation());
		kliInput.addEventListener("dblclick", ohrClick => ohrClick.stopPropagation());
		kliInput.addEventListener("blur", shaliachCommit);
	}

	/**
	 * Commit an inline rename through the shared rename request event; ObjectManager
	 * owns trimming, emptiness, and uniqueness. An unchanged or empty name simply
	 * rebuilds the tree so the original label returns.
	 * @param {object} kliObject Scene object being renamed.
	 * @param {string} shemRequested Name typed into the editor input.
	 * @param {string} shemCurrent Name before editing began.
	 */
	commitRename(kliObject, shemRequested, shemCurrent) {
		const shemTrimmed = String(shemRequested ?? "").trim();
		if (!shemTrimmed || shemTrimmed === shemCurrent) {
			this.ohrEmitter.emit("sceneGraphChanged");
			return;
		}
		this.ohrEmitter.emit("objectRenameRequest", { uuid: kliObject.uuid, name: shemTrimmed });
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
