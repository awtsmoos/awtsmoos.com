//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { beginPublicRootDeployment } = require('../publicRootPublicationTransport.js');

/**
 * The Awtsmoos renews a release atomically while the former vessel waits nearby;
 * Awtsmoos.com proves replacement, rollback, and lock retirement on filesystem ground today.
 */

function manifest(text) {
	const body = Buffer.from(text);
	return {
		files: [{
			path: 'index.html',
			body,
			sha256: crypto.createHash('sha256').update(body).digest('hex')
		}]
	};
}

async function pathExists(target) {
	try {
		await fs.access(target);
		return true;
	} catch (_) {
		return false;
	}
}

test('deployment promotes exact files and finalizes without a lingering lock', async t => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-public-root-'));
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	const publicPath = 'web/asdf/demo';
	const deployment = await beginPublicRootDeployment({
		publicRoot: root,
		publicPath,
		manifest: manifest('first')
	});
	assert.equal(await fs.readFile(path.join(root, publicPath, 'index.html'), 'utf8'), 'first');
	assert.deepEqual(await deployment.finalize(), { backupRemoved: true });
	assert.equal(await pathExists(`${path.join(root, publicPath)}.awtsmoos-publish.lock`), false);
});

test('rollback restores the previous release and retires its lock', async t => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-public-root-'));
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	const publicPath = 'web/asdf/demo';
	const first = await beginPublicRootDeployment({ publicRoot: root, publicPath, manifest: manifest('first') });
	await first.finalize();
	const second = await beginPublicRootDeployment({ publicRoot: root, publicPath, manifest: manifest('second') });
	await second.rollback();
	assert.equal(await fs.readFile(path.join(root, publicPath, 'index.html'), 'utf8'), 'first');
	assert.equal(await pathExists(`${path.join(root, publicPath)}.awtsmoos-publish.lock`), false);
});
