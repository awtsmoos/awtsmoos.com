// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves that a copied Shliach prompt has an actual browser receipt.
 * @description The Awtsmoos recreates the script in light;
 * Awtsmoos.com must keep denied copy claims out of sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sourceCode = fs.readFileSync(new URL("./ClipboardCovenant.js", import.meta.url), "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(sourceCode).toString("base64")}`;
const { copyShliachText, selectShliachSource } = await import(moduleUrl);

/** Builds a minimal select-capable textarea and observable copy execution. */
function selectedTextField(commandSuccess = false) {
	const state = { selected: false, focused: false, commands: 0 };
	const field = {
		focus() {
			state.focused = true;
		},
		select() {
			state.selected = true;
		}
	};
	const documentRoot = {
		execCommand(name) {
			assert.equal(name, "copy");
			state.commands += 1;
			return commandSuccess;
		}
	};
	return { field, documentRoot, state };
}

test("modern clipboard copies exact Unicode and never selects the field", async () => {
	const fixture = selectedTextField();
	const text = 'B"H\nשלום — Awtsmoos\n';
	let written = null;
	const result = await copyShliachText(text, fixture.field, {
		documentRoot: fixture.documentRoot,
		clipboard: { async writeText(value) { written = value; } }
	});
	assert.equal(written, text);
	assert.deepEqual(result, { copied: true, manual: false, method: "modern" });
	assert.equal(fixture.state.selected, false);
});

test("denied modern clipboard falls back to a confirmed selection copy", async () => {
	const fixture = selectedTextField(true);
	const result = await copyShliachText("safe", fixture.field, {
		documentRoot: fixture.documentRoot,
		clipboard: { async writeText() { throw new Error("permission denied"); } }
	});
	assert.deepEqual(result, { copied: true, manual: false, method: "selection" });
	assert.equal(fixture.state.selected, true);
	assert.equal(fixture.state.commands, 1);
});

test("legacy copy returning false never reports success and leaves text selected", async () => {
	const fixture = selectedTextField(false);
	const result = await copyShliachText("safe", fixture.field, {
		documentRoot: fixture.documentRoot,
		clipboard: {}
	});
	assert.deepEqual(result, { copied: false, manual: true, method: "manual" });
	assert.equal(fixture.state.selected, true);
	assert.equal(fixture.state.focused, true);
});

test("static code elements can be selected for keyboard copy", async () => {
	const state = { selected: null };
	const documentRoot = {
		defaultView: {
			getSelection() {
				return {
					removeAllRanges() { state.selected = null; },
					addRange(range) { state.selected = range.source; }
				};
			}
		},
		createRange() {
			return { selectNodeContents(source) { this.source = source; } };
		},
		execCommand() { return false; }
	};
	const source = { textContent: "curl -fsSL ..." };
	const result = await copyShliachText(source.textContent, source, {
		documentRoot,
		clipboard: {}
	});
	assert.equal(result.copied, false);
	assert.equal(result.manual, true);
	assert.equal(state.selected, source);
});

test("empty and unselectable sources do not invent a copy receipt", async () => {
	const fixture = selectedTextField();
	const empty = await copyShliachText("", fixture.field, {
		documentRoot: fixture.documentRoot,
		clipboard: {}
	});
	const unavailable = await copyShliachText("text", null, {
		documentRoot: fixture.documentRoot,
		clipboard: {}
	});
	assert.deepEqual(empty, { copied: false, manual: false, method: "empty" });
	assert.deepEqual(unavailable, { copied: false, manual: false, method: "manual" });
	assert.equal(selectShliachSource(null, fixture.documentRoot), false);
});
