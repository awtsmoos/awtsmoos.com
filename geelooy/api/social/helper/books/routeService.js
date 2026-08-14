// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookRouteService
 * @description Public leaf rendering and authenticated recursive generation share one book model.
 */
const fs = require('fs');
const { buildBook } = require('./bookBuilder.js');
const { contentAttachment, fileAttachment } = require('./download.js');
const { slug } = require('./html.js');
const { launch } = require('./jobLauncher.js');
const store = require('./jobStore.js');
const { parse, requestInput } = require('./options.js');
const { safeFile } = require('./paths.js');
const { readNode, walkSeries } = require('./seriesTree.js');
const { createInternalSource } = require('./sourceInternal.js');

function verifyJob(jobId, heichelId, seriesId) {
	const config = store.config(jobId);
	if (config.heichelId !== heichelId || config.seriesId !== seriesId) {
		throw new Error('Book job does not belong to this series path.');
	}
	return config;
}

async function directHtml({ $i, userid, heichelId, seriesId }) {
	const options = parse(requestInput($i));
	if (options.scope === 'nested' && !userid) throw new Error('Authenticated identity is required for nested direct book generation.');
	const source = createInternalSource($i);
	const node = options.scope === 'nested'
		? await walkSeries({ source, heichelId, seriesId, options })
		: await readNode({ source, heichelId, seriesId });
	const built = await buildBook({ source, heichelId, node, options, nested: options.scope === 'nested' });
	return contentAttachment($i, built.html, 'text/html; charset=utf-8', `${slug(built.manifest.title)}-${options.language}.html`);
}

function createJob({ $i, userid, heichelId, seriesId }) {
	if (!userid) throw new Error('Authenticated identity is required to start a book generation job.');
	const options = parse(requestInput($i), { language: 'bilingual', mode: 'leaves' });
	return launch({ heichelId, seriesId, options, userid });
}

function jobStatus({ jobId, heichelId, seriesId }) {
	verifyJob(jobId, heichelId, seriesId);
	return store.status(jobId);
}

function jobFile({ $i, jobId, heichelId, seriesId, fileName }) {
	verifyJob(jobId, heichelId, seriesId);
	const status = store.status(jobId);
	if (!status.files.includes(fileName)) throw new Error('Generated book file is not ready.');
	const file = safeFile(jobId, fileName);
	if (!fs.existsSync(file)) throw new Error('Generated book file is missing.');
	const mime = fileName.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8';
	return fileAttachment($i, file, mime, fileName);
}

function archive({ $i, jobId, heichelId, seriesId }) {
	verifyJob(jobId, heichelId, seriesId);
	const status = store.status(jobId);
	if (status.state !== 'completed') throw new Error('Book archive is not ready.');
	return fileAttachment($i, safeFile(jobId, 'archive.zip'), 'application/zip', `${slug(seriesId)}-${jobId}.zip`);
}

module.exports = {
	archive,
	createJob,
	directHtml,
	jobFile,
	jobStatus,
	verifyJob
};
