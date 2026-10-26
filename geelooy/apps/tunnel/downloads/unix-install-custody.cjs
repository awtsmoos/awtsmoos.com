#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");
const { StringDecoder } = require("node:string_decoder");

/**
 * @file Keeps transactional installation alive outside the replaceable tunnel process family.
 * @description The Awtsmoos transfers custody before the old vessel can disappear;
 * Awtsmoos.com keeps log and receipt outside every canonical/candidate runtime tree.
 */
const [mode, corePath, runtimeRoot, recoveryArgument, installCwd] = process.argv.slice(2);
const recoveryRoot = ["status", "cancel"].includes(mode)
  ? (corePath || (path.basename(__filename) === "awtsmoos-installer-control.cjs" ? path.dirname(path.dirname(__filename)) : ""))
  : recoveryArgument;
const controlPath = path.join(recoveryRoot || "", "bin", "awtsmoos-installer-control.cjs");
const colors = process.stderr.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb"
  ? { cyan: "\x1b[96m", gold: "\x1b[93m", green: "\x1b[92m", dim: "\x1b[2m", bold: "\x1b[1m", off: "\x1b[0m" }
  : { cyan: "", gold: "", green: "", dim: "", bold: "", off: "" };
const transactionsRoot = path.join(recoveryRoot || "", "transactions");
const logsRoot = path.join(recoveryRoot || "", "logs");
const receiptPath = path.join(transactionsRoot, "installer-custody-current.json");
const decorated = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb");
const decoder = new StringDecoder("utf8");
let incompleteLine = "";

if (mode === "run") runDetached().catch(fail);
else if (mode === "delegate") delegate().catch(fail);
else if (mode === "status") showStatus();
else if (mode === "cancel") cancelInstall();
else fail(new Error("installer_custody_mode_required"));

