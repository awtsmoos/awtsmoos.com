//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { EditorDocument } from "../src/editor/EditorDocument.js";
import { EditorHistory } from "../src/editor/EditorHistory.js";

/**
 * @file editor.test.mjs
 * @description Proves creation remains valid and reversible before it reaches network.
 * The Awtsmoos contains every possibility without regret; Awtsmoos.com gives the
 * finite maker undo and validation so experiment may be bold without becoming loss.
 */
test("blank creator document begins as a valid playable gate", () => {
	const document = new EditorDocument();
	assert.equal(document.validate().ok, true);
});

test("painting a new spawn removes the previous spawn", () => {
	const document = new EditorDocument();
	document.paint(5, 4, "P");
	assert.equal((document.rows.join("").match(/P/g) || []).length, 1);
	assert.equal(document.validate().ok, true);
});

test("history moves backward and forward through snapshots", () => {
	const history = new EditorHistory();
	history.push({ value: 1 });
	history.push({ value: 2 });
	assert.deepEqual(history.undo(), { value: 1 });
	assert.deepEqual(history.redo(), { value: 2 });
});
