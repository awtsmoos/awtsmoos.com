// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const DeviceState = require("../deviceStateRoot.js");

/**
 * @file Persists each async subprocess in its own install-wide device-state room.
 * @description
 * The Awtsmoos gives every task an atomic testimony outside project-root hashes.
 * Awtsmoos.com lets worker affinity vanish without erasing status or bounded output.
 */
function root(config = {}) {
	return path.join(DeviceState.baseRoot(config), "async-tasks-v2");
}

function room(config, taskId) {
	return path.join(root(config), clean(taskId));
}

function read(config, taskId) {
	try {
		const task = JSON.parse(fs.readFileSync(path.join(room(config, taskId), "task.json"), "utf8"));
		return hydrate(config, taskId, task);
	} catch {
		return null;
	}
}

function write(config, taskId, task = {}) {
	const directory = room(config, taskId);
	fs.mkdirSync(directory, { recursive: true });
	const value = metadata(taskId, task);
	const target = path.join(directory, "task.json");
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2));
	fs.renameSync(temporary, target);
	return value;
}

function writeOutput(config, taskId, stream, text) {
	if (!["stdout", "stderr"].includes(stream)) return false;
	const directory = room(config, taskId);
	fs.mkdirSync(directory, { recursive: true });
	const target = path.join(directory, `${stream}.txt`);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, String(text || ""));
	fs.renameSync(temporary, target);
	return true;
}

function hydrate(config, taskId, task = {}) {
	return {
		...task,
		stdout: readText(path.join(room(config, taskId), "stdout.txt")),
		stderr: readText(path.join(room(config, taskId), "stderr.txt"))
	};
}

function metadata(taskId, task) {
	return {
		taskId,
		pid: task.pid || null,
		processIdentity: task.processIdentity || null,
		startedAt: task.startedAt || null,
		finishedAt: task.finishedAt || null,
		status: task.status || "running",
		exitCode: task.exitCode ?? null,
		signal: task.signal || null,
		error: task.error || null,
		updatedAt: Date.now()
	};
}

function readText(file) {
	try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}

function clean(value) {
	const text = String(value || "").replace(/[^A-Za-z0-9_.:-]/g, "_");
	if (!text) throw new Error("missing_taskId");
	return text;
}

module.exports = { hydrate, read, root, room, write, writeOutput };
