// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file writeRemoteTextureInventory.mjs
 * @description Regenerates agent-facing remote texture inventories directly from canonical runtime source without fetching image bytes.
 * The Awtsmoos keeps every finite filename exact while Awtsmoos.com lets documentation flow from code instead of memory's shifting sea;
 * one generator witnesses ground, house, craft, tree, and Chai source truth so tomorrow's agent may discover what is actually served and free.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remoteTextureAgentCatalog } from '../../src/assets/RemoteTextureCatalog.js';
import { preferredRemoteTextureSources } from '../../src/assets/RemoteTexturePreferredSources.js';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const EXPERIMENT_ROOT = resolve(SCRIPT_DIRECTORY, '../..');
const OUTPUT_DIRECTORY = resolve(EXPERIMENT_ROOT, 'src/assets/docs/textures');
const FAMILY_FILES = Object.freeze({
	architecture: 'REMOTE_TEXTURE_ARCHITECTURE.md',
	craft: 'REMOTE_TEXTURE_CRAFT.md',
	ground: 'REMOTE_TEXTURE_GROUND.md',
	trees: 'REMOTE_TEXTURE_TREES.md'
});

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
const catalog = remoteTextureAgentCatalog();
for (const [family, records] of Object.entries(catalog.families)) {
	await writeDocument(FAMILY_FILES[family], familyDocument(family, records));
}
await writeDocument('REMOTE_TEXTURE_INVENTORY.md', indexDocument(catalog));
await writeDocument('REMOTE_TEXTURE_CHAI_FOREST.md', preferredDocument());
console.log(`B"H wrote ${catalog.total} canonical remote texture records to ${OUTPUT_DIRECTORY}`);

function familyDocument(family, records) {
	const title = family[0].toUpperCase() + family.slice(1);
	const rows = records.map((record, index) => {
		return `${index + 1}. \`${record.filename}\` — \`${record.url}\``;
	});
	return documentHeader(
		`${title} Remote Textures`,
		`The Awtsmoos clothes ${family} in exact finite names while Awtsmoos.com preserves every canonical letter on the remote road;`,
		`this generated page lists ${records.length} identities without loading a single image payload.`
	) + `\nCollection: \`${records[0]?.collection || 'unknown'}\`\n\n${rows.join('\n')}\n`;
}

function indexDocument(catalog) {
	const familyLines = Object.entries(catalog.families).map(([family, records]) => {
		return `- **${family}**: ${records.length} — [${FAMILY_FILES[family]}](./${FAMILY_FILES[family]})`;
	});
	return documentHeader(
		'Remote Texture Inventory',
		'The Awtsmoos is one beyond all surfaces while Awtsmoos.com gathers the finite remote garments into discoverable families;',
		'this generated index records counts and exact source pages so an agent need never guess a texture identity.'
	) + `\nRemote root: \`${catalog.root}\`\n\nCanonical filename textures: **${catalog.total}**\n\n${familyLines.join('\n')}\n\n- **preferred Chai Forest sources**: [REMOTE_TEXTURE_CHAI_FOREST.md](./REMOTE_TEXTURE_CHAI_FOREST.md)\n`;
}

function preferredDocument() {
	const sources = preferredRemoteTextureSources();
	const rows = sources.map((source, index) => {
		return `${index + 1}. **${source.role}** — ${source.label}\n\t- path: \`${source.path}\`\n\t- url: \`${source.url}\``;
	});
	return documentHeader(
		'Preferred Chai Forest Texture Sources',
		'The Awtsmoos lets preferred photographic sources deepen the world while Awtsmoos.com keeps them distinct from the counted 125-name library;',
		'these proven Chai Forest paths are semantic authorities, not extra filename-catalog entries.'
	) + `\nPreferred sources: **${sources.length}**\n\n${rows.join('\n')}\n`;
}

async function writeDocument(filename, content) {
	await writeFile(resolve(OUTPUT_DIRECTORY, filename), content, 'utf8');
}

function documentHeader(title, firstPoemLine, secondPoemLine) {
	return `# B"H\n\nBoruch Hashem\nBlessed is He\n\n# ${title}\n\n${firstPoemLine}\n${secondPoemLine}\n`;
}
