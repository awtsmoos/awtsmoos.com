// B"H
// Boruch Hashem
// Blessed is He
/** @module ReleaseInventory @description Parses Git status and groups every path into explicit review trains. */
import { classifyArtifact } from '../release/artifactClass.mjs';
import { assignReleaseTrain } from './releaseRoutes.mjs';

export { assignReleaseTrain } from './releaseRoutes.mjs';

/** Parses one Git porcelain-v1 status line. */
export function parseStatusLine(line) {
	const raw = String(line || '');
	if (raw.length < 4) {
		return null;
	}
	const code = raw.slice(0, 2);
	const pathText = raw.slice(3).trim();
	const selected = pathText.includes(' -> ') ? pathText.split(' -> ').at(-1) : pathText;
	const path = decodeGitPath(selected);
	if (!path) {
		return null;
	}
	return Object.freeze({
		code,
		path,
		staged: code[0] !== ' ' && code[0] !== '?',
		untracked: code === '??',
		deleted: code.includes('D'),
		artifactKind: classifyArtifact(path),
		trainId: assignReleaseTrain(path)
	});
}

/** Builds a complete inventory from porcelain status text. */
export function buildReleaseInventory(statusText, input = {}) {
	const entries = String(statusText || '')
		.split(/\r?\n/)
		.map(parseStatusLine)
		.filter(Boolean);
	const trains = {};
	for (const entry of entries) {
		trains[entry.trainId] ||= { entries: [], artifactKinds: {} };
		trains[entry.trainId].entries.push(entry);
		trains[entry.trainId].artifactKinds[entry.artifactKind] =
			(trains[entry.trainId].artifactKinds[entry.artifactKind] || 0) + 1;
	}
	return Object.freeze({
		head: String(input.head || 'working-tree'),
		createdAt: String(input.createdAt || new Date().toISOString()),
		total: entries.length,
		staged: entries.filter(entry => entry.staged).length,
		untracked: entries.filter(entry => entry.untracked).length,
		deleted: entries.filter(entry => entry.deleted).length,
		trains: freezeTrains(trains)
	});
}

function freezeTrains(trains) {
	for (const train of Object.values(trains)) {
		train.entries = Object.freeze(train.entries);
		train.artifactKinds = Object.freeze(train.artifactKinds);
		Object.freeze(train);
	}
	return Object.freeze(trains);
}

function decodeGitPath(value) {
	const path = String(value || '').trim();
	if (!path.startsWith('"') || !path.endsWith('"')) {
		return path;
	}
	try {
		return JSON.parse(path);
	} catch {
		return path.slice(1, -1);
	}
}
