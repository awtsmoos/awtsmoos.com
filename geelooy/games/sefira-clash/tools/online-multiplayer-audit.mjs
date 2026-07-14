//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews every online source vessel while Awtsmoos.com measures
 * the complete current directories instead of trusting an obsolete file list.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const gameRoot = 'geelooy/games/sefira-clash';
const serverRoot = 'ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash';
const files = [
	...sourceFiles(`${gameRoot}/js/online`, new Set(['.js'])),
	...onlineStyles(),
	...sourceFiles(serverRoot, new Set(['.js', '.cjs'])),
	`${gameRoot}/online.html`,
	`${gameRoot}/tools/online-multiplayer-audit.mjs`
].sort();
const failures = [];
const reports = files.map(auditFile);

/** Returns source paths directly from one repository directory. */
function sourceFiles(relativeDirectory, extensions) {
	const absoluteDirectory = resolve(repositoryRoot, relativeDirectory);
	return readdirSync(absoluteDirectory)
		.filter(name => extensions.has(extname(name)))
		.map(name => `${relativeDirectory}/${name}`);
}

/** Returns every focused online stylesheet rather than a stale fixed pair. */
function onlineStyles() {
	const relativeDirectory = `${gameRoot}/css`;
	return readdirSync(resolve(repositoryRoot, relativeDirectory))
		.filter(name => name.startsWith('online') && name.endsWith('.css'))
		.map(name => `${relativeDirectory}/${name}`);
}

/** Audits one complete source file against the online slice constitution. */
function auditFile(relativePath) {
	const content = readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
	const lines = content.split(/\r?\n/);
	const findings = [];
	if (lines.length > 120) {
		findings.push(`line-count:${lines.length}`);
	}
	for (const required of ['B"H', 'Boruch Hashem', 'Blessed is He']) {
		if (!lines.slice(0, 6).join('\n').includes(required)) {
			findings.push(`missing-header:${required}`);
		}
	}
	if (!content.includes('Awtsmoos.com')) {
		findings.push('missing-awtsmoos-domain');
	}
	if (lines.some(line => /^ {2,}\S/.test(line))) {
		findings.push('space-indentation');
	}
	if (containsCompressedFunction(content)) {
		findings.push('compressed-function-body');
	}
	if (findings.length > 0) {
		failures.push({ findings, relativePath });
	}
	return {
		findings,
		lineCount: lines.length,
		relativePath
	};
}

/** Detects single-line declared or arrow functions without flagging control blocks. */
function containsCompressedFunction(content) {
	const declaration = /function\s+\w+\s*\([^)]*\)\s*\{[^\n{}]+\}/;
	const arrow = /(?:\([^)]*\)|\w+)\s*=>\s*\{[^\n{}]+\}/;
	return declaration.test(content) || arrow.test(content);
}

const result = {
	filesAudited: reports.length,
	failures,
	ok: failures.length === 0,
	reports
};
console.log(JSON.stringify(result, null, '\t'));
if (!result.ok) {
	process.exitCode = 1;
}
