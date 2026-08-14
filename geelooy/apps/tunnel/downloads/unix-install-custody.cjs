#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Keeps transactional installation alive outside the replaceable tunnel process family.
 * @description The Awtsmoos transfers custody before the old vessel can disappear;
 * Awtsmoos.com keeps log and receipt outside every canonical/candidate runtime tree.
 */
const [mode, corePath, runtimeRoot, recoveryRoot, installCwd] = process.argv.slice(2);
const transactionsRoot = path.join(recoveryRoot || "", "transactions");
const logsRoot = path.join(recoveryRoot || "", "logs");
const receiptPath = path.join(transactionsRoot, "installer-custody-current.json");

if (mode === "run") runDetached().catch(fail);
else if (mode === "delegate") delegate().catch(fail);
else fail(new Error("installer_custody_mode_required"));

async function delegate() {
	prepareRoots();
	const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
	const logPath = path.join(logsRoot, `installer-custody-${stamp}-${process.pid}.log`);
	try { fs.unlinkSync(receiptPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
	const logFd = fs.openSync(logPath, "a", 0o600);
	const runner = spawn(process.execPath, [
		__filename, "run", corePath, runtimeRoot, recoveryRoot, installCwd, logPath
	], {
		cwd: installCwd,
		detached: true,
		env: process.env,
		stdio: ["ignore", logFd, logFd]
	});
	fs.closeSync(logFd);
	runner.unref();
	let offset = 0;
	for (;;) {
		await delay(200);
		offset = mirrorLog(logPath, offset);
		const receipt = readReceipt();
		if (receipt?.terminal) {
			mirrorLog(logPath, offset);
			process.exitCode = Number(receipt.exitCode || 0);
			return;
		}
		if (!alive(runner.pid)) throw new Error("installer_custody_runner_lost");
	}
}

async function runDetached() {
	const logPath = process.argv[7] || "";
	prepareRoots();
	writeReceipt({ state: "running", terminal: false, runnerPid: process.pid, logPath });
	const core = spawn("/bin/bash", [corePath], {
		cwd: installCwd,
		env: process.env,
		stdio: "inherit"
	});
	writeReceipt({ state: "running", terminal: false, runnerPid: process.pid, corePid: core.pid, logPath });
	const outcome = await new Promise(resolve => {
		core.once("close", (code, signal) => resolve({ code, signal }));
		core.once("error", error => resolve({ code: 1, signal: null, error: error.message }));
	});
	const exitCode = Number.isInteger(outcome.code) ? outcome.code : 1;
	writeReceipt({
		state: exitCode === 0 ? "completed" : "failed",
		terminal: true,
		exitCode,
		signal: outcome.signal || null,
		error: outcome.error || "",
		runnerPid: process.pid,
		logPath
	});
	fs.rmSync(runtimeRoot, { recursive: true, force: true });
	process.exitCode = exitCode;
}

function prepareRoots() {
	if (!recoveryRoot || !installCwd || !runtimeRoot || !corePath) throw new Error("installer_custody_paths_required");
	fs.mkdirSync(transactionsRoot, { recursive: true, mode: 0o700 });
	fs.mkdirSync(logsRoot, { recursive: true, mode: 0o700 });
}

function writeReceipt(value) {
	const temporary = `${receiptPath}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, receiptPath);
}

function readReceipt() {
	try { return JSON.parse(fs.readFileSync(receiptPath, "utf8")); }
	catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function mirrorLog(logPath, offset) {
	if (!fs.existsSync(logPath)) return offset;
	const content = fs.readFileSync(logPath);
	if (content.length > offset) process.stdout.write(content.subarray(offset));
	return content.length;
}

function alive(pid) {
	try { process.kill(pid, 0); return true; } catch { return false; }
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function fail(error) {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
}
