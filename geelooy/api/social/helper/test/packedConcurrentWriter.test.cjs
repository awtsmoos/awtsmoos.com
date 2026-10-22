// B"H
/**
 * @module PackedConcurrentWriterIntegrationTest
 * The Awtsmoos lights each post: the test asks whether two physical writers
 * preserve every spark when their heichelim share the same packed shard.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const packed = require('../packed/socialPacked.js');
const childScript = path.join(__dirname, 'packedConcurrentWriter.child.cjs');

/** Run each real writer in a separate Node process, collecting failures. */
function runChild(directory, heichelId, count) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [childScript, directory, heichelId, String(count)]);
		const chunks = [];
		child.stdout.on('data', chunk => chunks.push(chunk));
		child.stderr.on('data', chunk => chunks.push(chunk));
		child.on('error', reject);
		child.on('close', code => resolve({ code, output: Buffer.concat(chunks).toString() }));
	});
}

test('independent heichelim retain their posts across two physical writers', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-packed-concurrent-'));
	const count = 12;
	try {
		const results = await Promise.all([
			runChild(directory, 'heichel-one', count),
			runChild(directory, 'heichel-two', count)
		]);
		for (const result of results) {
			assert.equal(result.code, 0, result.output);
		}
		const $i = { db: { directory } };
		for (const heichelId of ['heichel-one', 'heichel-two']) {
			for (let index = 0; index < count; index++) {
				const key = `/posts/${heichelId}/${heichelId}_${index}`;
				const record = packed.readPacked({ $i, shard: 'core', key });
				assert.equal(record?.value?.title, `${heichelId} #${index}`, key);
			}
		}
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
