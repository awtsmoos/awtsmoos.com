//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const Actions = require("../../actions.js");
const MissionStore = require("../../mission/ledger/store.js");
const Harness = require("./workGraphHarness.js");
const MutationScenario = require("./workGraphMutationScenario.js");

/**
 * @file Proves Chronicle lenses coexist with direct Virtual OS file and RAG navigation.
 * @description The Awtsmoos lets a file be opened as itself and also known by its story;
 * Awtsmoos.com adds history without replacing folders, source, notes, or RAG artifacts.
 */
function action(config, payload) {
	return Actions.buildActions(config, { ...payload, normalized: true }, null);
}

async function seedWork(config) {
	await MissionStore.save(config, {
		id: "mission_history_test",
		missionId: "mission_history_test",
		remainingWork: [{
			id: "work_history_test",
			title: "Prove navigation coexistence",
			state: "discovered",
			priority: "high",
			owner: "",
			claim: null,
			absolutePaths: ["/project/rag/context.md"],
			verification: { required: false, status: "pending", evidenceIds: [] },
			origin: "test",
			blocker: null,
			nextAction: null,
			createdAt: "2026-09-15T00:00:00.000Z",
			updatedAt: "2026-09-15T00:00:01.000Z"
		}]
	});
}

async function proveFileHistory(config) {
	const api = action(config, {
		action: "agentFileHistory",
		path: "beta.txt",
		order: "asc"
	});
	const result = await api.agentFileHistory();
	assert.deepEqual(result.events.map(event => event.type), [
		"filesystem.write",
		"filesystem.moveFile",
		"filesystem.deleteFile"
	]);
	assert.equal(result.entityIds.length, 1);
}

async function proveWorkHistory(config) {
	const api = action(config, {
		action: "agentWorkHistory",
		missionId: "mission_history_test",
		workId: "work_history_test",
		order: "asc"
	});
	const result = await api.agentWorkHistory();
	assert.deepEqual(result.events.map(event => event.type), ["work.registered"]);
	const search = action(config, {
		action: "agentHistorySearch",
		query: "navigation coexistence"
	});
	const found = await search.agentHistorySearch();
	assert.equal(found.events.some(event => event.workId === "work_history_test"), true);
}

async function proveRawFiles(config) {
	await fsp.mkdir(path.join(config.root, "rag"), { recursive: true });
	await fsp.writeFile(path.join(config.root, "rag/context.md"), "raw rag context", "utf8");
	const api = action(config, { action: "read", path: "rag/context.md" });
	assert.equal(typeof api.read, "function");
	assert.equal(typeof api.list, "function");
	assert.equal(typeof api.agentFileHistory, "function");
	assert.equal(typeof api.agentWorkHistory, "function");
	const read = await api.read();
	assert.equal(read.content, "raw rag context");
}

async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	try {
		await MutationScenario.run(config);
		await seedWork(config);
		await proveFileHistory(config);
		await proveWorkHistory(config);
		await proveRawFiles(config);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-history-actions" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
