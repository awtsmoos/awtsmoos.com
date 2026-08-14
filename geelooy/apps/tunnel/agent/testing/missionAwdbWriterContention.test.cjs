// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const test = require("node:test");
const Open = require("../tools/fs/awdb/open.js");

/**
 * @file Proves healthy mission writers may queue briefly without weakening exclusive custody.
 * @description The Awtsmoos keeps one writer absolute while Awtsmoos.com grants a tiny bounded
 * interval for one living scribe to release the seal before another is declared contending.
 */
test("mission AWDB waits briefly for healthy cross-process writers", async t => {
	const metadataRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mission-lock-"));
	t.after(() => fs.rmSync(metadataRoot, { recursive: true, force: true }));
	const config = fixtureConfig(metadataRoot);
	const databasePath = Open.dbFile(config, "missions");
	assert.equal(Open.databaseOptions("missions", {}).lockWaitMs, 250);
	assert.equal(Open.databaseOptions("actions", {}).lockWaitMs, undefined);
	assert.equal(Open.databaseOptions("missions", { lockWaitMs: 0 }).lockWaitMs, 0);
	assert.equal(Open.databaseOptions("missions", { lockWaitMs: 75 }).lockWaitMs, 75);
	assert.equal(Open.withDb(config, "missions", db => Boolean(db.root)), true);

	const short = await startHolder(databasePath, 100);
	const shortStart = Date.now();
	assert.equal(Open.withDb(config, "missions", db => Boolean(db.root)), true);
	assert.ok(Date.now() - shortStart >= 35);
	await short.done;

	const long = await startHolder(databasePath, 650);
	const boundedStart = Date.now();
	assert.throws(
		() => Open.withDb(config, "missions", () => true),
		error => error?.code === "AWTSMOOS_DB_LOCK_BUSY"
	);
	const boundedElapsed = Date.now() - boundedStart;
	assert.ok(boundedElapsed >= 180 && boundedElapsed < 550, boundedElapsed);

	const zeroStart = Date.now();
	assert.throws(
		() => Open.withDb(config, "missions", () => true, { lockWaitMs: 0 }),
		error => error?.code === "AWTSMOOS_DB_LOCK_BUSY"
	);
	assert.ok(Date.now() - zeroStart < 100);
	await long.done;
	assert.equal(Open.withDb(config, "missions", db => Boolean(db.root)), true);
	assert.equal(fs.existsSync(`${databasePath}.lock`), false);
});

function fixtureConfig(metadataRoot) {
	const repoRoot = path.resolve(__dirname, "../../../../..");
	return { root: repoRoot, repoRoot, sourceRoot: repoRoot, metadataRoot };
}

async function startHolder(databasePath, holdMs) {
	const repoRoot = path.resolve(__dirname, "../../../../..");
	const lockModule = path.join(
		repoRoot,
		"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/writableProcessLock.js"
	);
	const script = [
		"const Lock=require(process.argv[1]);",
		"const lock=new Lock(process.argv[2]);",
		"lock.acquire({lockWaitMs:0});",
		"process.stdout.write('LOCKED\\n');",
		"setTimeout(()=>{lock.release();process.exit(0);},Number(process.argv[3]));"
	].join("");
	const child = spawn(process.execPath, ["-e", script, lockModule, databasePath, String(holdMs)], {
		stdio: ["ignore", "pipe", "pipe"]
	});
	let stdout = "";
	let stderr = "";
	child.stdout.on("data", chunk => { stdout += chunk; });
	child.stderr.on("data", chunk => { stderr += chunk; });
	const done = new Promise((resolve, reject) => child.once("exit", code => {
		if (code === 0) resolve();
		else reject(new Error(`holder_exit_${code}:${stderr}`));
	}));
	try {
		await waitFor(() => stdout.includes("LOCKED") || child.exitCode !== null, 2000);
	} catch (error) {
		child.kill("SIGKILL");
		await done.catch(() => {});
		throw error;
	}
	if (!stdout.includes("LOCKED")) throw new Error(`holder_failed:${child.exitCode}:${stderr}`);
	return { child, done };
}

async function waitFor(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (!predicate()) {
		if (Date.now() >= deadline) throw new Error("holder_ready_timeout");
		await new Promise(resolve => setTimeout(resolve, 10));
	}
}
