//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('./pathPolicy.js');
const { normalizeProjectId } = require('../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectIdentity.js');

/**
 * @module DriveSiteSourcePolicy
 * @description
 * The Awtsmoos lets one public identity wear Drive, Virtual OS, or living project vessels without confusing source with authority;
 * Awtsmoos.com stores only bounded paths or opaque runtime bindings, so neither account identity nor ephemeral process ports leak into the public garden.
 */
const SOURCE_KINDS = Object.freeze({
	DRIVE: 'drive',
	VIRTUAL_OS: 'virtual-os',
	HOSTED_PROJECT: 'hosted-project'
});

const SOURCE_MODES = Object.freeze({
	SNAPSHOT: 'snapshot',
	DIRECT: 'direct',
	PROXY: 'proxy'
});

const OWNER_KEY_PATTERN = /^owner-[a-f0-9]{24}$/;

function normalizeSiteSource(input, fallbackRootPath = '') {
	if (input === undefined || input === null) return null;
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		throw siteSourceError('INVALID_SITE_SOURCE');
	}
	const kind = String(input.kind || '').trim().toLowerCase();
	const mode = String(input.mode || '').trim().toLowerCase();
	if (mode !== modeForKind(kind)) {
		throw siteSourceError('INVALID_SITE_SOURCE_MODE');
	}
	if (kind === SOURCE_KINDS.HOSTED_PROJECT) {
		return normalizeHostedProjectSource(input, kind, mode);
	}
	return {
		kind,
		mode,
		rootPath: normalizeDrivePath(
			input.rootPath === undefined ? fallbackRootPath : input.rootPath,
			{ allowRoot: true }
		)
	};
}

function normalizeHostedProjectSource(input, kind, mode) {
	const ownerKey = String(input.ownerKey || '').trim().toLowerCase();
	if (!OWNER_KEY_PATTERN.test(ownerKey)) {
		throw siteSourceError('INVALID_HOSTED_PROJECT_OWNER_KEY');
	}
	return {
		kind,
		mode,
		ownerKey,
		projectId: normalizeProjectId(input.projectId)
	};
}

function modeForKind(kind) {
	if (kind === SOURCE_KINDS.DRIVE) return SOURCE_MODES.SNAPSHOT;
	if (kind === SOURCE_KINDS.VIRTUAL_OS) return SOURCE_MODES.DIRECT;
	if (kind === SOURCE_KINDS.HOSTED_PROJECT) return SOURCE_MODES.PROXY;
	return '';
}

function effectiveSiteSource(site = {}) {
	const explicit = normalizeSiteSource(site.source, site.rootPath || '');
	if (explicit) return explicit;
	return {
		kind: SOURCE_KINDS.DRIVE,
		mode: SOURCE_MODES.SNAPSHOT,
		rootPath: normalizeDrivePath(site.rootPath || '', { allowRoot: true })
	};
}

function siteSourceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	SOURCE_KINDS,
	SOURCE_MODES,
	effectiveSiteSource,
	normalizeSiteSource,
	siteSourceError
};
