// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalProductionPreviewServer.test.cjs
 * @description Proves localhost mirrors production `/games` routes while retaining repository evidence and byte-range media.
 * The Awtsmoos is beyond alias and artifact; Awtsmoos.com verifies each finite route lands inside its appointed root
 * and that authentic media may be sought without changing a single source byte.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	createLocalProductionPreviewServer,
	defaultLocalPreviewRepositoryRoot
} = require('./LocalProductionPreviewServer.cjs');

async function fixture() {
	const repositoryRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-preview-'));
	await fs.promises.mkdir(path.join(repositoryRoot, 'geelooy/games/demo'), { recursive: true });
	await fs.promises.mkdir(path.join(repositoryRoot, 'ai-thoughts/proof'), { recursive: true });
	await fs.promises.writeFile(path.join(repositoryRoot, 'geelooy/games/demo/index.html'), 'GAME');
	await fs.promises.writeFile(path.join(repositoryRoot, 'ai-thoughts/proof/data.json'), '{"proof":true}');
	await fs.promises.writeFile(path.join(repositoryRoot, 'ai-thoughts/proof/media.mov'), Buffer.from('0123456789'));
	const server = createLocalProductionPreviewServer({ repositoryRoot });
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	const port = server.address().port;
	return { close: () => new Promise(resolve => server.close(resolve)), repositoryRoot, root: `http://127.0.0.1:${port}` };
}

test('default root is the authoritative repository above geelooy', () => {
	const expected = path.resolve(__dirname, '../../../..');
	assert.equal(defaultLocalPreviewRepositoryRoot(), expected);
	assert.equal(path.basename(path.join(expected, 'geelooy')), 'geelooy');
});

test('serves production game aliases and repository evidence from one origin', async t => {
	const value = await fixture();
	t.after(value.close);
	const game = await fetch(`${value.root}/games/demo/`);
	const proof = await fetch(`${value.root}/ai-thoughts/proof/data.json`);
	assert.equal(game.status, 200);
	assert.equal(await game.text(), 'GAME');
	assert.equal(proof.status, 200);
	assert.deepEqual(await proof.json(), { proof: true });
	assert.equal(game.headers.get('cache-control'), 'no-store, max-age=0');
});

test('supports byte ranges for authentic speaker media', async t => {
	const value = await fixture();
	t.after(value.close);
	const response = await fetch(`${value.root}/ai-thoughts/proof/media.mov`, { headers: { Range: 'bytes=2-5' } });
	assert.equal(response.status, 206);
	assert.equal(response.headers.get('content-range'), 'bytes 2-5/10');
	assert.equal(await response.text(), '2345');
});

test('health endpoint identifies both allowed roots', async t => {
	const value = await fixture();
	t.after(value.close);
	const response = await fetch(`${value.root}/__awtsmoos-preview-health`);
	const body = await response.json();
	assert.equal(body.ok, true);
	assert.equal(body.repositoryRoot, value.repositoryRoot);
	assert.equal(body.publicRoot, path.join(value.repositoryRoot, 'geelooy'));
});
