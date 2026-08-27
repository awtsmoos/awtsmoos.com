//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteProjectBootstrap
 * @description
 * The Awtsmoos carries validated source into Drive before binding project and site;
 * Awtsmoos.com composes the existing registries so a future session receives one
 * truthful covenant from draft bytes through canonical public testimony.
 */

const { normalizeProjectConfig, normalizeProjectId } = require('./projectConfigPolicy.js');
const { normalizeSiteId, normalizeSiteRecord } = require('./siteMappingPolicy.js');
const { saveProject } = require('./projectRegistryService.js');
const { upsertSiteMapping } = require('./siteMappingService.js');
const { buildDriveProjectPlan } = require('./projectPlanService.js');
const { publishSiteSource } = require('./siteSourcePublisher.js');
const { buildSiteWorkspaceReceipt } = require('./siteWorkspaceReceipt.js');

const DEFAULT_SERVICES = Object.freeze({
	publishSiteSource,
	saveProject,
	upsertSiteMapping,
	buildDriveProjectPlan
});

async function bootstrapSiteProject(options) {
	const services = { ...DEFAULT_SERVICES, ...(options.services || {}) };
	const projectId = normalizeProjectId(options.projectId || options.siteId);
	const siteId = normalizeSiteId(options.siteId || projectId);
	const rootPath = options.rootPath ?? `sites/${projectId}`;
	const projectInput = normalizedProjectInput(projectId, rootPath, options);
	const siteInput = normalizedSiteInput(siteId, projectInput.rootPath, options);
	const sourcePublication = await services.publishSiteSource({
		aliasId: options.aliasId,
		rootPath: projectInput.rootPath,
		files: options.files || [],
		actorUserId: options.actorUserId,
		credentialId: options.credentialId,
		requestId: options.requestId,
		$i: options.$i
	});
	const projectResult = await services.saveProject({
		aliasId: options.aliasId,
		projectId,
		input: projectInput,
		actorUserId: options.actorUserId,
		credentialId: options.credentialId,
		requestId: options.requestId,
		$i: options.$i
	});
	const site = await services.upsertSiteMapping({
		aliasId: options.aliasId,
		siteId,
		input: siteInput,
		$i: options.$i
	});
	const testimony = await services.buildDriveProjectPlan({
		aliasId: options.aliasId,
		rootPath: projectResult.project.rootPath,
		actor: options.actor || {},
		$i: options.$i
	});
	return {
		project: projectResult.project,
		site,
		testimony,
		sourcePublication,
		receipt: buildSiteWorkspaceReceipt({
			aliasId: options.aliasId,
			project: projectResult.project,
			site,
			testimony,
			sourceVessel: options.sourceVessel,
			sourcePublication
		})
	};
}

function normalizedProjectInput(projectId, rootPath, options) {
	const config = normalizeProjectConfig(projectId, {
		name: options.name || options.title || projectId,
		rootPath,
		runtimePreference: options.runtimePreference || 'static',
		bindings: options.bindings || [],
		providerIntents: options.providerIntents || []
	});
	return {
		name: config.name,
		rootPath: config.rootPath,
		runtimePreference: config.runtimePreference,
		bindings: config.bindings,
		providerIntents: config.providerIntents
	};
}

function normalizedSiteInput(siteId, rootPath, options) {
	const site = normalizeSiteRecord(siteId, {
		title: options.title || options.name || siteId,
		rootPath,
		enabled: options.enabled !== false,
		primary: options.primary === true,
		subdomainRequested: options.subdomainRequested === true
	});
	return {
		title: site.title,
		rootPath: site.rootPath,
		enabled: site.enabled,
		primary: site.primary,
		subdomainRequested: site.subdomainRequested
	};
}

module.exports = { bootstrapSiteProject, DEFAULT_SERVICES };
