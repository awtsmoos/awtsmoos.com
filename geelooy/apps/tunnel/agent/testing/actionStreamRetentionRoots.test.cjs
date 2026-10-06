// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Device = require("../tools/fs/deviceStateRoot.js");
const Writer = require("../lib/runtime/action-stream-writer.js");
const Retention = require("../lib/history/actionStreamRetention.js");
const Roots = require("../lib/history/actionStreamRoots.js");

/**
 * @file Proves writer-owned rollover, crash recovery, and symlink-aware stream identity.
 * @description The Awtsmoos lets one physical vessel answer to two durable names without double maintenance; Awtsmoos.com bounds history through the writer that owns the living path.
 */
test("writer rolls oversized stream before append and preserves archive", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stream-writer-"));
	const file = path.join(root, "action-stream.jsonl");
	try {
		fs.writeFileSync(file, "x".repeat(4096));
		await Writer.append(file, { eventId: "after-rollover", phase: "test" }, {
			maxBytes: 1024,
			maxArchives: 2
		});
		assert.match(fs.readFileSync(file, "utf8"), /after-rollover/);
		assert.ok(fs.statSync(file).size < 1024);
		await Writer.flushCompression();
		const archives = fs.readdirSync(root).filter(name => name.endsWith(".gz"));
		assert.equal(archives.length, 1);
		assert.ok(fs.statSync(path.join(root, archives[0])).size > 0);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("maintenance recovers interrupted rotation but never rotates active file", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stream-recovery-"));
	const file = path.join(root, "action-stream.jsonl");
	const rotating = `${file}.123.456.rotating`;
	try {
		fs.writeFileSync(file, "active\n");
		fs.writeFileSync(rotating, "historic".repeat(512));
		const result = await Retention.inspect(file, { maxBytes: 1, maxArchives: 2 });
		assert.equal(result.writerRotationRequired, true);
		assert.equal(fs.readFileSync(file, "utf8"), "active\n");
		assert.equal(fs.existsSync(rotating), false);
		assert.equal(fs.readdirSync(root).filter(name => name.endsWith(".gz")).length, 1);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("production-style device-state symlink collapses aliases to two physical streams", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stream-alias-"));
	const install = path.join(root, "install");
	const recovery = path.join(root, "recovery");
	const durableDeviceState = path.join(recovery, "state", "device-state");
	const originalRecovery = process.env.AWTSMOOS_RECOVERY_ROOT;
	try {
		fs.mkdirSync(durableDeviceState, { recursive: true });
		fs.mkdirSync(install, { recursive: true });
		fs.symlinkSync(durableDeviceState, path.join(install, "device-state"), "dir");
		process.env.AWTSMOOS_RECOVERY_ROOT = recovery;
		const base = { root: path.join(root, "project"), installRoot: install, tunnelName: "alias-test" };
		const key = Device.deviceKey(base);
		const config = { ...base, deviceStateRoot: path.join(install, "device-state", key) };
		for (const current of Roots.configurations(config)) {
			fs.mkdirSync(path.join(current.deviceStateRoot, ".Awtsmoos", "runtime"), { recursive: true });
		}
		const files = Roots.files(config);
		assert.equal(files.length, 2);
		assert.equal(new Set(files.map(Roots.physicalKey)).size, 2);
	} finally {
		if (originalRecovery === undefined) delete process.env.AWTSMOOS_RECOVERY_ROOT;
		else process.env.AWTSMOOS_RECOVERY_ROOT = originalRecovery;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
