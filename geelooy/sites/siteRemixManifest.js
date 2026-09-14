//B"H
//Boruch Hashem
//Blessed be He

const { readObject } = require('../api/social/helper/drive/objectRepository.js');
const { normalizeDeploymentRegistry } = require('../api/social/helper/drive/deploymentPolicy.js');
const { SOURCE_KINDS, effectiveSiteSource } = require('../api/social/helper/drive/siteSourcePolicy.js');
const { namedSitePath, primarySitePath } = require('./siteResolution.js');

const MAX_REMIX_FILES = 120;
const MAX_REMIX_BYTES = 2 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set([
	'css', 'csv', 'htm', 'html', 'js', 'json', 'jsx', 'md', 'mjs', 'cjs',
	'svg', 'text', 'txt', 'ts', 'tsx', 'xml', 'yaml', 'yml'
]);

/**
 * Builds a bounded, public-source-only remix vessel for a resolved static Site.
 * Dynamic hosted projects and binary assets fail closed so a successful remix is
 * always complete rather than a deceptively broken partial copy.
 */
async function buildSiteRemixManifest(options) {
	const source = effectiveSiteSource(options.resolution.site);
	const entries = sourceEntries(options.state, source);
	assertRemixableEntries(entries);
	const files = [];
	let totalBytes = 0;
	for (const [path, entry] of entries) {
		totalBytes += Number(entry.size || 0);
		if (totalBytes > MAX_REMIX_BYTES) throw remixError('REMIX_SOURCE_TOO_LARGE', 413);
		const body = await readObject(options.aliasId, entry.objectHash, options.$i);
		if (body.length > Number(entry.size || 0)) totalBytes += body.length - Number(entry.size || 0);
		if (totalBytes > MAX_REMIX_BYTES) throw remixError('REMIX_SOURCE_TOO_LARGE', 413);
		files.push(Object.freeze({ path, content: body.toString('utf8'), bytes: body.length }));
	}
	if (!files.some(file => file.path.toLowerCase() === 'index.html')) {
		throw remixError('REMIX_INDEX_REQUIRED', 409);
	}
	return Object.freeze({
		kind: 'awtsmoos-site-remix',
		version: 1,
		aliasId: options.aliasId,
		siteId: options.resolution.site.id,
		title: options.resolution.site.title,
		canonicalUrl: canonicalUrl(options.aliasId, options.resolution),
		sourceKind: source.kind,
		sourceRevision: source.deploymentId || null,
		fileCount: files.length,
		totalBytes,
		files: Object.freeze(files)
	});
}

function sourceEntries(state, source) {
	if (source.kind === SOURCE_KINDS.DRIVE_DEPLOYMENT) {
		const deployment = normalizeDeploymentRegistry(state.deployments)[source.deploymentId];
		if (!deployment) throw remixError('REMIX_DEPLOYMENT_NOT_FOUND', 404);
		return Object.entries(deployment.files || {});
	}
	if (source.kind !== SOURCE_KINDS.DRIVE) {
		throw remixError('REMIX_SOURCE_KIND_UNSUPPORTED', 409);
	}
	const root = String(source.rootPath || '');
	return Object.entries(state.entries || {}).flatMap(([path, entry]) => {
		if (!publicFile(entry) || !insideRoot(path, root)) return [];
		const relative = root ? path.slice(root.length + 1) : path;
		return relative ? [[relative, entry]] : [];
	});
}

function assertRemixableEntries(entries) {
	if (!entries.length) throw remixError('REMIX_SOURCE_EMPTY', 404);
	if (entries.length > MAX_REMIX_FILES) throw remixError('REMIX_TOO_MANY_FILES', 413);
	const unsupported = entries.filter(([path, entry]) => !textSource(path, entry.mime));
	if (unsupported.length) {
		const error = remixError('REMIX_BINARY_ASSETS_UNSUPPORTED', 409);
		error.paths = unsupported.slice(0, 12).map(([path]) => path);
		throw error;
	}
}

function textSource(path, mime) {
	if (String(mime || '').toLowerCase().startsWith('text/')) return true;
	const extension = String(path).split('.').pop().toLowerCase();
	return TEXT_EXTENSIONS.has(extension);
}

function publicFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public';
}

function insideRoot(path, root) {
	return !root || path.startsWith(`${root}/`);
}

function canonicalUrl(aliasId, resolution) {
	return resolution.named
		? namedSitePath(aliasId, resolution.site.id)
		: primarySitePath(aliasId);
}

function remixError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	MAX_REMIX_BYTES,
	MAX_REMIX_FILES,
	buildSiteRemixManifest,
	remixError,
	textSource
};
