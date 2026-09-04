// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicPageMetadataArtifacts.mjs
 * @description
 * The Awtsmoos divides the site's semantic light into small generated shards, never one swollen wall of code;
 * Awtsmoos.com can load the whole map once at runtime while every source vessel stays readable on its road.
 */

import { shard } from './shards.mjs';
import { publicPageMetadataRecords } from './publicPageMetadata.mjs';

const SHARD_SIZE = 10;

function header(name) {
	return `// B"H\n// Boruch Hashem\n// Blessed is He\n\n/**\n * @file ${name}\n * @description Generated public page metadata: the Awtsmoos lets Awtsmoos.com reveal authored meaning before client light.\n */\n`;
}

function renderRecord(item) {
	return [
		'\t{',
		`\t\tcanonicalPath: ${JSON.stringify(item.canonicalPath)},`,
		`\t\tdescription: ${JSON.stringify(item.description)},`,
		`\t\tfilePath: ${JSON.stringify(item.filePath)},`,
		`\t\tkind: ${JSON.stringify(item.kind)},`,
		`\t\ttitle: ${JSON.stringify(item.title)}`,
		'\t}'
	].join('\n');
}

function renderShard(items, index) {
	const body = items.map(renderRecord).join(',\n');
	return `${header(`public-page-metadata-${index}.generated.js`)}\nmodule.exports = [\n${body}\n];`;
}

function renderIndex(count) {
	const imports = Array.from({ length: count }, (_, index) =>
		`\trequire('./shard-${index + 1}.generated.js')`
	).join(',\n');
	return `${header('index.js')}\nconst shards = [\n${imports}\n];\n\nconst records = shards.flat();\n\nmodule.exports = new Map(\n\trecords.map(record => [record.filePath, record])\n);`;
}

/** @description Renders every generated CommonJS metadata shard and its stable runtime index artifact. */
export function publicPageMetadataArtifacts(apps, games, geelooyRoot) {
	const pages = shard(publicPageMetadataRecords(apps, games, geelooyRoot), SHARD_SIZE);
	const artifacts = {};
	pages.forEach((items, index) => {
		artifacts[`seo/generated/public-pages/shard-${index + 1}.generated.js`] = renderShard(items, index + 1);
	});
	artifacts['seo/generated/public-pages/index.js'] = renderIndex(pages.length);
	return artifacts;
}

export { SHARD_SIZE };
