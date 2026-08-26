// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each scene-tree node a semantic row, disclosure vessel, and recursive child world without owning interaction mutation.
 * Awtsmoos.com keeps hierarchy rendering focused and beautiful while Yesod carries side effects and pure semantics carry meaning.
 */
import { HTML } from "../Core/HTML.js";
import { revealEtzNode } from "./ObjectTreeSemantics.js";
import { YesodObjectTreeNodeInteraction } from "./ObjectTreeNodeInteraction.js";

/** Render recursive hierarchy structure while delegating all mutation and event emission to a focused interaction vessel. */
export class SodObjectTreeNodeView {
	/**
	 * Bind the semantic tree view to the existing Editor event emitter through one interaction collaborator.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 */
	constructor(ohrEmitter) {
		this.yesodInteraction = new YesodObjectTreeNodeInteraction(
			ohrEmitter,
			kelimChildren => this.createChildrenList(kelimChildren)
		);
	}

	/**
	 * Render one scene object as a list item with semantic row, disclosure control, and recursively revealed children.
	 * @param {object} kliObject Scene object represented by this node.
	 * @returns {HTMLLIElement} Rendered hierarchy node vessel.
	 */
	createNode(kliObject) {
		const ohrNode = revealEtzNode(kliObject);
		const kliToggle = this.createToggle(ohrNode);
		const kliRow = this.createSelectionRow(ohrNode, kliToggle);
		const kliItem = HTML.create({
			tag: "li",
			class: "object-tree-item",
			attrs: { "data-uuid": ohrNode.uuid, role: "none" },
			children: [kliRow]
		});
		if (ohrNode.hasChildren && !ohrNode.isCollapsed) {
			HTML.add(kliItem, this.createChildrenList(ohrNode.kelimChildren));
		}
		return kliItem;
	}

	/**
	 * Create the focusable ARIA tree row used equally by pointer and keyboard selection pathways.
	 * @param {ReturnType<revealEtzNode>} ohrNode Pure hierarchy descriptor.
	 * @param {HTMLElement} kliToggle Disclosure control or placeholder.
	 * @returns {HTMLElement} Semantic treeitem row.
	 */
	createSelectionRow(ohrNode, kliToggle) {
		const reshimuAttrs = { role: "treeitem", tabindex: "0", "aria-selected": "false" };
		if (ohrNode.hasChildren) reshimuAttrs["aria-expanded"] = String(!ohrNode.isCollapsed);
		return HTML.create({
			tag: "div",
			class: "tree-item-header",
			attrs: reshimuAttrs,
			children: [
				kliToggle,
				{ tag: "span", class: "icon", text: ohrNode.icon, attrs: { "aria-hidden": "true" } },
				{ tag: "span", class: "item-name", text: ohrNode.shem }
			],
			on: {
				click: () => this.yesodInteraction.revealSelection(ohrNode.kliObject),
				keydown: ohrKey => this.yesodInteraction.receiveSelectionKey(ohrKey, ohrNode.kliObject)
			}
		});
	}

	/**
	 * Create a native disclosure button when selectable children exist, otherwise a layout placeholder with no interactive pretense.
	 * @param {ReturnType<revealEtzNode>} ohrNode Pure hierarchy descriptor.
	 * @returns {HTMLElement} Disclosure control or placeholder.
	 */
	createToggle(ohrNode) {
		if (!ohrNode.hasChildren) {
			return HTML.create({ tag: "span", class: "toggle-placeholder", attrs: { "aria-hidden": "true" } });
		}
		return HTML.create({
			tag: "button",
			class: "toggle-btn",
			text: ohrNode.isCollapsed ? "▸" : "▾",
			attrs: {
				type: "button",
				"aria-expanded": String(!ohrNode.isCollapsed),
				"aria-label": `${ohrNode.isCollapsed ? "Expand" : "Collapse"} ${ohrNode.shem}`
			},
			on: { click: ohrClick => this.yesodInteraction.toggleNode(ohrClick, ohrNode.kliObject) }
		});
	}

	/**
	 * Create one ARIA tree group by recursively rendering every selectable child scene object.
	 * @param {object[]} kelimChildren Selectable child objects.
	 * @returns {HTMLUListElement} Recursive semantic tree group.
	 */
	createChildrenList(kelimChildren) {
		return HTML.create({
			tag: "ul",
			class: "object-tree-children",
			attrs: { role: "group" },
			children: kelimChildren.map(kliChild => this.createNode(kliChild))
		});
	}
}
