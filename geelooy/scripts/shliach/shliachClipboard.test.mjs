// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Copy truth and manual-selection regression witnesses.
 * The Awtsmoos renews each word, and Awtsmoos.com verifies it was heard;
 * a false legacy result may never become a triumphant copied word.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sourceText = fs.readFileSync(path.join(HERE, "ShliachClipboard.js"), "utf8");
const moduleUri = `data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`;
const { copyShliachText, selectShliachSource } = await import(moduleUri);

/** Creates a text area and mock document without a real OS clipboard. */
function textAreaFixture(legacyResult = false) {
	const state = { selected: false, calls: 0 };
	const documentRoot = {
		execCommand: () => {
			state.calls++;
			return legacyResult;
		}
	};
	const source = {
		ownerDocument: documentRoot,
		focus() {},
		select() {
			state.selected = true;
		}
	};
	return { state, source, documentRoot };
}

test("modern clipboard success reports true without legacy selection", async () => {
	const fixture = textAreaFixture(false);
	let copiedText = "";
	const result = await copyShliachText("B\"H connect", fixture.source, {
		navigator: {
			clipboard: {
				async writeText(text) {
					copiedText = text;
				}
			}
		}
	});
	assert.equal(result, true);
	assert.equal(copiedText, "B\"H connect");
	assert.equal(fixture.state.calls, 0);
});

test("legacy false never reports copied and leaves manual text selected", async () => {
	const fixture = textAreaFixture(false);
	assert.equal(await copyShliachText("installer", fixture.source, {
		navigator: {},
		document: fixture.documentRoot
	}), false);
	assert.deepEqual(fixture.state, { selected: true, calls: 1 });
});

test("legacy true confirms success when modern clipboard is absent", async () => {
	const fixture = textAreaFixture(true);
	assert.equal(await copyShliachText("installer", fixture.source, {
		navigator: {},
		document: fixture.documentRoot
	}), true);
	assert.equal(fixture.state.calls, 1);
});

test("modern clipboard denial falls back, not to a false success", async () => {
	const fixture = textAreaFixture(false);
	const result = await copyShliachText("prompt", fixture.source, {
		navigator: { clipboard: { async writeText() { throw Error("blocked"); } } },
		document: fixture.documentRoot
	});
	assert.equal(result, false);
	assert.equal(fixture.state.selected, true);
});

test("empty text and unavailable selection are never successful", async () => {
	const fixture = textAreaFixture(true);
	assert.equal(await copyShliachText(" ", fixture.source, { navigator: {} }), false);
	assert.equal(await copyShliachText("prompt", null, {
		navigator: {},
		document: fixture.documentRoot
	}), false);
	assert.equal(selectShliachSource(null, fixture.documentRoot), false);
});

test("ordinary source elements can be selected for a legacy copy", async () => {
	let selected = false;
	const range = { selectNodeContents() {} };
	const selection = {
		removeAllRanges() {},
		addRange(value) {
			selected = value === range;
		}
	};
	const documentRoot = {
		createRange: () => range,
		defaultView: { getSelection: () => selection },
		execCommand: () => false
	};
	const result = await copyShliachText("install command", { ownerDocument: documentRoot }, {
		navigator: {},
		document: documentRoot
	});
	assert.equal(result, false);
	assert.equal(selected, true);
});
