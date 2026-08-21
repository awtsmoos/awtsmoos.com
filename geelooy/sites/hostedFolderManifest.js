//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../api/social/helper/_awtsmoos.constants.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { dbPath, stripJsonSuffix } = require('../api/tunnel/control/routes/osFs/path.js');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');
const { virtualOsValueToBuffer } = require('./virtualOsSourceValue.js');

/**
 * @module HostedFolderManifest
 * @description
 * The Awtsmoos gathers real hosted bytes instead of mistaking directory names
 * for files. Awtsmoos.com walks each child, hides private garments, and keeps
 * every publication manifest inside one bounded vessel of light.
 */

const MAX_FILES = 64;
const MAX_BYTES = 2 * 1024 * 1024;

async function collectHostedFolderManifest($i, aliasId, sourceRoot = '') {
	const rootPath = normalizeDrivePath(sourceRoot || '', { allowRoot: true });
	const rootValue = await readHostedValue($i, aliasId, rootPath);

	if (virtualOsValueToBuffer(rootValue)) {
		throw manifestError('SITE_SOURCE_ROOT_NOT_FOLDER');
	}

	const state = { files: [], bytes: 0 };
	await collectDirectory($i, aliasId, rootPath, '', rootValue, state);
	return state.files;
}

async function collectDirectory($i, aliasId, fullRoot, relativeRoot, node, state) {
	for (const child of directoryChildren(node)) {
		const relativePath = joinPath(relativeRoot, child.name);
		if (!isPublishablePath(relativePath)) continue;

		const fullPath = joinPath(fullRoot, child.name);
		const value = child.valueProvided
			? child.value
			: await readHostedValue($i, aliasId, fullPath);
		const body = virtualOsValueToBuffer(value);

		if (body) {
			pushFile(relativePath, body, state);
			continue;
		}
		if (value && typeof value === 'object') {
			await collectDirectory($i, aliasId, fullPath, relativePath, value, state);
		}
	}
}

function directoryChildren(node) {
	if (Array.isArray(node)) {
		return node
			.map(value => ({ name: childName(value), value: null, valueProvided: false }))
			.filter(child => child.name);
	}
	if (!node || typeof node !== 'object') return [];
	return Object.entries(node).map(([name, value]) => ({
		name: stripJsonSuffix(name),
		value,
		valueProvided: true
	}));
}

function childName(value) {
	if (typeof value === 'string') return stripJsonSuffix(value);
	if (!value || typeof value !== 'object') return '';
	return stripJsonSuffix(value.name || value.id || value.path || '');
}

function isPublishablePath(path) {
	try {
		assertDirectPublicPath(path);
		return true;
	} catch (error) {
		if (error?.code === 'DIRECT_SITE_PATH_PRIVATE') return false;
		throw error;
	}
}

async function readHostedValue($i, aliasId, path) {
	return await $i.db.read(dbPath(sp, aliasId, path));
}

function joinPath(...parts) {
	return parts.filter(Boolean).join('/');
}

function pushFile(path, body, state) {
	state.bytes += body.length;
	if (state.files.length >= MAX_FILES || state.bytes > MAX_BYTES) {
		throw manifestError('SITE_SOURCE_LIMIT_EXCEEDED');
	}
	state.files.push({ path, contentBase64: body.toString('base64') });
}

function manifestError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { MAX_BYTES, MAX_FILES, collectHostedFolderManifest, directoryChildren };
