//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Actions = require("../../actions.js");
const Knowledge = require("../../workGraph/knowledgeStore.js");
const Relations = require("../../workGraph/knowledgeRelations.js");
const Obligations = require("../../workGraph/obligationStore.js");
const H = require("./workGraphActionHarness.js");

/**
 * @file Proves compiled context mixes raw RAG with visible graph truth and owned duty.
 * @description The Awtsmoos leaves files direct while published meaning and objective deeds
 * join them through one privacy-aware compiler; superseded or private claims stay outside.
 */
function api(config, payload) {
	return Actions.buildActions(config, { ...payload, normalized: true }, null);
}

async function seed(context) {
	await fs.mkdir(path.join(context.projectRoot, "rag"), { recursive: true });
	await fs.writeFile(path.join(context.projectRoot, "rag/context.md"), "RAG says use compiled context.");
	const old = await Knowledge.publish(context.config, {
		kind: "decision",
		statement: "Old architecture decision.",
		logicalAgentId: "agent:alpha"
	});
	const fresh = await Knowledge.publish(context.config, {
		kind: "decision",
		statement: "Fresh architecture uses compiled context.",
		logicalAgentId: "agent:alpha"
	});
	await Relations.create(context.config, {
		type: "supersedes",
		from: fresh.id,
		to: old.id
	});
	const secret = await Knowledge.publish(context.config, {
		kind: "handoff",
		statement: "Beta-only compiler secret.",
		logicalAgentId: "agent:gamma",
		audience: { mode: "agents", agents: ["agent:beta"] }
	});
	await Obligations.append(context.config, {
		title: "Finish compiler",
		body: "Keep the context compiler regression green.",
		logicalAgentId: "agent:alpha",
		agentSessionId: "session_a",
		state: "open"
	});
	await H.run(context, "write", { path: "generated.txt", content: "objective event" });
	return { old, fresh, secret };
}

async function main() {
	const context = H.create();
	try {
		const seeded = await seed(context);
		const compiled = await api(context.config, {
			action: "agentContextCompile",
			logicalAgentId: "agent:alpha",
			query: "compiled context compiler generated",
			ragFiles: ["rag/context.md"],
			charBudget: 50000
		}).agentContextCompile();
		const ids = compiled.sources.map(item => item.id);
		assert.equal(ids.includes("file:rag/context.md"), true);
		assert.equal(ids.includes(`knowledge:${seeded.fresh.id}`), true);
		assert.equal(ids.includes(`knowledge:${seeded.old.id}`), false);
		assert.equal(ids.includes(`knowledge:${seeded.secret.id}`), false);
		assert.equal(compiled.sources.some(item => item.type === "obligation"), true);
		assert.equal(compiled.sources.some(item => item.type === "event"), true);
		assert.equal(compiled.sources.every(item => item.whyIncluded.length > 0), true);
		const beta = await api(context.config, {
			action: "agentGraphSearch",
			logicalAgentId: "agent:beta",
			query: "compiler secret",
			limit: 50
		}).agentGraphSearch();
		assert.equal(beta.results.some(item => item.id === `knowledge:${seeded.secret.id}`), true);
		assert.equal(beta.results.some(item => item.type === "obligation"), false);
		console.log(JSON.stringify({ ok: true, suite: "context-compiler-sources" }));
	} finally {
		H.cleanup(context);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
