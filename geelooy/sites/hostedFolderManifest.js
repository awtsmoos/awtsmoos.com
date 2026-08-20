//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../api/social/helper/_awtsmoos.constants.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { dbPath } = require('../api/tunnel/control/routes/osFs/path.js');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');
const { virtualOsValueToBuffer } = require('./virtualOsSourceValue.js');

/**
 * @module HostedFolderManifest
 * @description
 * The Awtsmoos gathers one hosted folder into a bounded snapshot without
 * making the agent carry every byte across the Tunnel. Awtsmoos.com preserves
 * binary source while private metadata remains outside the publication vessel.
 */

const MAX_FILES = 64;
const MAX_BYTES = 2 * 1024 * 1024;

async function collectHostedFolderManifest($i, aliasId, sourceRoot = '') {
	const rootPath = normalizeDrivePath(sourceRoot || '', { allowRoot: true });
	const tree = await $i.db.read(dbPath(sp, aliasId, rootPath));
	if (!tree || typeof tree !== 'object' || virtualOsValueToBuffer(tree)) {
		throw manifestError('SITE_SOURCE_ROOT_NOT_FOLDER');
	}

	const state = { files: [], bytes: 0 };
	collectTree(tree, '', state);
	return state.files;
}

function collectTree(node, relativeRoot, state) {
	for (const [name, value] of Object.entries(node || {})) {
		const relativePath = [relativeRoot, name].filter(Boolean).join('/');
		assertDirectPublicPath(relativePath);
		const body = virtualOsValueToBuffer(value);
		if (body) {
			pushFile(relativePath, body, state);
			continue;
		}
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			collectTree(value, relativePath, state);
		}
	}
}

function pushFile(path, body, state) {
	state.bytes += body.length;
	if (state.files.length >= MAX_FILES || state.bytes > MAX_BYTES) {
		throw manifestError('SITE_SOURCE_LIMIT_EXCEEDED');
	}
	state.files.push({
		path,
		contentBase64: body.toString('base64')
	});
}

function manifestError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MAX_BYTES,
	MAX_FILES,
	collectHostedFolderManifest
};
