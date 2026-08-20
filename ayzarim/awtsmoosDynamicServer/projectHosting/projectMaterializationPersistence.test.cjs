//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { ProjectMaterializationStore } = require("./ProjectMaterializationStore.js");
const { ProjectRuntimeManager } = require("./ProjectRuntimeManager.js");

/**
 * @file Proves materialization survives process-memory forgetting without leaking trusted roots.
 * @description
 * The Awtsmoos renews the process while durable testimony keeps the opaque sign in sight;
 * Awtsmoos.com may rediscover a vessel after restart, yet cleanup removes the sign and body in one night.
 */
test("materialization reference survives a fresh store instance", async () => {
	const baseRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-materialization-persist-"));
	try {
		const first = new ProjectMaterializationStore({ baseRoot });
		const created = await first.materialize(input());
		const second = new ProjectMaterializationStore({ baseRoot });
		const status = await second.status(identity());
		assert.equal(status.materialized, true);
		assert.equal(status.materializationRef, created.materializationRef);
		const root = await second.resolve({ ...identity(), rootRef: created.materializationRef });
		assert.match(await fs.readFile(path.join(root, "_awtsmoos.derech.js"), "utf8"), /B\"H/);
	} finally {
		await fs.rm(baseRoot, { recursive: true, force: true });
	}
});

test("manager status reports durable materialization while runtime is stopped", async () => {
	const baseRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-manager-persist-"));
	try {
		const first = new ProjectRuntimeManager({ materializationOptions: { baseRoot } });
		const created = await first.materialize(input());
		const second = new ProjectRuntimeManager({ materializationOptions: { baseRoot } });
		const status = await second.status(identity());
		assert.equal(status.running, false);
		assert.equal(status.materialized, true);
		assert.equal(status.materializationRef, created.materializationRef);
		assert.equal("root" in status, false);
	} finally {
		await fs.rm(baseRoot, { recursive: true, force: true });
	}
});

test("cleanup removes durable recovery metadata", async () => {
	const baseRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-clean-persist-"));
	try {
		const first = new ProjectMaterializationStore({ baseRoot });
		await first.materialize(input());
		await first.cleanup(identity());
		const second = new ProjectMaterializationStore({ baseRoot });
		assert.deepEqual(await second.status(identity()), {
			projectId: "persist-site",
			materialized: false,
			materializationRef: null
		});
	} finally {
		await fs.rm(baseRoot, { recursive: true, force: true });
	}
});

function identity() {
	return { projectId: "persist-site", ownerScope: "user:persist" };
}

function input() {
	const route = "//B\"H\nmodule.exports = async () => ({ ok: true });\n";
	return {
		...identity(),
		bundle: {
			version: 1,
			rootPath: ".",
			manifest: {},
			files: [{ path: "_awtsmoos.derech.js", content: route }],
			totalChars: route.length
		}
	};
}
