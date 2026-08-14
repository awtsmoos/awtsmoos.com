//B"H
// Boruch Hashem
// Blessed is He

import { normalizeProjectAttachments } from "./projectAttachments.js";
import { PROJECT_CAPABILITIES } from "./projectCapabilities.js";
import { normalizeProjectBindings } from "./projectBindings.js";
import { normalizeProjectIntent } from "./projectIntents.js";
import { PROJECT_OBSERVABILITY } from "./projectObservability.js";
import { evaluateRuntimeIsolation } from "./runtimeIsolation.js";
import { runtimeQuotaProfile } from "./runtimeQuotaPolicy.js";

/**
 * @file Portable Project Testimony v3 shared across Geelooy surfaces.
 * @description
 * The Awtsmoos separates what the creator intends from what providers presently prove;
 * Awtsmoos.com gathers identity, publication, runtime trust, quota, observation, intent, attachment evidence, and binding names without mixing wish and authority.
 */

export function buildProjectPlan(input = {}) {
	const config = input.projectConfig || {};
	const rootPath = cleanPath(config.rootPath ?? input.rootPath ?? "");
	const isolation = evaluateRuntimeIsolation(input.runtimeIsolation || {});
	return Object.freeze({
		version: 3,
		identity: identity(input, config, rootPath),
		configuration: configuration(config),
		publication: publication(input),
		capabilities: PROJECT_CAPABILITIES,
		intent: normalizeProjectIntent(config),
		runtime: runtimeTestimony(isolation),
		observability: PROJECT_OBSERVABILITY,
		attachments: normalizeProjectAttachments(input.attachments || []),
		bindings: normalizeProjectBindings(config.bindings || input.bindings || []),
		next: nextCapabilities()
	});
}

function identity(input, config, rootPath) {
	const aliasId = String(input.aliasId || "").trim();
	const name = String(config.name || input.name || input.site?.name || rootPath.split("/").filter(Boolean).at(-1) || aliasId || "Awtsmoos project");
	return Object.freeze({ aliasId, projectId: config.id || null, rootPath, name });
}

function configuration(config) {
	return Object.freeze({
		registered: Boolean(config.id),
		createdAt: config.createdAt || null,
		updatedAt: config.updatedAt || null
	});
}

function publication(input) {
	const sites = Object.freeze(Array.from(input.sites || []).map(siteSummary));
	return Object.freeze({ primary: input.site || null, sites });
}

function runtimeTestimony(isolation) {
	return Object.freeze({
		trusted: Object.freeze({ trust: "trusted-node", publicActivation: false, quota: runtimeQuotaProfile("trusted") }),
		tenant: Object.freeze({ trust: "isolated-tenant", publicActivation: isolation.publicTenantActivation, quota: runtimeQuotaProfile("tenant"), isolation })
	});
}

function nextCapabilities() {
	return Object.freeze(PROJECT_CAPABILITIES.filter(item => ["attach", "blocked", "planned"].includes(item.readiness)).map(item => item.id));
}

function siteSummary(site) {
	return Object.freeze({
		id: String(site?.id || site?.siteId || ""),
		rootPath: String(site?.rootPath || site?.project?.rootPath || ""),
		route: String(site?.project?.publication?.route || site?.canonicalUrl || "")
	});
}

function cleanPath(value) {
	return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}
