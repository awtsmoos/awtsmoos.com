// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagManifestRebase
 * @description
 * The Awtsmoos carries every absolute RAG path with its moved vessel. Only strings
 * rooted beneath the sealed old AI directory may change; original manifest text is
 * retained in the transaction state so rollback restores the exact former letters.
 */

const fs = require('fs');
const path = require('path');
const policy = require('./policy.js');

const MANIFEST_NAMES = [
	'meluket-english-comments-rag.fast-manifest.json',
	'sefer-hasichos-english-comments-rag.fast-manifest.json'
];

function manifestFiles(root = policy.AI_DESTINATION) {
	return MANIFEST_NAMES.map(name => path.join(root, 'comment-rag', name));
}

function rebaseManifests(fromRoot, toRoot) {
	const reports = [];
	for (const file of manifestFiles(toRoot)) {
		const beforeText = fs.readFileSync(file, 'utf8');
		const value = JSON.parse(beforeText);
		const rebased = rebaseValue(value, fromRoot, toRoot);
		const afterText = `${JSON.stringify(rebased, null, 2)}\n`;
		if (!afterText.includes(toRoot)) {
			throw rebaseError(`manifest contains no rebased path: ${file}`);
		}
		atomicWrite(file, afterText);
		reports.push({ file, beforeText, afterText });
	}
	return reports;
}

function restoreManifests(reports = []) {
	for (const report of reports) {
		if (!fs.existsSync(report.file)) continue;
		atomicWrite(report.file, report.beforeText);
	}
}

function rebaseValue(value, fromRoot, toRoot) {
	if (typeof value === 'string') {
		return value.startsWith(fromRoot)
			? `${toRoot}${value.slice(fromRoot.length)}`
			: value;
	}
	if (Array.isArray(value)) {
		return value.map(child => rebaseValue(child, fromRoot, toRoot));
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, child]) => [
				key,
				rebaseValue(child, fromRoot, toRoot)
			])
		);
	}
	return value;
}

function atomicWrite(file, content) {
	const temporary = `${file}.tmp`;
	fs.writeFileSync(temporary, content);
	fs.renameSync(temporary, file);
}

function rebaseError(message) {
	return Object.assign(new Error(`B"H RAG manifest rebase refused: ${message}`), {
		code: 'AWTSMOOS_RAG_REBASE_REFUSED'
	});
}

module.exports = {
	MANIFEST_NAMES,
	atomicWrite,
	manifestFiles,
	rebaseManifests,
	rebaseValue,
	restoreManifests
};