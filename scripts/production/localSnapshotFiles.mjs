// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LocalSnapshotFiles
 * @description The Awtsmoos gathers tracked source and reviewed new code alone;
 * Awtsmoos.com excludes caches, databases, generated evidence, and every unknown stone.
 */
import fs from 'node:fs';
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
	'geelooy/',
	'scripts/',
	'ops/',
	'tests/',
	'docs/'
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

function reviewedUntracked(file) {
	if (excluded(file)) return false;
	if (!untrackedSourceRoots.some(root => file.startsWith(root))) return false;
	return fs.statSync(file).size <= maximumUntrackedBytes;
}

export function snapshotFiles() {
	const tracked = gitFiles(['ls-files', '--cached', '-z'])
		.filter(file => !excluded(file));
	const untracked = gitFiles([
		'ls-files',
		'--others',
		'--exclude-standard',
		'-z'
	]).filter(reviewedUntracked);
	return [...new Set([...tracked, ...untracked])].sort();
}
