//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves async acceptance is not confused with the child's actual filesystem deed.
 * @description The parent may promise work while the child alone touches the vessel;
 * the Awtsmoos separates receipt from deed, and Awtsmoos.com chronicles only the deed.
 */
async function waitForExit(runner) {
	if (runner.task.status !== "running") return;
	await new Promise((resolve, reject) => {
		runner.child.once("exit", resolve);
		runner.child.once("error", reject);
	});
}

function restore(name, value) {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

async function main() {
	const base = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-autoasync-prov-"));
	const installRoot = path.join(base, "install");
	const projectRoot = path.join(base, "project");
	await fsp.mkdir(installRoot, { recursive: true });
	await fsp.mkdir(projectRoot, { recursive: true });
	await fsp.writeFile(
		path.join(installRoot, "config.json"),
		JSON.stringify({ root: projectRoot, allowCommands: true }, null, 2),
		"utf8"
	);
	const saved = {
		install: process.env.AWTSMOOS_INSTALL_ROOT,
		project: process.env.AWTSMOOS_PROJECT_ROOT,
		state: process.env.AWTSMOOS_TUNNEL_STATE_ROOT
	};
	process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
	process.env.AWTSMOOS_PROJECT_ROOT = projectRoot;
	process.env.AWTSMOOS_TUNNEL_STATE_ROOT = path.join(base, "state");
	try {
		const { loadConfig } = require("../../../../lib/config.js");
		const Actions = require("../../actions.js");
		const Async = require("../asyncTaskActions.js");
		const Ledger = require("../../workGraph/eventLedger.js");
		const config = loadConfig();
		assert.equal(config.root, fs.realpathSync.native(projectRoot));
		const receipt = await Actions.runPlain(config, {
			action: "bulkWrite",
			controlRequestId: "ctl-autoasync-provenance",
			normalized: true,
			writes: [
				{ path: "one.txt", content: "one" },
				{ path: "two.txt", content: "two" }
			]
		}, null);
		assert.equal(receipt.autoAsync, true);
		assert.equal(receipt.mode, "auto_async_subprocess");
		assert.equal((await Ledger.list(config)).length, 0);
		const runner = Async.TASKS.get(receipt.taskId);
		assert.ok(runner);
		await waitForExit(runner);
		assert.equal(runner.task.status, "completed", runner.task.stderr);
		assert.equal(fs.readFileSync(path.join(projectRoot, "one.txt"), "utf8"), "one");
		assert.equal(fs.readFileSync(path.join(projectRoot, "two.txt"), "utf8"), "two");
		const events = await Ledger.list(config);
		assert.equal(events.length, 1);
		assert.equal(events[0].type, "filesystem.bulkWrite");
		console.log(JSON.stringify({
			ok: true,
			suite: "work-graph-auto-async-provenance",
			taskId: receipt.taskId,
			eventId: events[0].id
		}));
	} finally {
		restore("AWTSMOOS_INSTALL_ROOT", saved.install);
		restore("AWTSMOOS_PROJECT_ROOT", saved.project);
		restore("AWTSMOOS_TUNNEL_STATE_ROOT", saved.state);
		await fsp.rm(base, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
