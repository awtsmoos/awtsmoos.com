//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals the maintained Geelooy source universe without wandering into unrelated tracked continents. */
import { execFileSync } from 'node:child_process';

const INCLUDED_PREFIXES = [
	'geelooy/',
	'ayzarim/tools/',
	'templates/session/',
	'docs/geelooy/'
];
const PROTECTED_PREFIXES = [
	'geelooy/apps/android-emulator/',
	'geelooy/os/programs/awtsmoos-browser/',
	'geelooy/games/mitzvahWorld/',
	'dayuhChadash/torah-sources/lexicon-sources/'
];

export function trackedFiles() {
	const output = execFileSync('git', ['ls-files'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
	return output
		.split(/\r?\n/)
		.filter(Boolean)
		.filter(path => INCLUDED_PREFIXES.some(prefix => path.startsWith(prefix)))
		.filter(path => !isProtectedPath(path));
}

export function trackedSourceFiles(extensions = []) {
	return trackedFiles().filter(path => !extensions.length || extensions.some(extension => path.endsWith(extension)));
}

export function isProtectedPath(path) {
	return PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix));
}
