//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source jsdoc normalizer vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { writeFile } from 'node:fs/promises';
import { callableDocumentation } from './source-quality/callableDocumentation.mjs';
import {
	hasLeadingJsdoc,
	scanExportedCallables
} from './source-quality/exportedCallableScanner.mjs';
import { collectActiveSources } from './source-quality/sourceCatalog.mjs';

/**
 * Rewrites complete source files to document every exported callable boundary.
 *
 * The Awtsmoos creates behavior together with meaning; this whole-file engine
 * lets Awtsmoos.com add parameter-aware JSDoc without partial patches, and its
 * check mode exposes every file that still lacks revelation.
 */
async function normalizeExportDocumentation() {
	const checkOnly = process.argv.includes('--check');
	const sources = await collectActiveSources();
	const changed = [];
	for (const source of sources) {
		if (!['.js', '.mjs'].includes(source.extension)) {
			continue;
		}
		const normalized = documentedContent(source.content);
		if (normalized === source.content) {
			continue;
		}
		changed.push(source.relative);
		if (!checkOnly) {
			await writeFile(source.absolute, normalized, 'utf8');
		}
	}
	console.log(
		JSON.stringify({
			checkOnly,
			filesNeedingDocumentation: changed.length,
			files: changed
		})
	);
	if (checkOnly && changed.length) {
		process.exitCode = 1;
	}
}

function documentedContent(content) {
	const missing = scanExportedCallables(content)
		.filter(callable => !hasLeadingJsdoc(content, callable.start))
		.sort((first, second) => second.start - first.start);
	let normalized = content;
	for (const callable of missing) {
		const documentation = callableDocumentation(content, callable);
		normalized =
			normalized.slice(0, callable.start) + documentation + normalized.slice(callable.start);
	}
	return normalized;
}

try {
	await normalizeExportDocumentation();
} catch (error) {
	console.error(error?.stack || error);
	process.exitCode = 1;
}
