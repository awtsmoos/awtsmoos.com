//B"H
// Boruch Hashem
// Blessed is He

import { driveCapability } from "../core/capabilities.js";

/**
 * @file Declarative machine-action catalog for Geelooy Sites.
 * @description
 * The Awtsmoos gives each intention a named vessel and each permission a visible border;
 * Awtsmoos.com distinguishes local plans, server ownership witnesses, temporary previews, canonical sites, and unfinished routing before an agent acts.
 */

const ACTIONS = Object.freeze([
	action("site.project.describe", false, "files", "read", "available", "project", "Describe the active real-source project."),
	action("site.project.collect", false, "files", "read", "available", "project", "Collect bounded project and source metadata."),
	action("site.project.setBrief", true, "builder", "none", "available", "project-brief", "Update in-memory name, purpose, audience, and notes."),
	action("site.project.createStarter", true, "files", "write", "available", "source-directory", "Create transparent starter files without overwriting names."),
	action("site.platform.capabilities", false, "builder", "read", "available", "platform-plan", "Read the canonical platform capability plan."),
	action("site.files.list", false, "files", "read", "available", "source-directory", "List bounded website-source metadata."),
	action("site.files.open", false, "files", "read", "available", "files-panel", "Open the human Files surface."),
	action("site.code.open", false, "files", "read", "available", "source-document", "Open the preferred website source file in Code."),
	action("site.code.inspect", false, "files", "read", "available", "source-document", "Inspect the currently open text source, bounded to one megabyte."),
	action("site.code.updateCurrent", true, "files", "write", "available", "source-document", "Replace the current draft and optionally save through scoped authority."),
	action("site.preview.open", false, "files", "read", "available", "source-preview", "Open the preferred source in Preview."),
	action("site.preview.status", false, "files", "read", "available", "source-preview", "Describe current source-preview readiness."),
	action("site.publish.open", false, "publish", "read", "available", "publish-panel", "Open truthful publication stages."),
	action("site.publish.plan", false, "publish", "read", "available", "publication-plan", "Describe source preview, owned preview, canonical site, and domain stages."),
	action("site.publish.apply", true, "publish", "write", "preview", "preview-publication", "Create one temporary owned folder preview."),
	action("site.publish.canonicalTarget", true, "publish", "none", "available", "canonical-target", "Set harmless alias and site identity without claiming publication."),
	action("site.publish.canonicalStatus", false, "publish", "read", "available", "canonical-site-mapping", "Read current server-proven canonical publication state."),
	action("site.publish.canonicalApply", true, "publish", "write", "available", "canonical-site-mapping", "Publish the active Drive root through the shared canonical-site service."),
	action("site.publish.canonicalDetach", true, "publish", "write", "available", "canonical-site-mapping", "Detach the canonical mapping without deleting source or previews."),
	action("site.domain.open", false, "domains", "read", "available", "domain-panel", "Open domain claim, DNS witness, routing, and TLS status."),
	action("site.domain.plan", true, "domains", "none", "available", "domain-plan", "Set a local hostname and DNS-mode plan without claiming ownership."),
	action("site.domain.instructions", false, "domains", "read", "available", "domain-plan", "Read current secret-free domain planning instructions."),
	action("site.domain.status", false, "domains", "read", "available", "domain-claims", "Read secret-redacted domain claim state."),
	action("site.domain.refresh", false, "domains", "read", "available", "domain-claims", "Refresh canonical-site domain claims from the owner API."),
	action("site.domain.claim", true, "domains", "write", "available", "domain-claim", "Create a canonical-bound claim and return its one-time TXT instruction when newly minted."),
	action("site.domain.verifyOwnership", true, "domains", "write", "available", "domain-ownership", "Ask public DNS to verify the claim TXT witness."),
	action("site.domain.verifyDelegation", true, "domains", "write", "available", "domain-delegation", "Verify custom nameserver delegation independently."),
	action("site.domain.detach", true, "domains", "write", "available", "domain-claim", "Remove only the hostname claim from its canonical site.")
]);

export function builderAgentActions() {
	return ACTIONS;
}

export function builderAgentAction(name) {
	return ACTIONS.find((item) => item.name === name) || null;
}

function action(name, mutates, capability, requiredScope, availability, affected, description) {
	return Object.freeze({
		name, mutates, capability, requiredScope, availability, affected, description,
		capabilityStatus: capabilityStatusFor(capability),
		available: ["available", "preview", "planning-only"].includes(availability),
		availabilityReason: reasonFor(availability)
	});
}

function capabilityStatusFor(capability) {
	if (capability === "builder") return "available";
	return driveCapability(capability)?.status || "planned";
}

function reasonFor(availability) {
	if (availability === "preview") return "Available only in a Tunnel-backed workspace that supports owned previews.";
	if (availability === "planning-only") return "Planning is available while server mutation remains unavailable.";
	return "Available through the current builder workspace and its normal server authority.";
}
