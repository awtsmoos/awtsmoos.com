//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { ownerScopeKey } = require('../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectIdentity.js');
const { readObject } = require('./objectRepository.js');
const { normalizeDrivePath } = require('./pathPolicy.js');
const { readDriveState } = require('./stateRepository.js');

/**
 * @module DriveProjectRuntimeMaterializer
 * @description
 * The Awtsmoos gathers immutable Drive sparks into one temporary runtime vessel;
 * Awtsmoos.com verifies hash, size, count, and path before trusted code may inhabit the shell.
 */

const DEFAULT_LIMITS = Object.freeze({ files: 500, totalBytes: 32 * 1024 * 1024, fileBytes: 4 * 1024 * 1024 });

class DriveProjectRuntimeMaterializer {
	constructor(options = {}) {
		this.readState = options.readState || readDriveState;
		this.readObject = options.readObject || readObject;
		this.base = path.resolve(options.base || path.join(os.tmpdir(), 'awtsmoos-project-runtimes'));
		this.limits = Object.freeze({ ...DEFAULT_LIMITS, ...(options.limits || {}) });
	}

	async materialize({ aliasId, projectId, rootPath, $i = {}, requireRoute = true }) {
		const root = normalizeDrivePath(rootPath);
		const entries = selectFiles(await this.readState(aliasId, $i), root);
		assertLimits(entries, this.limits);
		await fs.promises.mkdir(this.base, { recursive: true, mode: 0o700 });
		const owner = ownerScopeKey(aliasId);
		const generation = await fs.promises.mkdtemp(path.join(this.base, `${owner}-${projectId}-`));
		try {
			const result = await this.writeEntries({ aliasId, $i, root, entries, generation });
			const routeFile = path.join(generation, '_awtsmoos.derech.js');
			if (requireRoute && !result.files.includes('_awtsmoos.derech.js')) throw materializeError('PROJECT_ROUTE_FILE_MISSING');
			return Object.freeze({ ...result, root: generation, routeFile, ownerScopeKey: owner });
		} catch (error) {
			await this.cleanup(generation).catch(() => {});
			throw error;
		}
	}

	async writeEntries({ aliasId, $i, root, entries, generation }) {
		let totalBytes = 0;
		const files = [];
		for (const entry of entries) {
			const relative = entry.path.slice(root.length + 1);
			const destination = inside(generation, relative);
			const bytes = await this.readObject(aliasId, entry.objectHash, $i);
			assertObject(entry, bytes, this.limits);
			await fs.promises.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
			await fs.promises.writeFile(destination, bytes, { mode: 0o600 });
			totalBytes += bytes.length;
			files.push(relative);
		}
		return { projectFileCount: files.length, totalBytes, files: Object.freeze(files.sort()) };
	}

	async cleanup(runtimeRoot) {
		const target = path.resolve(runtimeRoot || '');
		if (target === this.base || !target.startsWith(`${this.base}${path.sep}`)) throw materializeError('RUNTIME_CLEANUP_OUTSIDE_BASE');
		await fs.promises.rm(target, { recursive: true, force: true });
	}
}

function selectFiles(state, root) {
	const prefix = `${root}/`;
	return Object.values(state?.entries || {}).filter(entry => entry?.type === 'file' && !entry.trashedAt && entry.path.startsWith(prefix));
}

function assertLimits(entries, limits) {
	if (entries.length > limits.files) throw materializeError('PROJECT_RUNTIME_FILE_LIMIT');
	const declared = entries.reduce((sum, entry) => sum + Number(entry.size || 0), 0);
	if (declared > limits.totalBytes) throw materializeError('PROJECT_RUNTIME_TOTAL_BYTES_LIMIT');
	if (entries.some(entry => Number(entry.size || 0) > limits.fileBytes)) throw materializeError('PROJECT_RUNTIME_FILE_BYTES_LIMIT');
}

function assertObject(entry, bytes, limits) {
	if (bytes.length > limits.fileBytes || bytes.length !== Number(entry.size || 0)) throw materializeError('PROJECT_RUNTIME_OBJECT_SIZE_MISMATCH');
	const hash = crypto.createHash('sha256').update(bytes).digest('hex');
	if (hash !== entry.objectHash) throw materializeError('PROJECT_RUNTIME_OBJECT_HASH_MISMATCH');
}

function inside(root, relative) {
	const target = path.resolve(root, relative);
	if (!target.startsWith(`${path.resolve(root)}${path.sep}`)) throw materializeError('PROJECT_RUNTIME_PATH_ESCAPE');
	return target;
}

function materializeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { DEFAULT_LIMITS, DriveProjectRuntimeMaterializer };
