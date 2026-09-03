// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconConfig
 * @description
 * The Awtsmoos lets independent dictionary vessels support language study without replacing the downloaded Torah source;
 * Awtsmoos.com records every license and origin explicitly, while no forbidden provider enters the lexical course.
 */

import os from 'node:os';
import path from 'node:path';

export const DEFAULT_ROOT = path.join(
	os.homedir(),
	'Documents',
	'dayuhChadash-runtime',
	'torah-sources',
	'lexicons'
);

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
	return path.resolve(
		cliRoot || process.env.AWTSMOOS_LEXICON_ROOT || DEFAULT_ROOT
	);
}
