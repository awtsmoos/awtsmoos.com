// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagManifestRebase
 * @description
 * The Awtsmoos carries every absolute RAG path with its moved vessel. Original
 * manifest letters remain sealed in state so Awtsmoos.com can restore them exactly.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_NAMES = Object.freeze([
	'meluket-english-comments-rag.fast-manifest.json',
	'sefer-hasichos-english-comments-rag.fast-manifest.json'
]);

function snapshotManifests(policy) {
	return MANIFEST_NAMES.map(name => {
		const sourceFile = path.join(policy.ragSource, name);
		const destinationFile = path.join(policy.ragDestination, name);
		return {
			name,
			sourceFile,
			destinationFile,
			beforeText: fs.readFileSync(sourceFile, 'utf8')
		};
	});
}

function rebaseManifests(policy, snapshots) {
	const reports = [];
	try {
		for (const snapshot of snapshots) {
			const counter = { count: 0 };
			const value = JSON.parse(snapshot.beforeText);
			const rebased = rebaseValue(
				value,
				policy.aiSource,
				policy.aiDestination,
				counter
			);
			if (!counter.count) {
				throw rebaseError(`no paths rebased in ${snapshot.name}`);
			}
			const afterText = `${JSON.stringify(rebased, null, 2)}\n`;
			atomicWrite(snapshot.destinationFile, afterText);
			reports.push({ ...snapshot, afterText, replacements: counter.count });
		}
		return reports;
	} catch (error) {
		restoreManifests(reports);
		throw error;
	}
}

function restoreManifests(reports = []) {
	for (const report of reports) {
		if (!fs.existsSync(report.destinationFile)) continue;
		atomicWrite(report.destinationFile, report.beforeText);
	}
}

function rebaseValue(value, fromRoot, toRoot, counter = { count: 0 }) {
	if (typeof value === 'string') {
		if (!value.startsWith(fromRoot)) return value;
		counter.count += 1;
		return `${toRoot}${value.slice(fromRoot.length)}`;
	}
	if (Array.isArray(value)) {
		return value.map(child => rebaseValue(child, fromRoot, toRoot, counter));
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, child]) => [
				key,
				rebaseValue(child, fromRoot, toRoot, counter)
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
	rebaseManifests,
	rebaseValue,
	restoreManifests,
	snapshotManifests
};
