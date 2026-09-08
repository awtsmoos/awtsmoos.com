//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file builder.test.js
 * @description
 * The Awtsmoos lets a miniature corpus pass through the real worker pool into binary shards and back through search;
 * Awtsmoos.com proves candidate publication, counts, memory report, and runtime compatibility without a JSON database perch.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');

const repository = path.resolve(__dirname, '../../../../../../..');

test('real sharded migration publishes a searchable binary generation', async t => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-shard-build-'));
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	const legacy = path.join(root, 'legacy');
	const output = path.join(root, 'output');
	await fs.mkdir(legacy, { recursive: true });
	await writeSource(legacy, 'bdb', [entry('בראשית', 'beginning'), entry('אור', 'light')]);
	await writeSource(legacy, 'yiddish-wiktionary', [entry('בראשית', 'Yiddish beginning')]);
	const result = await runSync(output, legacy);
	assert.match(result, /entries=3/);
	assert.match(result, /bdb: 2/);
	assert.match(result, /yiddish-wiktionary: 1/);
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	process.env.AWTSMOOS_LEXICON_ROOT = output;
	try {
		const { dictionarySearch } = require('../search.js');
		const found = await dictionarySearch({}, { query: 'בראשית', sourceId: 'bdb', limit: 2 });
		assert.equal(found.results[0].senses[0].definition, 'beginning');
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
	}
});

async function writeSource(folder, id, entries) {
	await fs.writeFile(path.join(folder, `${id}.jsonl`), entries.map(JSON.stringify).join('\n') + '\n');
	await fs.writeFile(path.join(folder, `${id}.source.json`), JSON.stringify({ version: 'fixture', quality: 'fixture' }));
}

function entry(headword, definition) {
	return { headword, normalized: headword, senses: [{ definition }] };
}

function runSync(output, legacy) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [
			path.join(repository, 'scripts/torahLexicons/sync.mjs'),
			'--root', output,
			'--legacy-root', legacy,
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
