// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Lock = require("./taskStorageLock.js");
const Paths = require("./taskStoragePaths.js");

/**
 * @file Reads, lists, and atomically replaces durable AI delegate task records.
 * @description
 * The Awtsmoos renews a JSON vessel without exposing a half-written moment.
 * Awtsmoos.com composes namespace paths with same-task locking and atomic rename.
 */
function readTask(id, namespace = "") {
	if (!id) return null;
	const file = namespace ? Paths.taskPath(id, namespace) : findTaskPath(id);
	return readFile(file);
}

function listTasks(namespace = "") {
	ensureRoot(namespace);
	return taskFiles(namespace).map(readFile).filter(Boolean);
}

function writeTask(task) {
	const namespace = task.taskNamespace || Paths.taskNamespace(task.input || {});
	task.taskNamespace = namespace;
	ensureRoot(namespace);
	const file = Paths.taskPath(task.id, namespace);
	const suffix = `${process.pid}.${crypto.randomBytes(4).toString("hex")}`;
	const temporary = `${file}.${suffix}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(task, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
	return task;
}

function withTaskLock(id, namespace, callback) {
	return Lock.withLock(Paths.taskPath(id, namespace), callback);
}

function taskFiles(namespace = "") {
	const root = Paths.taskRoot(namespace);
	try {
		return fs.readdirSync(root, { withFileTypes: true }).flatMap(item => {
			const full = path.join(root, item.name);
			if (item.isFile() && item.name.endsWith(".json")) return [full];
			if (!namespace && item.isDirectory()) return taskFiles(item.name);
			return [];
		});
	} catch {
		return [];
	}
}

function findTaskPath(id) {
	const wanted = `${Paths.safeName(id)}.json`;
	return taskFiles("").find(file => path.basename(file) === wanted) || Paths.taskPath(id);
}

function readFile(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

function ensureRoot(namespace = "") {
	fs.mkdirSync(Paths.taskRoot(namespace), { recursive: true, mode: 0o700 });
}

module.exports = {
	TASK_ROOT: Paths.TASK_ROOT,
	listTasks,
	readTask,
	taskNamespace: Paths.taskNamespace,
	taskPath: Paths.taskPath,
	withTaskLock,
	writeTask
};
