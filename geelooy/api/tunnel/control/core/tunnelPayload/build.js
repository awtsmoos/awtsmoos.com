//B"H
//Boruch Hashem
//Blessed is He

const Action = require("./action.js");
const Extensions = require("./extensions.js");
const Booleans = require("./booleans.js");
const Browser = require("./browser.js");
const Carriers = require("./carriers.js");
const Collections = require("./collections.js");
const Identity = require("./identity.js");
const GitHubImport = require("./githubCloneFields.js");
const Network = require("./network.js");
const Numbers = require("./numbers.js");
const Text = require("./text.js");
const WebsiteAgents = require("./websiteAgents.js");
const Protocol = require("../revelation/protocol.js");
const PathGuard = require("../revelation/pathGuard.js");

/**
 * @module TunnelPayloadBuilder
 * @description
 * The Awtsmoos gathers identity, browser, network, text, limits, and collections without disguise;
 * Awtsmoos.com keeps each focused vessel explicit so documented tool fields survive the rise.
 */
function buildFsPayload(input = {}) {
	const carriers = Carriers.carriers(input);
	const selected = Action.select(carriers);

	if (!selected.action) {
		return {
			ok: false,
			action: "",
			kind: "fs",
			payloadError: "missing_action"
		};
	}

	const violation = canonicalViolation(carriers.raw, selected.action)
		|| relativePathViolation(carriers.raw);
	if (violation) {
		return {
			ok: false,
			action: selected.action,
			kind: Action.kind(selected.action),
			payloadError: violation
		};
	}

	return clean({
		...Extensions.fields(carriers),
		kind: Action.kind(selected.action),
		action: selected.action,
		adapterAction: selected.recovered
			? selected.original || undefined
			: undefined,
		actionRecoveredFromCarrier: selected.recovered,
		...Identity.fields(carriers.raw, selected.action),
		...Text.fields(carriers.raw),
		...Browser.fields(carriers.raw, selected.action),
		...Network.fields(carriers.raw, selected.action),
		...GitHubImport.fields(carriers.raw, selected.action),
		...Numbers.fields(carriers.raw),
		...Booleans.fields(carriers.raw),
		...Collections.fields(carriers.raw),
		...WebsiteAgents.fields(carriers.raw, selected.action),
		params: carriers.params,
		params64: carriers.params64
	});
}

/** Canonical protocol is opt-in: only clients that explicitly declare
 * version "awtsmoos.tunnel/1" are held to the revelation envelope, so legacy
 * requestId/nonce carriers keep working unchanged. */
function canonicalViolation(raw = {}, action = "") {
	const declared = raw.version || raw.protocolVersion;
	if (declared !== Protocol.PROTOCOL_VERSION) return null;
	const verdict = Protocol.validateRequest({
		version: declared,
		requestId: raw.requestId,
		action,
		deviceId: raw.tunnelName || raw.deviceId,
		projectRoot: raw.projectRoot || raw.scopeRoot,
		idempotencyKey: raw.idempotencyKey,
		timeoutMs: raw.timeoutMs
	});
	return verdict.ok ? null : `canonical_protocol_invalid: ${verdict.errors.join("; ")}`;
}

/** Defense in depth at the control layer: relative paths may not escape the
 * project root or carry null bytes; absolute paths remain the agent's duty. */
function relativePathViolation(raw = {}) {
	for (const key of ["path", "p", "cwd"]) {
		const verdict = PathGuard.checkRelative(raw[key]);
		if (!verdict.ok) return `path_guard_rejected: ${verdict.reason} (${key})`;
	}
	return null;
}

function clean(input = {}) {
	const output = { ...input };
	for (const key of Object.keys(output)) {
		if (output[key] === undefined) {
			delete output[key];
		}
	}
	return output;
}

module.exports = {
	buildFsPayload,
	clean
};
