//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creatorCommands } from '../../social-composer/js/creator/CreatorCommandCatalog.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const official = [
	'https://www.facebook.com/help/212802592074644',
	'https://www.facebook.com/help/181231772500920',
	'https://support.google.com/accounts/answer/3024190?hl=en',
	'https://takeout.google.com/',
	'https://support.google.com/youtube/answer/56100?hl=en',
	'https://studio.youtube.com/'
];

async function text(relative) {
	return readFile(path.join(root, relative), 'utf8');
}

async function filesUnder(relative) {
	const base = path.join(root, relative);
	const found = [];
	for (const entry of await readdir(base, { withFileTypes: true })) {
		const child = path.join(base, entry.name);
		if (entry.isDirectory()) found.push(...await filesUnder(path.relative(root, child)));
		else found.push(child);
	}
	return found;
}

test('tutorials contain every exact official link and advanced migration route', async () => {
	const combined = `${await text('social/migrate/index.html')}\n${await text('social/migrate/DOCUMENTATION.md')}\n${await text('youtube/DOCUMENTATION.md')}`;
	for (const url of official) assert.match(combined, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
	assert.match(combined, /\/youtube\/migrate\//);
	assert.match(combined, /All time/);
	assert.match(combined, /JSON/);
});

test('creator command palette exposes social archive migration vocabulary', () => {
	const command = creatorCommands().find(item => item.id === 'migration');
	assert.equal(command.label, 'Import social archive');
	for (const word of ['facebook', 'instagram', 'youtube', 'archive', 'takeout', 'migration', 'import']) {
		assert.match(command.keywords.toLowerCase(), new RegExp(word));
	}
});

test('Meta API exposes metadata and dry-plan routes without publication', async () => {
	const routes = await text('api/social/helper/migrations/meta/MetaMigrationRoutes.js');
	assert.match(routes, /'\/migrations\/meta\/metadata'/);
	assert.match(routes, /'\/migrations\/meta\/plan'/);
	assert.doesNotMatch(routes, /unified-social\/publish[^'"]*['"]\s*:/);
	const plan = await text('api/social/helper/migrations/meta/MetaMigrationPlan.js');
	assert.match(plan, /publishesHere:\s*false/);
});

test('migration CSS has reduced-motion and avoids transition all', async () => {
	const cssFiles = (await filesUnder('social/migrate')).filter(file => file.endsWith('.css'));
	const combined = (await Promise.all(cssFiles.map(file => readFile(file, 'utf8')))).join('\n');
	assert.match(combined, /prefers-reduced-motion:\s*reduce/);
	assert.doesNotMatch(combined, /transition\s*:\s*all\b/i);
	assert.match(combined, /forced-colors:\s*active/);
});
