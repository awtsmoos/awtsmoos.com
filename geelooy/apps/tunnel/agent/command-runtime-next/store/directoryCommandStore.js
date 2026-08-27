// B"H
const fs = require("node:fs/promises");
const path = require("node:path");
const { readJson, removeTemporaryFiles, writeJsonAtomic } = require("./atomicJson.js");
const { withFileLock } = require("./fileLock.js");

/**
 * B"H — Each job owns one small directory. Status reads one metadata scroll;
 * startup walks entries as a stream, never loading ancient output into memory.
 */
function createDirectoryCommandStore(options = {}) {
	const root = path.resolve(String(options.root || ""));
	if (!root) throw failure("missing_command_store_root");

	async function initialize() {
		await fs.mkdir(root, { recursive: true, mode: 0o700 });
		await removeTemporaryFiles(root);
		return root;
	}

	async function create(record) {
		await initialize();
		const paths = jobPaths(record.jobId);
		await fs.mkdir(paths.directory, { recursive: true, mode: 0o700 });
		return withFileLock(paths.lock, async () => {
			const existing = await readJson(paths.meta);
			if (existing) return { created: false, record: existing };
			await writeJsonAtomic(paths.meta, record);
			return { created: true, record: structuredClone(record) };
		});
	}

	async function get(jobId) {
		return readJson(jobPaths(jobId).meta);
	}

	async function replace(jobId, nextValue, expectedRevision) {
		const paths = jobPaths(jobId);
		return withFileLock(paths.lock, async () => {
			const current = await readJson(paths.meta);
			if (!current) throw failure("command_job_not_found");
			if (expectedRevision !== undefined && Number(current.revision) !== Number(expectedRevision)) {
				throw failure("command_revision_conflict", { currentRevision: current.revision });
			}
			const next = typeof nextValue === "function" ? await nextValue(structuredClone(current)) : nextValue;
			await writeJsonAtomic(paths.meta, next);
			return structuredClone(next);
		});
	}

	async function remove(jobId) {
		await fs.rm(jobPaths(jobId).directory, { recursive: true, force: true });
	}

	async function *iterate() {
		await initialize();
		const directory = await fs.opendir(root);
		for await (const entry of directory) {
			if (!entry.isDirectory() || !entry.name.startsWith("cmd_")) continue;
			const record = await get(entry.name).catch(() => null);
			if (record) yield record;
		}
	}

	function jobPaths(jobId) {
		const clean = cleanId(jobId);
		const directory = path.join(root, clean);
		return {
			directory,
			meta: path.join(directory, "meta.json"),
			lock: path.join(directory, "meta.lock"),
			stdout: path.join(directory, "stdout.log"),
			stderr: path.join(directory, "stderr.log"),
			outputMeta: path.join(directory, "output.json")
		};
	}

	return { create, get, initialize, iterate, jobPaths, remove, replace, root };
}

function cleanId(value) {
	const clean = String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
	if (!clean) throw failure("invalid_command_job_id");
	return clean;
}

function failure(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { createDirectoryCommandStore };
