#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { spawn } = require("node:child_process");
const Paths = require("./unix-recovery-lane-paths.cjs");

/**
 * @file Detaches one bounded local recovery lane into its own process group.
 * @description
 * The Awtsmoos lets a helper depart the installer's breath while preserving exact roots;
 * Awtsmoos.com validates entry, logs, and PID testimony before the detached witness takes route.
 */
function startRecoveryLane(argumentsList = process.argv.slice(2)) {
	const [installValue, recoveryValue, entryValue, pidValue, stdoutValue, stderrValue] = argumentsList;
	const installRoot = Paths.requiredDirectory(installValue, "install_root");
	const recoveryRoot = Paths.requiredDirectory(recoveryValue, "recovery_root");
	const entry = Paths.requiredFileWithin(installRoot, entryValue, "entry");
	const pidFile = Paths.requiredPathWithin(recoveryRoot, pidValue, "pid_file");
	const stdout = Paths.requiredPathWithin(recoveryRoot, stdoutValue, "stdout_log");
	const stderr = Paths.requiredPathWithin(recoveryRoot, stderrValue, "stderr_log");
	const output = fs.openSync(stdout, "a", 0o600);
	const errors = fs.openSync(stderr, "a", 0o600);
	let child;
	try {
		child = spawn(process.execPath, [entry], {
			cwd: installRoot,
			detached: true,
			env: recoveryEnvironment(installRoot, recoveryRoot),
			stdio: ["ignore", output, errors]
		});
		if (!Number.isInteger(child.pid) || child.pid <= 1) {
			throw new Error("recovery_lane_spawn_failed");
		}
		writeAtomic(pidFile, `${child.pid}\n`);
		child.unref();
		return child.pid;
	} finally {
		fs.closeSync(output);
		fs.closeSync(errors);
	}
}

/** Keeps each local lane bounded to the same verified target and recovery roots. */
function recoveryEnvironment(installRoot, recoveryRoot) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_RECOVERY_ROOT: recoveryRoot,
		AWTSMOOS_TARGET_INSTALL_ROOT: installRoot,
		AWTSMOOS_TARGET_RECOVERY_ROOT: recoveryRoot
	};
}

function writeAtomic(file, text) {
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, text, { mode: 0o600 });
	fs.renameSync(temporary, file);
}

if (require.main === module) {
	try {
		process.stdout.write(`${startRecoveryLane()}\n`);
	} catch (error) {
		process.stderr.write(`${String(error?.message || error)}\n`);
		process.exitCode = 1;
	}
}

module.exports = { recoveryEnvironment, startRecoveryLane, writeAtomic };
