//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves transparent starters travel through guarded workspace writes;
 * Awtsmoos.com refuses collisions and reports partial creation truth instead of hiding a failed file.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { MalchusDriveState } from "../core/state.js";
import { createWebsiteStarter } from "../services/starterService.js";

function harness(entries = [], failures = {}) {
	const writes = [];
	let draft = "";
	const state = new MalchusDriveState({
		entries,
		builderBrief: { name: "House of Light" }
	});
	const workspace = {
		async createFile(name) {
			if (failures.create === name) {
				return false;
			}
			writes.push({ name, content: "" });
			return true;
		},
		setDraft(content) {
			draft = content;
		},
		async saveDocument() {
			const current = writes.at(-1);
			if (failures.save === current?.name) {
				return false;
			}
			current.content = draft;
			return true;
		}
	};
	return { state, workspace, writes };
}

test("creates complete ordinary source sequentially", async () => {
	const subject = harness();
	const result = await createWebsiteStarter(subject, "landing");
	assert.deepEqual(result.created, ["index.html", "styles.css", "site.js"]);
	assert.match(subject.writes[0].content, /House of Light/);
	assert.match(subject.writes[1].content, /:root/);
	assert.match(subject.writes[2].content, /awtsmoosSite/);
});

test("refuses every write when any starter filename already exists", async () => {
	const subject = harness([{ name: "styles.css", type: "file" }]);
	await assert.rejects(() => createWebsiteStarter(subject, "docs"), (error) => {
		assert.equal(error.code, "STARTER_FILES_EXIST");
		assert.deepEqual(error.details.collisions, ["styles.css"]);
		return true;
	});
	assert.equal(subject.writes.length, 0);
});

test("reports exact partial state when a later file cannot be created", async () => {
	const subject = harness([], { create: "styles.css" });
	await assert.rejects(() => createWebsiteStarter(subject, "landing"), (error) => {
		assert.equal(error.code, "STARTER_CREATE_FAILED");
		assert.deepEqual(error.details.created, ["index.html"]);
		assert.equal(error.details.failed, "styles.css");
		return true;
	});
	assert.deepEqual(subject.writes.map((item) => item.name), ["index.html"]);
});

test("reports exact partial state when a later file cannot be saved", async () => {
	const subject = harness([], { save: "styles.css" });
	await assert.rejects(() => createWebsiteStarter(subject, "portfolio"), (error) => {
		assert.equal(error.code, "STARTER_SAVE_FAILED");
		assert.deepEqual(error.details.created, ["index.html"]);
		assert.equal(error.details.failed, "styles.css");
		return true;
	});
	assert.deepEqual(subject.writes.map((item) => item.name), ["index.html", "styles.css"]);
});
