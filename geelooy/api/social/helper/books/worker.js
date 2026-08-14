// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookExportWorker
 * @description A leased detached worker walks one series tree and leaves a durable printable shelf.
 */
const fs = require('fs');
const path = require('path');
const { buildBook } = require('./bookBuilder.js');
const { createHttpSource } = require('./sourceHttp.js');
const { targetNodes, walkSeries } = require('./seriesTree.js');
const store = require('./jobStore.js');
const lease = require('./workerLease.js');
const { bookFileName, jobDir } = require('./paths.js');
const { renderJobIndex } = require('./renderJobIndex.js');
const { createZip } = require('./zipWriter.js');

function waitingStatus(jobId, owner) {
	store.update(jobId, {
		state: 'waiting',
		waitingForJobId: owner?.jobId || null,
		waitingForPid: owner?.pid || null
	});
}

async function generate(jobId) {
	const config = store.config(jobId);
	const dir = jobDir(jobId);
	const source = createHttpSource(config.apiBase);
	store.update(jobId, { state: 'running', startedAt: Date.now(), error: null });
	const root = await walkSeries({
		source,
		heichelId: config.heichelId,
		seriesId: config.seriesId,
		options: config.options
	});
	const targets = targetNodes(root, config.options.mode, config.options.maxBooks);
	store.update(jobId, { totalBooks: targets.length, completedBooks: 0, files: [] });
	const books = [];
	for (let index = 0; index < targets.length; index++) {
		const target = targets[index];
		const bookOptions = config.options.mode === 'leaves'
			? { ...config.options, title: '' }
			: config.options;
		const built = await buildBook({
			source,
			heichelId: config.heichelId,
			node: target,
			options: bookOptions,
			nested: config.options.mode === 'combined'
		});
		const file = bookFileName(index, built.manifest.title, target.id);
		fs.writeFileSync(path.join(dir, file), built.html);
		books.push({ ...built.manifest, file, path: target.path });
		store.update(jobId, { completedBooks: books.length, files: books.map(book => book.file) });
	}
	const manifest = { jobId, generatedAt: Date.now(), config, books };
	store.writeManifest(jobId, manifest);
	fs.writeFileSync(path.join(dir, 'index.html'), renderJobIndex(config, books));
	const entries = books.map(book => ({ file: path.join(dir, book.file), name: book.file }));
	entries.push({ file: path.join(dir, 'index.html'), name: 'index.html' });
	entries.push({ file: path.join(dir, 'manifest.json'), name: 'manifest.json' });
	const archive = await createZip(path.join(dir, 'archive.zip'), entries);
	store.update(jobId, {
		state: 'completed',
		completedAt: Date.now(),
		archiveBytes: archive.bytes,
		files: [...books.map(book => book.file), 'index.html', 'manifest.json', 'archive.zip']
	});
}

async function run(jobId) {
	store.update(jobId, { state: 'waiting', queuedAt: Date.now(), error: null });
	await lease.acquire(jobId, owner => waitingStatus(jobId, owner));
	try {
		await generate(jobId);
	} finally {
		lease.release(jobId);
	}
}

async function main() {
	const jobId = process.argv[2];
	if (!jobId) throw new Error('Missing book job ID.');
	try {
		await run(jobId);
	} catch (error) {
		try {
			store.update(jobId, {
				state: 'failed',
				failedAt: Date.now(),
				error: { message: error.message, stack: error.stack }
			});
		} catch {}
		throw error;
	}
}

if (require.main === module) {
	main().catch(error => {
		process.stderr.write(`${error.stack || error}\n`);
		process.exitCode = 1;
	});
}

module.exports = { generate, run };
