//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable attachment declarations for provider-backed project powers.
 * @description
 * The Awtsmoos lets a project point toward Git, identity, social, domains, and providers without swallowing their credentials;
 * Awtsmoos.com records only provider identity and readiness, leaving secret material in the guarded service that actually owns it.
 */

const KINDS = new Set(["git", "auth", "social", "domain", "runtime", "database"]);
const STATES = new Set(["attached", "ready", "degraded", "missing", "blocked"]);

export function normalizeProjectAttachments(input = []) {
	if (!Array.isArray(input)) throw new TypeError("Project attachments must be an array.");
	return Object.freeze(input.map(normalizeAttachment));
}

function normalizeAttachment(input) {
	const kind = String(input?.kind || "").trim().toLowerCase();
	const state = String(input?.state || "attached").trim().toLowerCase();
	const provider = String(input?.provider || "").trim().toLowerCase();
	if (!KINDS.has(kind)) throw new TypeError("Unknown project attachment kind.");
	if (!STATES.has(state)) throw new TypeError("Unknown project attachment state.");
	if (!provider || provider.length > 80) throw new TypeError("Attachment provider is required.");
	for (const key of Object.keys(input || {})) {
		if (/(?:token|secret|password|credential|api.?key)/i.test(key)) throw new TypeError("Credential fields are forbidden in project attachments.");
	}
	return Object.freeze({ kind, provider, state, id: String(input?.id || provider).trim() });
}
