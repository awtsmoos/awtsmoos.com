//B"H
// Boruch Hashem
// Blessed is He

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { collectProjectAttachments } = require('./projectAttachmentEvidence.js');
const { findProjectByRoot } = require('./projectRegistryService.js');
const { listSiteMappings } = require('./siteMappingService.js');

/**
 * @module DriveProjectPlanService
 * @description
 * The Awtsmoos gathers durable creator intent beside live publication, identity, domain, runtime, quota, and observation evidence;
 * Awtsmoos.com builds Project Testimony v3 without treating requested Git, social, bindings, or tenant runtime as already attached authority.
 */

const PROJECT_PLAN_URL = pathToFileURL(path.resolve(__dirname, '../../../../shared/workspace/projectPlan.js')).href;

async function buildDriveProjectPlan(options) {
	const rootPath = normalizeRootPath(options.rootPath);
	const [sites, attachments, projectConfig] = await Promise.all([
		(options.listSites || listSiteMappings)(options.aliasId, options.$i),
		(options.collectAttachments || collectProjectAttachments)({ aliasId: options.aliasId, actor: options.actor || {}, $i: options.$i }),
		(options.findProject || findProjectByRoot)(options.aliasId, rootPath, options.$i)
	]);
	const { buildProjectPlan } = await import(PROJECT_PLAN_URL);
	return buildProjectPlan({
		aliasId: options.aliasId,
		rootPath,
		projectConfig,
		sites,
		attachments,
		runtimeIsolation: options.runtimeIsolation || {}
	});
}

function normalizeRootPath(value) {
	const source = String(value || '').trim().replace(/\\/g, '/');
	if (!source) return '';
	if (source.startsWith('/') || /^[A-Za-z]:/.test(source)) throw projectPlanError('PROJECT_ROOT_MUST_BE_RELATIVE');
	const segments = source.split('/').filter(Boolean);
	if (segments.some(segment => segment === '.' || segment === '..' || segment.includes('\0'))) throw projectPlanError('PROJECT_ROOT_PATH_INVALID');
	return segments.join('/');
}

function projectPlanError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = { buildDriveProjectPlan, normalizeRootPath };
