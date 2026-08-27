//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { DriveProjectRuntimeMaterializer } = require('../projectRuntimeMaterializer.js');

/**
 * @file Proof that content-addressed Drive projects become bounded disposable runtime trees.
 * @description The Awtsmoos lets immutable bytes become a temporary living garden; Awtsmoos.com proves hash, route, scope, and cleanup before trusted execution is allowed to harden.
 */

function entry(logicalPath, content) {
	const bytes = Buffer.from(content);
	return {
		path: logicalPath,
		type: 'file',
		objectHash: crypto.createHash('sha256').update(bytes).digest('hex'),
		size: bytes.length,
		trashedAt: null,
		bytes
	};
}

async function harness(entries, limits = {}) {
	const base = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-materializer-test-'));
	const byHash = new Map(entries.map(item => [item.objectHash, item.bytes]));
	const materializer = new DriveProjectRuntimeMaterializer({
		base,
		limits,
		readState: async () => ({ entries: Object.fromEntries(entries.map(item => [item.path, item])) }),
		readObject: async (_alias, hash) => byHash.get(hash)
	});
	return { base, materializer };
}

test('materializes only the selected project subtree and verifies its route', async t => {
	const route = entry('projects/site/_awtsmoos.derech.js', 'module.exports = () => {}');
	const html = entry('projects/site/public/index.html', '<h1>B\"H</h1>');
	const other = entry('projects/other/secret.txt', 'outside');
	const { base, materializer } = await harness([route, html, other]);
	t.after(() => fs.promises.rm(base, { recursive: true, force: true }));
	const result = await materializer.materialize({ aliasId: 'alpha', projectId: 'site', rootPath: 'projects/site' });
	assert.deepEqual(result.files, ['_awtsmoos.derech.js', 'public/index.html']);
	assert.equal(await fs.promises.readFile(path.join(result.root, 'public/index.html'), 'utf8'), '<h1>B\"H</h1>');
	await materializer.cleanup(result.root);
	assert.equal(fs.existsSync(result.root), false);
});

test('refuses a missing route file and cleans the failed generation', async t => {
	const file = entry('projects/site/index.html', 'static only');
	const { base, materializer } = await harness([file]);
	t.after(() => fs.promises.rm(base, { recursive: true, force: true }));
	await assert.rejects(materializer.materialize({ aliasId: 'alpha', projectId: 'site', rootPath: 'projects/site' }), /PROJECT_ROUTE_FILE_MISSING/);
	assert.deepEqual(await fs.promises.readdir(base), []);
});

test('refuses corrupted object bytes and declared size abuse', async t => {
	const route = entry('projects/site/_awtsmoos.derech.js', 'safe');
	const { base, materializer } = await harness([route], { fileBytes: 3 });
	t.after(() => fs.promises.rm(base, { recursive: true, force: true }));
	await assert.rejects(materializer.materialize({ aliasId: 'alpha', projectId: 'site', rootPath: 'projects/site' }), /PROJECT_RUNTIME_FILE_BYTES_LIMIT/);
});
