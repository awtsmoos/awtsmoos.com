//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure canonical-publication state transitions for Geelooy Sites.
 * @description
 * The Awtsmoos separates proof from presentation so Awtsmoos.com can audit every target, refresh, publish, detach, and error transition without performing one network act.
 */

export function normalizeCanonicalTarget(input = {}) {
	return {
		aliasId: String(input.aliasId || "").trim().slice(0, 80),
		siteId: String(input.siteId || "").trim().slice(0, 63)
	};
}

export function canonicalWorkspaceRoot(value) {
	const normalized = String(value ?? ".").trim();
	return !normalized || normalized === "." ? "" : normalized;
}

export function targetStatePatch(snapshot, canonicalTarget) {
	const previous = snapshot.canonicalTarget || {};
	const identityChanged = previous.aliasId !== canonicalTarget.aliasId
		|| previous.siteId !== canonicalTarget.siteId;
	return {
		canonicalTarget,
		canonicalSite: identityChanged ? null : snapshot.canonicalSite,
		canonicalSites: previous.aliasId !== canonicalTarget.aliasId ? [] : safeCanonicalSites(snapshot.canonicalSites),
		canonicalSiteStatus: identityChanged ? "unconfigured" : snapshot.canonicalSiteStatus,
		error: "",
		message: canonicalTargetMessage(canonicalTarget)
	};
}

export function refreshedCanonicalState(canonicalSites, target) {
	const safeSites = safeCanonicalSites(canonicalSites);
	const canonicalSite = target.siteId
		? safeSites.find(site => site.id === target.siteId) || null
		: null;
	return {
		canonicalSites: safeSites,
		canonicalSite,
		canonicalSiteStatus: canonicalSite?.enabled ? "ready" : "unconfigured",
		error: "",
		message: canonicalSite
			? "Canonical site mapping confirmed by the server."
			: "Canonical site mappings refreshed."
	};
}

export function appliedCanonicalState(snapshot, canonicalSite) {
	return {
		canonicalSites: mergeCanonicalSite(snapshot.canonicalSites, canonicalSite),
		canonicalSite,
		canonicalSiteStatus: canonicalSite.enabled ? "ready" : "unconfigured",
		error: "",
		message: canonicalSite.canonicalPath
			? `Canonical site published at ${canonicalSite.canonicalPath}`
			: "Canonical site mapping published."
	};
}

export function detachedCanonicalState(snapshot, siteId) {
	return {
		canonicalSites: safeCanonicalSites(snapshot.canonicalSites).filter(site => site.id !== siteId),
		canonicalSite: null,
		canonicalSiteStatus: "unconfigured",
		error: "",
		message: "Canonical site mapping detached. Source files and previews were left untouched."
	};
}

export function canonicalFailureState(message, status = "error") {
	return {
		canonicalSiteStatus: status,
		error: message
	};
}

function mergeCanonicalSite(sites, site) {
	return [...safeCanonicalSites(sites).filter(item => item.id !== site.id), site];
}

function safeCanonicalSites(value) {
	return Array.isArray(value) ? value : [];
}

function canonicalTargetMessage(target) {
	return target.aliasId && target.siteId
		? `Canonical target set to ${target.aliasId}/${target.siteId}. Server ownership is not yet proven.`
		: "Canonical target cleared or incomplete.";
}
