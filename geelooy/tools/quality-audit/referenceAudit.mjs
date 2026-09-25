//B"H
// Boruch Hashem
// Blessed is He
/** Builds one reference index, then reports apparently unused generations as review candidates only. */
import fs from 'node:fs';
import path from 'node:path';
import { trackedFiles, trackedSourceFiles } from './trackedFiles.mjs';

const TEXT_EXTENSIONS = ['.html', '.css', '.js', '.mjs'];
const CANDIDATE_ROOTS = ['geelooy/style/', 'geelooy/scripts/awtsmoos/social/'];
const REFERENCE_PATTERN = /["'`](\/?[^"'`\s]+?\.(?:css|js|mjs)(?:\?[^"'`\s]*)?)["'`]/g;

export function scanReferenceCandidates() {
	const references = buildReferenceIndex();
	return trackedFiles()
		.filter(file => CANDIDATE_ROOTS.some(root => file.startsWith(root)))
		.filter(file => /\.(css|js|mjs)$/.test(file))
		.filter(file => !/\/test\//.test(file) && !/\.test\.(js|mjs)$/.test(file))
		.filter(file => !isReferenced(file, references))
		.map(file => ({ file, webPath: `/${file.replace(/^geelooy\//, '')}`, kind: 'apparently-unreferenced' }));
}

function buildReferenceIndex() {
	const references = new Set();
	for (const file of trackedSourceFiles(TEXT_EXTENSIONS)) {
		if (!fs.existsSync(file)) continue;
		const source = fs.readFileSync(file, 'utf8');
		for (const match of source.matchAll(REFERENCE_PATTERN)) {
			const clean = match[1].replace(/^\//, '').split('?')[0];
			references.add(clean);
			references.add(path.basename(clean));
		}
	}
	return references;
}

function isReferenced(file, references) {
	const geelooyRelative = file.replace(/^geelooy\//, '');
	return references.has(file) || references.has(geelooyRelative) || references.has(path.basename(file));
}
