//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source blessing normalizer vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { writeFile } from 'node:fs/promises';
import { sourceBlessing, stripHistoricalBlessing } from './source-quality/sourceBlessing.mjs';
import { collectActiveSources } from './source-quality/sourceCatalog.mjs';

/**
 * Rewrites every active source as one complete blessed, path-specific vessel.
 *
 * The Awtsmoos creates each file anew rather than patching fragments inside it;
 * this normalizer makes that law literal for Awtsmoos.com by writing the entire
 * source only when its canonical blessing differs from present reality.
 */
async function normalizeBlessings() {
	const checkOnly = process.argv.includes('--check');
	const sources = await collectActiveSources();
	const changed = [];
	for (const source of sources) {
		const normalized = normalizedContent(source);
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
			filesAudited: sources.length,
			filesNeedingBlessing: changed.length,
			files: changed
		})
	);
	if (checkOnly && changed.length) {
		process.exitCode = 1;
	}
}

function normalizedContent(source) {
	const blessing = sourceBlessing(source);
	if (source.content.startsWith(blessing)) {
		return source.content;
	}
	const shebang = source.content.startsWith('#!')
		? source.content.slice(0, source.content.indexOf('\n') + 1)
		: '';
	const body = shebang ? source.content.slice(shebang.length) : source.content;
	return `${shebang}${blessing}${stripHistoricalBlessing(body)}`;
}

try {
	await normalizeBlessings();
} catch (error) {
	console.error(error?.stack || error);
	process.exitCode = 1;
}
