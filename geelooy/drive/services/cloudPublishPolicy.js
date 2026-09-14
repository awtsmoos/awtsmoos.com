//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Pure identity, source, and budget rules for Builder-to-Cloud publication.
 * @description The Awtsmoos names one public Site while Awtsmoos.com keeps server-compatible limits and control-file exclusions independent from network orchestration.
 */
export const CLOUD_SOURCE_LIMITS = Object.freeze({
	maxFiles: 64,
	maxEntries: 512,
	maxFileChars: 1_000_000,
	maxTotalChars: 2 * 1024 * 1024
});

/** Normalizes human publication identity into strict Site-compatible values. */
export function cloudIdentity(input = {}) {
	const aliasId = String(input.aliasId || "").trim();
	const siteId = slug(input.siteId || input.projectId || "site");
	if (!aliasId) throw publishError("CLOUD_ALIAS_REQUIRED");
	if (!siteId) throw publishError("CLOUD_SITE_ID_REQUIRED");
	const title = String(input.title || siteId).trim().slice(0, 80) || siteId;
	return Object.freeze({ aliasId, siteId, projectId: siteId, title });
}

/** Removes local Remix testimony from source that will itself become public. */
export function publicSourceFiles(files = []) {
	return files.filter(file => !String(file.path || "").startsWith(".awtsmoos-remix-origin"));
}

/** Returns the active immutable production revision when one exists. */
export function activeDeploymentId(site) {
	return site?.source?.kind === "drive-deployment" ? site.source.deploymentId : null;
}

/** Names the source vessel without exposing local machine identity. */
export function sourceVessel(mode) {
	if (mode === "browser") return "browser-workspace";
	if (mode === "os") return "awtsmoos-virtual-os";
	if (mode === "cloud") return "awtsmoos-cloud-workspace";
	return "awtsmoos-tunnel";
}

/** Creates an opaque idempotency key for one browser publication attempt. */
export function cloudOperationId() {
	const random = globalThis.crypto?.randomUUID?.()
		|| `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	return `builder-${random}`;
}

function slug(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 63)
		.replace(/-+$/g, "");
}

function publishError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
