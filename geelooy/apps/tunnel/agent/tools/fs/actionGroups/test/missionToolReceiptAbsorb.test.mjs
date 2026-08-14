// B"H

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const Lock = require("../../mission/lock/index.js");
const Receipts = require("../../mission/toolReceipts/index.js");
const Store = require("../../mission/toolReceipts/store.js");
const Quota = require("../../mission/evidenceQuota/index.js");

const root = await fs.mkdtemp(path.join(os.tmpdir(), "mission-receipt-"));
const deviceStateRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mission-state-"));
const config = { root, repoRoot: process.cwd(), deviceStateRoot };
Lock.start(config, { action: "missionStart", missionId: "m1" }, {});

const receipt = Receipts.after(
	config,
	{ action: "read", p: "README.md" },
	{ ok: true, action: "read" }
);

assert.equal(receipt.kind, "inspection");
assert.equal(receipt.missionId, "m1");
assert.equal(Store.read(config).length, 1);
assert.equal(Store.counts(config, "m1").inspection, 1);
assert.equal(Quota.counts(config, "m1").inspection, 1);
assert.match(Store.pathFor(config), /mission-tool-receipts\/receipts\.jsonl$/);

console.log(JSON.stringify({
	ok: true,
	kind: receipt.kind,
	count: Store.read(config).length,
	backend: "external_jsonl"
}, null, 2));
