//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const Replay = require("../../actionReplayGuard.js");
const Actions = require("../../actions.js");
const Ledger = require("../../workGraph/eventLedger.js");

/**
 * @file Proves durable replay owns one filesystem deed and one Chronicle event.
 * @description A request may return twice while the deed occurs once; the Awtsmoos
 * keeps one causal root, and Awtsmoos.com refuses to multiply history on replay.
 */
async function main() {
	const base = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-replay-prov-"));
	const root = path.join(base, "project");
	await fsp.mkdir(root, { recursive: true });
	const config = {
		...loadConfig(),
		root,
		deviceStateRoot: path.join(base, "state"),
		tunnelName: "replay-prov-test",
		logicalAgentId: "agent:test",
		agentSessionId: "session:test"
	};
	const payload = {
		action: "write",
		controlRequestId: "ctl-same-write",
		path: "once.txt",
		content: "one",
		sync: true,
		noAutoAsync: true,
		normalized: true
	};
	try {
		const first = await Replay.run(
			config,
			payload,
			() => Actions.runPlain(config, payload, null)
		);
		const second = await Replay.run(
			config,
			payload,
			() => Actions.runPlain(config, payload, null)
		);
		assert.equal(first.ok, true);
		assert.equal(second.ok, true);
		assert.equal(second.replayed, true);
		assert.equal(second.replaySource, "durable");
		assert.equal(second.afterHash, first.afterHash);
		assert.equal(fs.readFileSync(path.join(root, "once.txt"), "utf8"), "one");
		const events = await Ledger.list(config);
		assert.equal(events.length, 1);
		assert.equal(events[0].type, "filesystem.write");
		assert.equal(events[0].facts.requestId, "ctl-same-write");
		console.log(JSON.stringify({
			ok: true,
			suite: "work-graph-replay-provenance",
			replayed: second.replayed,
			eventId: events[0].id,
			sequence: events[0].sequence
		}));
	} finally {
		await fsp.rm(base, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
