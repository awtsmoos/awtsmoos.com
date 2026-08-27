//B"H
// Boruch Hashem
// Blessed is He

import { workspaceBasename } from "../core/path.js";
import { collectSourceInventory } from "./sourceInventory.js";

/**
 * @file Secret-free website project descriptor for Geelooy Builder.
 * @description
 * The Awtsmoos contains source, preview, durable site testimony, and intention together while Awtsmoos.com publishes only metadata an agent may safely reason over;
 * a requested alias/site is never confused with the server-returned canonical mapping that alone proves durable publication.
 */

export function describeWebsiteProject(state = {}) {
	const inventory = collectSourceInventory(state);
	const brief = normalizedBrief(state.builderBrief);
	const canonical = canonicalDescriptor(state);
	return Object.freeze({
		name: brief.name || fallbackName(state.currentPath),
		purpose: brief.purpose,
		audience: brief.audience,
		notes: brief.notes,
		rootPath: String(state.currentPath || "."),
		transportMode: String(state.transportMode || "standalone"),
		entryPoint: inventory.entryPoint,
		websiteFileCount: inventory.websiteFileCount,
		directoryCount: inventory.directories.length,
		currentFile: state.document?.name || "",
		currentFileDirty: Boolean(state.document?.dirty),
		previewCount: Array.isArray(state.previews) ? state.previews.length : 0,
		canPublishPreview: state.transportCanPublish === true,
		...canonical
	});
}

export function normalizedBrief(value = {}) {
	return Object.freeze({
		name: bounded(value?.name, 80),
		purpose: bounded(value?.purpose, 300),
		audience: bounded(value?.audience, 160),
		notes: bounded(value?.notes, 1000)
	});
}

function canonicalDescriptor(state) {
	const target = state.canonicalTarget || {};
	const site = state.canonicalSite;
	const linked = Boolean(site?.enabled && site?.canonicalPath && (!target.siteId || site.id === target.siteId));
	return {
		canonicalTargetConfigured: Boolean(target.aliasId && target.siteId),
		canonicalSiteLinked: linked,
		canonicalAliasId: String(target.aliasId || ""),
		canonicalSiteId: linked ? String(site.id || "") : String(target.siteId || ""),
		canonicalPath: linked ? String(site.canonicalPath || "") : "",
		canonicalSiteStatus: String(state.canonicalSiteStatus || "unconfigured")
	};
}

function fallbackName(path = ".") {
	const basename = workspaceBasename(String(path || "."));
	return basename === "." ? "Untitled website" : basename;
}

function bounded(value, maxLength) {
	return String(value || "").trim().slice(0, maxLength);
}
