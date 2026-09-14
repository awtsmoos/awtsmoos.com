//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahLexiconConfig
 * @description
 * Three independently sourced dictionaries enter Awtsmoos through completed
 * native source databases and publish into immutable serving generations.
 * Provenance stays exact while storage and public presentation stay provider-neutral.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const checkoutRoot = fileURLToPath(new URL('../..', import.meta.url));

/** Resolves the canonical repository when tooling is invoked from an agent worktree. */
function canonicalRepositoryRoot(root = checkoutRoot) {
	const marker = `${path.sep}.ai-worktrees${path.sep}`;
	const position = root.indexOf(marker);
	return position >= 0 ? root.slice(0, position) : root;
}

const repositoryRoot = canonicalRepositoryRoot();
export const DEFAULT_ROOT = path.join(
	repositoryRoot,
	'dayuhChadash',
	'torah-sources',
	'lexicons'
);
export const DEFAULT_SOURCE_ROOT = path.join(
	repositoryRoot,
	'dayuhChadash',
	'torah-sources',
	'lexicon-sources'
);
export const SOURCES = Object.freeze({
	bdb: {
		id: 'bdb',
		title: 'Brown-Driver-Briggs Hebrew Lexicon',
		language: 'Biblical Hebrew / Aramaic',
		provider: 'Open Scriptures Hebrew Lexicon',
		license: 'CC BY 4.0; historical BDB text is public domain',
		sourceUrl: 'https://github.com/openscriptures/HebrewLexicon'
	},
	jastrow: {
		id: 'jastrow',
		title: 'Jastrow Dictionary',
		language: 'Talmudic Hebrew / Aramaic',
		provider: 'Sefaria / National Library of Israel',
		license: 'Public Domain',
		sourceUrl: 'https://www.sefaria.org/Jastrow',
		version: 'London, Luzac, 1903',
		upstreamLexicon: 'Jastrow Dictionary'
	},
	yiddish: {
		id: 'yiddish-wiktionary',
		title: 'Yiddish Wiktionary Lexicon',
		language: 'Yiddish',
		provider: 'Kaikki / Wiktextract / English Wiktionary',
		license: 'CC BY-SA and GFDL',
		sourceUrl: 'https://kaikki.org/dictionary/Yiddish/'
	}
});

/** Resolves the serving-generation root from CLI, environment, or canonical Dayuh. */
export function outputRoot(cliRoot = '') {
	return path.resolve(cliRoot || process.env.AWTSMOOS_LEXICON_ROOT || DEFAULT_ROOT);
}

/** Resolves the native source-database root independently from serving output. */
export function sourceRoot(cliRoot = '') {
	return path.resolve(
		cliRoot
		|| process.env.AWTSMOOS_LEXICON_SOURCE_ROOT
		|| DEFAULT_SOURCE_ROOT
	);
}

/** Names immutable candidate/current/previous serving-generation directories. */
export function generationPaths(root) {
	return {
		current: path.join(root, 'current'),
		candidate: path.join(root, 'candidate'),
		previous: path.join(root, 'previous')
	};
}
