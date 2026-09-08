//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconConfig
 * @description
 * The Awtsmoos gathers real lexical sources beneath canonical Work Dayuh while candidate and current generations stay distinct;
 * Awtsmoos.com keeps legal source truth intact and makes temporary worktrees servants of code, never rival data precincts.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const checkoutRoot = fileURLToPath(new URL('../..', import.meta.url));

function canonicalRepositoryRoot(root = checkoutRoot) {
	const marker = `${path.sep}.ai-worktrees${path.sep}`;
	const position = root.indexOf(marker);
	return position >= 0 ? root.slice(0, position) : root;
}

export const DEFAULT_ROOT = path.join(canonicalRepositoryRoot(), 'dayuhChadash', 'torah-sources', 'lexicons');
export const SOURCES = Object.freeze({
	bdb: {
		id: 'bdb',
		title: 'Brown-Driver-Briggs Hebrew Lexicon',
		language: 'Biblical Hebrew / Aramaic',
		provider: 'Open Scriptures Hebrew Lexicon',
		license: 'CC BY 4.0; historical BDB text is public domain',
		sourceUrl: 'https://github.com/openscriptures/HebrewLexicon',
		downloadUrl: 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/BrownDriverBriggs.xml'
	},
	yiddish: {
		id: 'yiddish-wiktionary',
		title: 'Yiddish Wiktionary Lexicon',
		language: 'Yiddish',
		provider: 'Kaikki / Wiktextract / English Wiktionary',
		license: 'CC BY-SA and GFDL',
		sourceUrl: 'https://kaikki.org/dictionary/Yiddish/',
		downloadUrl: 'https://kaikki.org/dictionary/Yiddish/kaikki.org-dictionary-Yiddish.jsonl'
	}
});

export function outputRoot(cliRoot = '') {
	return path.resolve(cliRoot || process.env.AWTSMOOS_LEXICON_ROOT || DEFAULT_ROOT);
}

export function generationPaths(root) {
	return {
		current: path.join(root, 'current'),
		candidate: path.join(root, 'candidate'),
		previous: path.join(root, 'previous')
	};
}
