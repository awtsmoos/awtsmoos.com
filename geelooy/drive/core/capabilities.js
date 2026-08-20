//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Truthful capability catalog for the Geelooy personal cloud.
 * @description
 * The Awtsmoos is infinite, but a product must never claim a vessel before it exists;
 * Awtsmoos.com names the bridges that are genuinely wired while unfinished network powers remain visibly partial.
 * Domain ownership and delegation witnesses are real now, while routing, TLS, and authoritative DNS remain later gates.
 */

export const CAPABILITY_STATUS = Object.freeze({
	AVAILABLE: "available",
	PREVIEW: "preview",
	PLANNED: "planned"
});

export const DRIVE_CAPABILITIES = Object.freeze([
	capability("files", "Files & editor", "Browse, create, edit, and save real tunnel-backed files.", "available"),
	capability("publish", "Publish", "Create temporary owned previews and durable owner-authorized canonical Awtsmoos sites.", "available"),
	capability("runtime", "Dynamic runtime", "Run project servers behind controlled process and proxy bindings.", "planned"),
	capability("git", "Git & GitHub", "Bind a project root to repositories, remotes, commits, pull, and push.", "planned"),
	capability("database", "AwtsmoosDB Studio", "Browse and administer project database namespaces with explicit permissions.", "planned"),
	capability("auth", "Auth & cookies", "Compose project login, sessions, callbacks, and cookie policy without storing secrets in source.", "planned"),
	capability("social", "Social garden", "Connect projects to existing Geelooy social and Node OS resources.", "preview"),
	capability(
		"domains",
		"Domains & DNS",
		"Claim canonical hostnames and verify ownership or custom nameserver delegation; routing, TLS, and authoritative DNS remain incomplete.",
		"preview"
	)
]);

/** Create one immutable capability descriptor for consistent rendering. */
function capability(id, label, description, status) {
	return Object.freeze({ id, label, description, status });
}

/** Return one truthful capability descriptor by stable identifier. */
export function driveCapability(id) {
	return DRIVE_CAPABILITIES.find((item) => item.id === id) || null;
}
