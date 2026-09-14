//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file builder.test.js
 * @description
 * Proves three completed native source databases pass through the real worker
 * pool into compact binary serving shards and return through public search.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');

const repository = path.resolve(__dirname, '../../../../../../..');

/** Creates one fully verified native fixture source without flat persistence. */
async function writeNativeSource(folder, id, entries) {
	const modulePath = path.join(repository, 'scripts/torahLexicons/source-writer.mjs');
	const writer = await import(modulePath);
	const file = path.join(folder, `${id}.awtsdb`);
	const database = await writer.openSourceWriter(file, { id, version: 'fixture' }, true);
	try {
		for (let index = 0; index < entries.length; index += 1) {
			await writer.putSourceEntry(database, entries[index], `${id}:${index}`);
		}
		await writer.finalizeSourceWriter(database);
	} finally {
		await writer.closeSourceWriter(database);
	}
}

/** Creates one canonical lexical fixture row. */
function entry(headword, definition, extras = {}) {
	return {
		headword,
		normalized: headword,
		senses: [{ definition }],
		...extras
	};
}

/** Runs the real native sync command against one temporary source root. */
function runSync(output, sourceRoot) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [
			path.join(repository, 'scripts/torahLexicons/sync.mjs'),
			'--root', output,
			'--source-root', sourceRoot,
			'--workers', '2'
		], { cwd: repository, stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => { stdout += chunk; });
		child.stderr.on('data', chunk => { stderr += chunk; });
		child.on('error', reject);
		child.on('exit', code => code === 0 ? resolve(stdout) : reject(new Error(stderr)));
	});
}

test('real native migration publishes compact searchable dictionary shards', async t => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-shard-build-'));
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	const sources = path.join(root, 'sources');
	const output = path.join(root, 'output');
	await fs.mkdir(sources, { recursive: true });
	await writeNativeSource(sources, 'bdb', [
		entry('בראשית', 'beginning'),
		entry('אור', 'light')
	]);
	await writeNativeSource(sources, 'jastrow', [
		entry('אַבָּא', 'father', { normalized: 'אבא', rid: 'fixture-jastrow-1' })
	]);
	await writeNativeSource(sources, 'yiddish-wiktionary', [
		entry('בראשית', 'Yiddish beginning')
	]);
	const result = await runSync(output, sources);
	assert.match(result, /entries=4/);
	assert.match(result, /bdb: 2/);
	assert.match(result, /jastrow: 1/);
	assert.match(result, /yiddish-wiktionary: 1/);
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	process.env.AWTSMOOS_LEXICON_ROOT = output;
	try {
		const { dictionarySearch } = require('../search.js');
		const bdb = await dictionarySearch({}, { query: 'בראשית', sourceId: 'bdb', limit: 2 });
		const jastrow = await dictionarySearch({}, { query: 'אַבָּא', sourceId: 'jastrow', limit: 2 });
		assert.equal(bdb.results[0].senses[0].definition, 'beginning');
		assert.equal(jastrow.results[0].rid, 'fixture-jastrow-1');
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
	}
});
