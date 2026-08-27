// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookJobStore
 * @description Atomic files let a detached generation job survive service restarts and release switches.
 */
const fs = require('fs');
const path = require('path');
const { exportRoot, jobDir, newJobId } = require('./paths.js');

function jsonFile(dir, name) {
	return path.join(dir, `${name}.json`);
}

function atomicJson(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
	fs.renameSync(temporary, file);
	return value;
}

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function create(config) {
	fs.mkdirSync(exportRoot(), { recursive: true });
	const jobId = newJobId();
	const dir = jobDir(jobId);
	fs.mkdirSync(dir, { recursive: false });
	const createdAt = Date.now();
	atomicJson(jsonFile(dir, 'config'), { ...config, jobId, createdAt });
	atomicJson(jsonFile(dir, 'status'), {
		jobId,
		state: 'queued',
		createdAt,
		updatedAt: createdAt,
		completedBooks: 0,
		totalBooks: null,
		files: []
	});
	return { jobId, dir };
}

function config(jobId) {
	return readJson(jsonFile(jobDir(jobId), 'config'));
}

function status(jobId) {
	return readJson(jsonFile(jobDir(jobId), 'status'));
}

function update(jobId, patch) {
	const current = status(jobId);
	return atomicJson(jsonFile(jobDir(jobId), 'status'), {
		...current,
		...patch,
		updatedAt: Date.now()
	});
}

function writeManifest(jobId, manifest) {
	return atomicJson(jsonFile(jobDir(jobId), 'manifest'), manifest);
}

function manifest(jobId) {
	return readJson(jsonFile(jobDir(jobId), 'manifest'));
}

module.exports = {
	atomicJson,
	config,
	create,
	manifest,
	status,
	update,
	writeManifest
};
