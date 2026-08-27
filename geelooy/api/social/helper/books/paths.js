// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookExportPaths
 * @description Persistent book artifacts receive random names outside immutable releases.
 */
const crypto = require('crypto');
const path = require('path');
const { slug } = require('./html.js');

const JOB_ID = /^[a-f0-9]{32}$/;
const FILE_NAME = /^[\p{L}\p{N}._-]{1,180}$/u;

function exportRoot() {
	if (process.env.AWTSMOOS_BOOK_EXPORT_ROOT) {
		return path.resolve(process.env.AWTSMOOS_BOOK_EXPORT_ROOT);
	}
	return path.resolve(process.cwd(), 'geelooy', '.data', 'book-exports');
}

function newJobId() {
	return crypto.randomBytes(16).toString('hex');
}

function validJobId(jobId) {
	return JOB_ID.test(String(jobId || ''));
}

function jobDir(jobId) {
	if (!validJobId(jobId)) throw new Error('Invalid book job ID.');
	return path.join(exportRoot(), jobId);
}

function safeFile(jobId, fileName) {
	const name = String(fileName || '');
	if (!FILE_NAME.test(name) || name.includes('..')) throw new Error('Invalid book file name.');
	const root = jobDir(jobId);
	const file = path.resolve(root, name);
	if (!file.startsWith(`${root}${path.sep}`)) throw new Error('Book file escaped job directory.');
	return file;
}

function bookFileName(index, title, seriesId) {
	const ordinal = String(index + 1).padStart(3, '0');
	return `${ordinal}-${slug(title)}-${slug(seriesId)}.html`;
}

module.exports = {
	bookFileName,
	exportRoot,
	jobDir,
	newJobId,
	safeFile,
	validJobId
};
