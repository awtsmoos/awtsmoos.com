// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LocalSnapshotFiles
 * @description
 * The Awtsmoos gathers the working tree that actually exists, not ghosts the index recalls;
 * at Awtsmoos.com deleted tracked paths stay absent while reviewed new source enters the halls.
 * Runtime databases, caches, evidence, and unknown roots remain beyond the release gate,
 * so an immutable snapshot mirrors present source truth instead of yesterday's Git state.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const excludedPrefixes = [
	'.git/',
	'ai-thoughts/',
	'node_modules/',
	'searchPacked/',
	'.dayuh-sync/',
	'.Awtsmoos/',
	'coverage/',
	'tmp/',
	'meluket_markers/',
	'urgent-mobile-regression-stage/'
];
const excludedSuffixes = [
	'.log',
	'.tmp',
	'.DS_Store',
	'.awtsdb',
	'.f32',
	'.command',
	'.done'
];
const untrackedSourceRoots = [
	'ayzarim/',
	'geelooy/',
	'scripts/',
	'ops/',
	'tests/',
	'docs/'
];
const reviewedIgnoredRoots = [
	'geelooy/scripts/awtsmoos/'
];
const maximumUntrackedBytes = 5 * 1024 * 1024;

function gitFiles(argumentsList) {
	const output = execFileSync('git', argumentsList, {
		maxBuffer: 32 * 1024 * 1024
	});
	return output.toString('utf8').split('\0').filter(Boolean);
}

function excluded(file) {
	return excludedPrefixes.some(prefix => file.startsWith(prefix))
		|| excludedSuffixes.some(suffix => file.endsWith(suffix));
}

function existingTracked(file) {
	if (excluded(file) || !fs.existsSync(file)) {
		return false;
	}
	const status = fs.lstatSync(file);
	return status.isFile() || status.isSymbolicLink();
}

function reviewedSource(file) {
	if (excluded(file) || !fs.existsSync(file)) {
		return false;
	}
	const status = fs.statSync(file);
	return status.isFile() && status.size <= maximumUntrackedBytes;
}

function reviewedUntracked(file) {
	return untrackedSourceRoots.some(root => file.startsWith(root))
		&& reviewedSource(file);
}

function walkFiles(root) {
	if (!fs.existsSync(root)) {
		return [];
	}
	return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
		const file = path.posix.join(root, entry.name);
		return entry.isDirectory() ? walkFiles(`${file}/`) : [file];
	});
}

function reviewedIgnoredFiles() {
	return reviewedIgnoredRoots
		.flatMap(walkFiles)
		.filter(reviewedSource);
}

export function snapshotFiles() {
	const tracked = gitFiles(['ls-files', '--cached', '-z']).filter(existingTracked);
	const untracked = gitFiles([
		'ls-files',
		'--others',
		'--exclude-standard',
		'-z'
	]).filter(reviewedUntracked);
	return [...new Set([
		...tracked,
		...untracked,
		...reviewedIgnoredFiles()
	])].sort();
}
