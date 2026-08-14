// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");

/**
 * @file Gives every heavy async task a separate process body and lifecycle witness.
 * @description
 * The Awtsmoos lets the kernel remain a witness when one child burns. Awtsmoos.com
 * reports every bounded output and terminal transition to an optional durable observer.
 */
function spawnAsyncTask(options = {}) {
	const command = options.command || process.execPath;
	const args = Array.isArray(options.args) ? options.args : [];
	const cwd = options.cwd || process.cwd();
	const env = { ...process.env, ...(options.env || {}) };
	const child = childProcess.spawn(command, args, {
		cwd,
		detached: process.platform !== "win32",
		env,
		stdio: options.stdio || ["ignore", "pipe", "pipe"],
		windowsHide: true
	});
	const task = {
		pid: child.pid,
		command,
		args,
		cwd,
		startedAt: Date.now(),
		status: "running",
		stdout: "",
		stderr: "",
		exitCode: null,
		signal: null,
		terminalIntent: ""
	};
	notify(options, "state", task);
	const timer = setTimeout(
		() => killTask(task, child, "timeout", options),
		Number(options.timeoutMs || 300000)
	);
	timer.unref?.();
	bindOutput(child.stdout, task, "stdout", options);
	bindOutput(child.stderr, task, "stderr", options);
	child.on("exit", (code, signal) => {
		clearTimeout(timer);
		if (task.terminalIntent) task.status = task.terminalIntent;
		else task.status = code === 0 && !signal ? "completed" : "failed";
		task.exitCode = code;
		task.signal = signal;
		task.finishedAt = Date.now();
		notify(options, "state", task);
	});
	child.on("error", error => {
		clearTimeout(timer);
		task.status = task.terminalIntent || "failed";
		task.error = error.message;
		task.finishedAt = Date.now();
		notify(options, "state", task);
	});
	return {
		task,
		child,
		cancel: reason => killTask(task, child, reason || "cancelled", options)
	};
}

function bindOutput(stream, task, key, options) {
	stream?.on("data", chunk => {
		task[key] += chunk.toString();
		trim(task, key, options.maxOutput || 200000);
		notify(options, key, task);
	});
}

function trim(task, key, max) {
	if (task[key].length > max) task[key] = task[key].slice(-max);
}

function killTask(task, child, reason, options = {}) {
	if (task.status !== "running") return task;
	task.terminalIntent = reason || "cancelled";
	task.status = task.terminalIntent;
	task.finishedAt = Date.now();
	notify(options, "state", task);
	try {
		if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGTERM");
		else child.kill("SIGTERM");
	} catch {}
	setTimeout(() => {
		try {
			if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGKILL");
			else child.kill("SIGKILL");
		} catch {}
	}, 3000).unref?.();
	return task;
}

function notify(options, kind, task) {
	try { options.onUpdate?.(kind, task); } catch {}
}

module.exports = { killTask, spawnAsyncTask };
