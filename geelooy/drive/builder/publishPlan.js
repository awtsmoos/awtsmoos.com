//B"H
// Boruch Hashem
// Blessed is He

import { describeWebsiteProject } from "./projectDescriptor.js";
import { collectSourceInventory } from "./sourceInventory.js";

/**
 * @file Four-stage publication testimony for Geelooy Sites.
 * @description The Awtsmoos reveals source reflection, temporary owned preview, canonical alias/site identity, and custom hostname as four different gates whose proofs never collapse inside Awtsmoos.com.
 */

export function buildPublishPlan(state = {}) {
	const project = describeWebsiteProject(state);
	const inventory = collectSourceInventory(state);
	const sourcePreview = sourceStage(inventory);
	const previewPublication = previewStage(state, project);
	const canonicalPublication = canonicalStage(state, project);
	const customDomain = domainStage(state, canonicalPublication);
	return Object.freeze({
		projectName: project.name,
		rootPath: project.rootPath,
		entryPoint: inventory.entryPoint,
		readyForStaticPreview: sourcePreview.available,
		sourcePreview,
		previewPublication,
		canonicalPublication,
		customDomain,
		stages: Object.freeze([
			stage(sourcePreview),
			stage(previewPublication),
			stage(canonicalPublication),
			stage(customDomain)
		]),
		warnings: inventory.entryPoint ? [] : ["Add index.html before publishing a conventional static website."]
	});
}

function sourceStage(inventory) {
	const available = Boolean(inventory.entryPoint);
	return Object.freeze({
		id: "source-preview",
		label: "Source preview",
		available,
		state: available ? "ready" : "gated",
		status: available ? `${inventory.entryPoint} ready` : "Add index.html",
		description: "Sandboxed reflection of current real HTML or Markdown source."
	});
}

function previewStage(state, project) {
	const available = state.transportCanPublish === true;
	const count = Array.isArray(state.previews) ? state.previews.length : 0;
	return Object.freeze({
		id: "owned-folder-preview",
		label: "Owned folder preview",
		available,
		state: available ? "available" : "gated",
		status: count ? `${count} active preview${count === 1 ? "" : "s"}` : available ? "Available via Tunnel" : "Tunnel required",
		description: "Temporary full-folder preview with explicit visibility and TTL.",
		count,
		kind: "owned-folder-preview",
		defaultVisibility: "private",
		allowedTtlSeconds: Object.freeze([3600, 86400, 604800]),
		fullRelativeAssets: true,
		projectName: project.name
	});
}

function canonicalStage(state, project) {
	const target = state.canonicalTarget || {};
	const linked = project.canonicalSiteLinked;
	const targetConfigured = Boolean(target.aliasId && target.siteId);
	return Object.freeze({
		id: "canonical-site",
		label: "Canonical Awtsmoos Site",
		available: targetConfigured,
		state: linked ? "ready" : targetConfigured ? "available" : "gated",
		status: linked ? "Published" : targetConfigured ? "Ready for server proof" : "Choose alias + site ID",
		description: "Durable alias-owned site mapping served through the public Awtsmoos site gateway.",
		targetConfigured,
		linked,
		aliasId: String(target.aliasId || ""),
		siteId: String(target.siteId || ""),
		sourceRoot: project.rootPath,
		canonicalPath: linked ? project.canonicalPath : "",
		serverStatus: project.canonicalSiteStatus,
		compatiblePublicRoute: "/sites/:aliasId/:siteId/"
	});
}

function domainStage(state, canonical) {
	const planned = Boolean(state.domainPlan);
	return Object.freeze({
		id: "custom-domain",
		label: "Custom domain + HTTPS",
		available: false,
		state: canonical.linked ? "planning" : "gated",
		status: canonical.linked ? planned ? "Plan prepared" : "Planning only" : "Canonical site required",
		description: canonical.linked
			? "Plan ownership, DNS, routing, and TLS. Server claim activation remains a later gate."
			: "Publish a canonical Awtsmoos site before binding a hostname.",
		planningOnly: true,
		canonicalRequired: !canonical.linked
	});
}

function stage(value) {
	return Object.freeze({
		id: value.id,
		label: value.label,
		available: value.available,
		state: value.state,
		status: value.status,
		description: value.description
	});
}
