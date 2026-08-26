// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that hierarchy meaning remains pure while semantic rendering and interaction reveal it without hidden policy;
 * Awtsmoos.com proves selectability, icons, collapse memory, keyboard truth, and thin façade boundaries before deeper Editor work proceeds.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	isEtzSelectable,
	revealEtzIcon,
	revealEtzNode,
	toggleEtzCollapsed
} from "./src/UI/ObjectTreeSemantics.js";

/** Read one Object Tree source file as immutable structural evidence. */
function seferEtz(shemFile) {
	return readFileSync(new URL(`./src/UI/${shemFile}`, import.meta.url), "utf8");
}

const ohrPanel = seferEtz("ObjectTreePanel.js");
const ohrView = seferEtz("ObjectTreeNodeView.js");
const ohrInteraction = seferEtz("ObjectTreeNodeInteraction.js");

test("pure tree semantics expose selectability icons and filtered children", () => {
	const kliChildVisible = { uuid: "child-a", name: "Child", userData: { isSelectable: true }, children: [] };
	const kliChildHidden = { uuid: "child-b", name: "Hidden", userData: {}, children: [] };
	const kliGroup = {
		uuid: "root",
		name: "Root",
		isGroup: true,
		userData: { isSelectable: true },
		children: [kliChildVisible, kliChildHidden]
	};
	assert.equal(isEtzSelectable(kliGroup), true);
	assert.equal(isEtzSelectable(kliChildHidden), false);
	assert.equal(revealEtzIcon(kliGroup), "📁");
	assert.equal(revealEtzIcon({ isLight: true }), "💡");
	assert.equal(revealEtzIcon({ isCamera: true }), "📷");
	assert.equal(revealEtzIcon({}), "🧊");
	const ohrNode = revealEtzNode(kliGroup);
	assert.equal(ohrNode.hasChildren, true);
	assert.deepEqual(ohrNode.kelimChildren, [kliChildVisible]);
});

test("collapse truth defaults open and toggles only explicit tree memory", () => {
	const kliObject = { userData: { isSelectable: true }, children: [] };
	assert.equal(revealEtzNode(kliObject).isCollapsed, false);
	assert.equal(toggleEtzCollapsed(kliObject), true);
	assert.equal(kliObject.userData.treeCollapsed, true);
	assert.equal(toggleEtzCollapsed(kliObject), false);
});

test("recursive tree view exposes semantic keyboard and disclosure contracts", () => {
	assert.match(ohrView, /role: "treeitem"/);
	assert.match(ohrView, /tabindex: "0"/);
	assert.match(ohrView, /"aria-selected": "false"/);
	assert.match(ohrView, /tag: "button"/);
	assert.match(ohrView, /"aria-expanded"/);
	assert.match(ohrView, /role: "group"/);
	assert.match(ohrInteraction, /ohrKey\.key !== "Enter"/);
	assert.match(ohrInteraction, /ohrKey\.key !== " "/);
	assert.match(ohrInteraction, /emit\("objectClicked"/);
});

test("ObjectTreePanel remains a thin compatibility façade with ARIA selection sync", () => {
	assert.match(ohrPanel, /export class ObjectTreePanel extends BasePanel/);
	assert.match(ohrPanel, /new SodObjectTreeNodeView/);
	assert.match(ohrPanel, /role: "tree"/);
	assert.match(ohrPanel, /aria-selected/);
	assert.match(ohrPanel, /sceneGraphChanged/);
	assert.match(ohrPanel, /selectionChanged/);
	assert.match(ohrPanel, /objectRenamed/);
});
