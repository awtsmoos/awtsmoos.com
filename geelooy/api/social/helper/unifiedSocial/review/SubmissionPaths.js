//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SubmissionPaths
 * @description
 * Submission identity is reflected through Heichel, state, series, and author
 * indexes without duplicating the payload. The Awtsmoos knows every relation at
 * once; Awtsmoos.com names the paths so review evidence remains recoverable.
 */

const { sp } = require('../../_awtsmoos.constants.js');

function basePath(heichelId) {
	return `${sp}/heichelos/${heichelId}/review/submissions`;
}

function recordPath(heichelId, id) {
	return `${basePath(heichelId)}/${id}`;
}

function statePath(heichelId, state, id) {
	return `${sp}/heichelos/${heichelId}/review/byState/${state}/${id}`;
}

function seriesPath(heichelId, seriesId, id) {
	return `${sp}/heichelos/${heichelId}/series/${seriesId}/reviewSubmissions/${id}`;
}

function aliasPath(aliasId, id) {
	return `${sp}/aliases/${aliasId}/submissions/${id}`;
}

async function indexSubmission({ $i, record }) {
	await $i.db.write(recordPath(record.heichelId, record.id), record);
	await $i.db.write(statePath(record.heichelId, record.state, record.id), true);
	await $i.db.write(seriesPath(record.heichelId, record.seriesId, record.id), true);
	await $i.db.write(aliasPath(record.submitterAliasId, record.id), {
		heichelId: record.heichelId,
		seriesId: record.seriesId,
		state: record.state
	});
}

async function reindexState({ $i, current, next }) {
	await $i.db.delete(
		statePath(current.heichelId, current.state, current.id)
	).catch(() => null);
	await $i.db.write(statePath(next.heichelId, next.state, next.id), true);
	await $i.db.write(aliasPath(next.submitterAliasId, next.id), {
		heichelId: next.heichelId,
		seriesId: next.seriesId,
		state: next.state
	});
}

module.exports = {
	basePath,
	recordPath,
	statePath,
	seriesPath,
	aliasPath,
	indexSubmission,
	reindexState
};
