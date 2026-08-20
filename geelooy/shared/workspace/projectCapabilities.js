//B"H
// Boruch Hashem
// Blessed is He

import { PROJECT_READINESS, PROJECT_TRUST } from "./projectTrust.js";

/**
 * @file Canonical Geelooy project capabilities with compatibility stages for every creator surface.
 * @description
 * The Awtsmoos is one while file, runtime, data, identity, social, Git, and domain appear as many lights;
 * Awtsmoos.com lets old and new journeys name the same capabilities while readiness and trust remain explicit in sight.
 */

export const PROJECT_CAPABILITY_STAGES = Object.freeze([
	"build",
	"run",
	"ship",
	"connect"
]);

export const PROJECT_CAPABILITIES = Object.freeze([
	capability("files", "Files", "build", PROJECT_READINESS.READY, PROJECT_TRUST.SESSION, "Create, browse, upload, move, copy, read, and delete alias-owned project files."),
	capability("code", "Code", "build", PROJECT_READINESS.READY, PROJECT_TRUST.SESSION, "Edit understandable project source and assets in Geelooy development surfaces."),
	capability("preview", "Preview", "build", PROJECT_READINESS.READY, PROJECT_TRUST.STATIC, "Preview HTML and adjacent assets without granting server-side code authority."),
	capability("publish", "Static hosting", "ship", PROJECT_READINESS.READY, PROJECT_TRUST.STATIC, "Publish folders as named static sites through Drive and Sites."),
	capability("database", "AwtsmoosDB", "data", PROJECT_READINESS.READY, PROJECT_TRUST.SESSION, "Use authenticated alias data surfaces and inspect records through AwtsmoosDB Explorer."),
	capability("native-compute", "Connected compute", "run", PROJECT_READINESS.READY, PROJECT_TRUST.OWNED_DEVICE, "Run supervised processes on an account-owned connected machine with logs and explicit lifecycle."),
	capability("trusted-node", "Trusted Node server", "run", PROJECT_READINESS.LIMITED, PROJECT_TRUST.TRUSTED_NODE, "Run Node entry files on an owned machine; project code has full Node authority on that machine."),
	capability("tenant-node", "Isolated tenant Node", "run", PROJECT_READINESS.BLOCKED, PROJECT_TRUST.ISOLATED_TENANT, "Public multi-tenant server code remains blocked until a genuine OS/container/VM isolation provider is installed."),
	capability("bindings", "Secret bindings", "connect", PROJECT_READINESS.ATTACH, PROJECT_TRUST.SESSION, "Declare binding names in projects while secret values remain in server/device credential stores."),
	capability("auth", "Project auth", "connect", PROJECT_READINESS.ATTACH, PROJECT_TRUST.SESSION, "Attach Geelooy identity or a future project-local session policy without storing raw credentials in source."),
	capability("social", "Social Garden", "connect", PROJECT_READINESS.ATTACH, PROJECT_TRUST.SESSION, "Attach permitted aliases, posts, series, feeds, and scoped publishing operations."),
	capability("git", "Git & GitHub", "connect", PROJECT_READINESS.ATTACH, PROJECT_TRUST.OWNED_DEVICE, "Attach repository history and provider remotes without placing provider tokens in project files."),
	capability("domains", "Domains & HTTPS", "ship", PROJECT_READINESS.ATTACH, PROJECT_TRUST.SESSION, "Attach paths, subdomains, verified custom domains, DNS ownership, and certificate state."),
	capability("observe", "Observability", "observe", PROJECT_READINESS.READY, PROJECT_TRUST.SESSION, "Inspect process, request, byte, memory, I/O, log, usage, and Peruta testimony from source-backed metrics.")
]);

export function projectCapabilityById(id) {
	return PROJECT_CAPABILITIES.find(item => item.id === id) || null;
}

export function projectCapabilitiesByStage(stage) {
	return PROJECT_CAPABILITIES.filter(item => item.stage === stage);
}

export function projectCapabilitiesForStage(stage) {
	return projectCapabilitiesByStage(stage);
}

function capability(id, title, stage, readiness, trust, description) {
	return Object.freeze({ id, title, stage, readiness, trust, description });
}