async function delegate() {
	prepareRoots();
	const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
	const logPath = path.join(logsRoot, `installer-custody-${stamp}-${process.pid}.log`);
	try { fs.unlinkSync(receiptPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
	publishControl();
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
	// Cancellation must reach the actual installer, not just the display relay.
	const cancel = () => { try { process.kill(runner.pid, "SIGTERM"); } catch {} };
	process.once("SIGINT", cancel);
	process.once("SIGTERM", cancel);
	let offset = 0;
	let lastHeartbeat = Date.now();
	const startedAt = Date.now();
	process.stderr.write(`\n${colors.cyan}╭──────────────────────────────────────────────╮${colors.off}\n${colors.bold}${colors.gold}   ✦ AWTSMOOS / LIVE INSTALL CONTROL${colors.off}\n${colors.cyan}╰──────────────────────────────────────────────╯${colors.off}\n${colors.green}   ● Installer running${colors.off}\n   Runner PID  ${runner.pid}\n   Status      node "${controlPath}" status\n   Cancel      node "${controlPath}" cancel\n   Immediate   kill -TERM ${runner.pid}\n   Live log    ${logPath}\n${colors.dim}   Your installed tunnel is preserved until verification succeeds.${colors.off}\n\n`);
	for (;;) {
		await delay(200);
		offset = mirrorLog(logPath, offset);
		const receipt = readReceipt();
		if (receipt?.terminal) {
			mirrorLog(logPath, offset);
			flushMirror();
			process.exitCode = Number(receipt.exitCode || 0);
			return;
		}
		if (!alive(runner.pid)) throw new Error("installer_custody_runner_lost");
		if (Date.now()-lastHeartbeat >= 5000) {
			const receipt = readReceipt();
			const elapsed = Math.floor((Date.now()-startedAt)/1000);
			const silent = logAgeSeconds(logPath);
			process.stderr.write(`${colors.cyan}   ◉ ACTIVE${colors.off} | ${elapsed}s | core PID ${receipt?.corePid || runner.pid}\n${colors.dim}      ${latestProgress(logPath)}${colors.off}${silent > 30 ? ` ${colors.gold}(no new output for ${silent}s)${colors.off}` : ""}\n`);
			lastHeartbeat=Date.now();
		}
	}
}

async function runDetached() {
	const logPath = process.argv[7] || "";
	prepareRoots();
	writeReceipt({ state: "running", terminal: false, runnerPid: process.pid, runtimeRoot, logPath, startedAt: new Date().toISOString() });
	const core = spawn("/bin/bash", [corePath], {
		cwd: installCwd,
		env: process.env,
		stdio: "inherit"
	});
	writeReceipt({ state: "running", terminal: false, runnerPid: process.pid, corePid: core.pid, runtimeRoot, logPath, startedAt: new Date().toISOString() });
	// The runner is a detached process-group leader. Terminate its OWN group so
	// hung shell grandchildren do not keep the installer trapped for minutes.
	let cancellationSent = false;
	const cancelCore = () => {
		if (cancellationSent) return;
		cancellationSent = true;
		try { process.kill(-process.pid, "SIGTERM"); }
		catch { try { core.kill("SIGTERM"); } catch {} }
	};
	// Keep handlers installed: the process-group broadcast includes this runner.
	process.on("SIGINT", cancelCore);
	process.on("SIGTERM", cancelCore);
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
		corePid: core.pid,
		runtimeRoot,
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

function publishControl() {
	const directory = path.dirname(controlPath);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	const temp = `${controlPath}.${process.pid}.tmp`;
	fs.copyFileSync(__filename, temp);
	fs.chmodSync(temp, 0o600);
	fs.renameSync(temp, controlPath);
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
	let fd;
	try {
		fd = fs.openSync(logPath, "r");
		const size = fs.fstatSync(fd).size;
		if (size < offset) offset = 0;
		// Only read newly appended bytes; the former whole-file read was quadratic.
		const buffer = Buffer.alloc(Math.min(65536, Math.max(1, size - offset)));
		while (offset < size) {
			const count = fs.readSync(fd, buffer, 0, Math.min(buffer.length, size-offset), offset);
			if (!count) break;
			printLog(buffer.subarray(0, count));
			offset += count;
		}
		return offset;
	} catch (e) { if (e.code !== "ENOENT") throw e; return offset; }
	finally { if (fd !== undefined) fs.closeSync(fd); }
}
function printLog(bytes) {
	if (!decorated) { process.stdout.write(bytes); return; }
	const input = incompleteLine + decoder.write(bytes);
	const lines = input.split("\n");
	incompleteLine = lines.pop();
	for (const line of lines) {
		const raw = line.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
		let color = "";
		if (/\b(FAILED|error|failure|timed out)\b/i.test(raw) || raw.includes("✕")) color = "\x1b[1;91m";
		else if (/\b(warning|waiting|retrying)\b/i.test(raw) || raw.includes("⚠")) color = "\x1b[93m";
		else if (raw.includes("✓") || /\b(success|complete|passed)\b/i.test(raw)) color = "\x1b[92m";
		else if (/\[[ ]*[0-9]+%\]|\bPROBE\b|\bPID\b/.test(raw)) color = "\x1b[96m";
		else if (/^\s*== /.test(raw)) color = "\x1b[1;95m";
		process.stdout.write(color ? `${color}${line}\x1b[0m\n` : `${line}\n`);
	}
	if (incompleteLine.length > 8192) { process.stdout.write(incompleteLine); incompleteLine = ""; }
}
function flushMirror() {
	if (decorated) {
		const end = incompleteLine + decoder.end();
		if (end) process.stdout.write(end);
		incompleteLine = "";
	}
}
function logAgeSeconds(file) {
	try { return Math.max(0, Math.floor((Date.now() - fs.statSync(file).mtimeMs) / 1000)); }
	catch { return 0; }
}

function latestProgress(file) {
 try {
  const fd=fs.openSync(file,"r");
  try {
   const size=fs.fstatSync(fd).size, len=Math.min(size,8192), b=Buffer.alloc(len);
   fs.readSync(fd,b,0,len,size-len);
   const lines=b.toString("utf8").replace(/\x1b\[[0-9;]*[A-Za-z]/g,"").split(/[\r\n]+/).map(s=>s.trim());
   return lines.reverse().find(s=>/\d+%|Managing service|Probing|Waking up|Installing|Setting up|Starting|Verifying|pairing|waiting/i.test(s))?.slice(0,120) || "Checking runtime";
  } finally { fs.closeSync(fd); }
 } catch { return "Preparing"; }
}
function showStatus() {
 const r = readReceipt();
 if (!r) { process.stdout.write("No installation receipt\n"); return; }
 const running = !r.terminal && isOwnedRunner(r);
 process.stdout.write(`\n${colors.cyan}╭──────────────────────────────────────────╮${colors.off}\n${colors.bold}${colors.gold}  ✦ AWTSMOOS INSTALLER STATUS${colors.off}\n${colors.cyan}╰──────────────────────────────────────────╯${colors.off}\n  State:      ${r.state}\n  Running:    ${running ? `${colors.green}yes${colors.off}` : "no"}\n  Runner PID: ${r.runnerPid || "-"}\n  Core PID:   ${r.corePid || "-"}\n  Phase:      ${latestProgress(r.logPath)}\n  Log:        ${r.logPath}\n`);
 if (running) {
  const descendants = installerProcesses(r.runnerPid);
  process.stdout.write(`  Installer processes (PID / parent / executable):\n`);
  for (const p of descendants) process.stdout.write(`    ${p.pid} / ${p.ppid} / ${p.command}\n`);
  process.stdout.write(`  Inspect:    ps -p ${r.runnerPid},${r.corePid || r.runnerPid} -o pid,ppid,etime,stat,command\n  Children:   pgrep -P ${r.corePid || r.runnerPid} -fl .\n  Cancel:     node "${controlPath}" cancel\n  Direct:     kill -TERM ${r.runnerPid}\n`);
 }
}
// Process-tree inventory is read-only and prints executable names, never
// command-line arguments that could contain pairing details or credentials.
function installerProcesses(rootPid) {
 try {
  const records = execFileSync("ps", ["-axo", "pid=,ppid=,comm="], {encoding:"utf8",timeout:2000,maxBuffer:2*1024*1024})
    .split("\n").map(line=>/^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line))
    .filter(Boolean).map(m=>({pid:Number(m[1]),ppid:Number(m[2]),command:path.basename(m[3].trim()).slice(0,80)}));
  const found=new Set([rootPid]);
  let changed=true;
  while(changed){changed=false;for(const item of records){if(found.has(item.ppid)&&!found.has(item.pid)){found.add(item.pid);changed=true;}}}
  return records.filter(item=>found.has(item.pid));
 }catch{return [{pid:rootPid,ppid:"?",command:"unavailable"}];}
}
function isOwnedRunner(r) {
 if (!r || !Number.isSafeInteger(r.runnerPid) || r.runnerPid <= 1 || !r.runtimeRoot) return false;
 try {
  const command = execFileSync("ps", ["-p", String(r.runnerPid), "-o", "command="], {encoding:"utf8", timeout:1500});
  return command.includes("unix-install-custody.cjs") && command.includes(r.runtimeRoot) && command.includes(" run ");
 } catch { return false; }
}
function cancelInstall() {
 const r=readReceipt();
 if (!r || r.terminal || !isOwnedRunner(r)) {
  process.stdout.write("No matching active installer to cancel; existing agent unchanged.\n");
  return;
 }
 process.kill(r.runnerPid, "SIGTERM");
 process.stdout.write(`Cancellation requested for installer runner PID ${r.runnerPid}.\n`);
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
