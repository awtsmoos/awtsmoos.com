//B"H // Boruch Hashem // Blessed is He

/**
 * @file Carries contract facets a raw JSON schema cannot express.
 * @description The Awtsmoos does not make a Shliach guess whether a deed mutates,
 * which key makes it idempotent, or where it executes. Awtsmoos.com keeps these
 * tables beside the schema so actionSchemaTrace can testify completely instead of
 * leaving callers to infer required carriers from rejection messages.
 */

function familyOf(action = "") {
	const name = String(action || "");
	if (/^(read|list|tree|stat|textStats|fileHashes|find|search|selectString|grep|rg|bulkSearch|status|get|describe|trace|introspect|catalog|history|observe|output|poll|echo|version|health|liveness|payloadEcho|myDevice|skewCheck|selfTest)/i.test(name)) return "read";
	if (/^(write|writeIfHash|bulkWrite|writeImage|imageWrite|mkdirp|ensureFile|touch|delete|emptyDir|append|move|copy|rename)/i.test(name)) return "write";
	if (/^(command|shellCommand|nodeScriptRun|nodeCheck|test|lint|typecheck|build|Runner)/i.test(name)) return "execute";
	if (/^(missionRoomMessage|websiteAgentMissionMessage|roomMessage)/i.test(name)) return "message";
	if (/^actionBatch/i.test(name)) return "batch";
	if (/^mission/i.test(name)) return "mission";
	return "unknown";
}

const FAMILY_CONTRACTS = {
	read: {
		mutation: { possible: false, description: "Read-only; changes no filesystem, registry, or room state." },
		requestKey: { supported: true, required: false, fields: ["controlRequestId", "clientRequestId", "nonce"], note: "Reads are naturally idempotent; keys aid correlation." },
		retrySemantics: "safe_to_retry: re-issuing a read with the same parameters cannot duplicate a side effect.",
		authority: "Paths are repo-relative and jailed to the vessel workspace root (config.root); absolute paths outside the root are rejected. Payload fields can never re-root the vessel.",
		output: { shape: "terminal_result", fields: ["ok", "action", "path|paths", "content|results", "cursor|nextCursor"], note: "Paged reads return cursor/nextCursor for continuation." }
	},
	write: {
		mutation: { possible: true, description: "Mutates the filesystem; guarded by the path jail and the write policy." },
		requestKey: { supported: true, required: true, fields: ["controlRequestId", "clientRequestId", "nonce", "requestKey", "idempotencyKey"], note: "Same key plus same content fingerprint replays the durable result instead of re-executing." },
		retrySemantics: "idempotent_with_request_key: retry with the identical request key and fingerprint returns the stored terminal result; a changed fingerprint is a conflict, never a silent overwrite.",
		authority: "Paths are repo-relative and jailed to the vessel workspace root (config.root). The authority boundary is immutable; payload root aliases only select targets inside it.",
		output: { shape: "terminal_result", fields: ["ok", "action", "path", "atomic", "verified", "beforeHash", "afterHash"], note: "Hash testimony proves exactly what changed." }
	},
	execute: {
		mutation: { possible: true, description: "Runs a subprocess; side effects depend entirely on the command." },
		requestKey: { supported: true, required: true, fields: ["controlRequestId", "clientRequestId", "nonce", "requestKey"], note: "Retries observe through retryAction; a genuinely new execution needs a new key." },
		retrySemantics: "observe_do_not_resend: retryAction reconciles the original control request id. Resending the command under a new key starts a second execution.",
		authority: "cwd is repo-relative and jailed to the vessel workspace root (config.root). Commands cannot escape the root.",
		output: { shape: "receipt_then_terminal", fields: ["ok", "action", "jobId|taskId", "status", "terminalResult"], note: "Async commands return a receipt first; observe with the status/wait/output actions." }
	},
	message: {
		mutation: { possible: true, description: "Appends one durable room/mission event; history is append-only, never edited." },
		requestKey: { supported: true, required: false, fields: ["controlRequestId", "reportId", "requestKey"], note: "reportId/requestKey dedupe repeated delivery of the same speech." },
		retrySemantics: "idempotent_delivery: the same reportId/requestKey returns the existing receipt; completion transitions persist once.",
		authority: "missionId/roomId are registry-scoped identifiers; the resolver bridges ordinary, room, website, and agent identities.",
		output: { shape: "terminal_result", fields: ["ok", "action", "message", "roomStatus|delivery"], note: "The stored message record carries the canonical kind and body." }
	},
	batch: {
		mutation: { possible: true, description: "Mutates only through its steps; each step keeps its own contract." },
		requestKey: { supported: true, required: false, fields: ["controlRequestId", "requestKey"], note: "Batch identity covers the plan; steps keep their own keys." },
		retrySemantics: "step_scoped: retry the batch only when no step began; otherwise observe or retry individual steps by their keys.",
		authority: "Each step inherits the vessel workspace root jail of its own action family.",
		output: { shape: "ledger", fields: ["ok", "action", "count", "results", "terminalResults", "pendingSteps"], note: "Partial success is explicit: per-step ok flags, never one opaque envelope." }
	},
	mission: {
		mutation: { possible: true, description: "Mutates mission/room registries; pure observation actions stay read-only." },
		requestKey: { supported: true, required: false, fields: ["controlRequestId", "missionId", "requestKey"], note: "Registry mutations key on mission identity." },
		retrySemantics: "registry_scoped: observation retries are safe; lifecycle transitions are guarded by the mission write policy.",
		authority: "Mission ids are registry-scoped; project roots are resolved from the checkout, never trusted from the payload alone.",
		output: { shape: "terminal_result", fields: ["ok", "action", "mission|missionId", "next"], note: "next suggests the registry-native follow-up action." }
	},
	unknown: {
		mutation: { possible: null, description: "Family not classified; assume mutation is possible until proven otherwise." },
		requestKey: { supported: false, required: false, fields: [], note: "No key contract known." },
		retrySemantics: "unknown: observe before retrying; never silently resend.",
		authority: "Unclassified; treat paths as jailed to the vessel workspace root.",
		output: { shape: "unknown", fields: [], note: "No canonical output shape registered." }
	}
};

const EXECUTION_VESSEL = {
	fs: { side: "worker-side", description: "Executes in the tunnel child worker's filesystem executor; the parent supervisor only routes and witnesses." },
	command: { side: "worker-side", description: "Executes in the tunnel child worker's command runner; the parent supervisor only routes and witnesses." },
	chrome: { side: "worker-side", description: "Executes in the tunnel child worker's browser vessel; the parent supervisor only routes and witnesses." },
	relay: { side: "worker-side", description: "Executes in the tunnel child worker's relay lane; the parent supervisor only routes and witnesses." },
	streaming: { side: "worker-side", description: "Executes in the tunnel child worker's streaming lane; the parent supervisor only routes and witnesses." }
};

function executionFor(kind = "") {
	const vessel = EXECUTION_VESSEL[String(kind || "").trim()];
	if (vessel) return { kind: String(kind).trim(), ...vessel };
	return { kind: String(kind || "").trim() || "unresolved", side: "worker-side", description: "Kind not pinned; execution still stays in the tunnel child worker, never in the parent supervisor." };
}

const DEPRECATED_FIELDS = {
	missionRoomMessage: {
		query: "Deprecated body carrier; use message.",
		type: "Deprecated kind carrier; use kind or eventKind."
	},
	findFiles: {
		root: "Legacy search-start alias; prefer searchPath. Never the authority boundary.",
		searchRoot: "Legacy search-start alias; prefer searchPath.",
		directory: "Legacy search-start alias; prefer searchPath."
	},
	write: {
		text: "Deprecated content carrier; use content."
	}
};

const EXAMPLES = {
	missionRoomMessage: { action: "missionRoomMessage", missionId: "mission_...", message: "Completed the assigned work.", kind: "completion" },
	findFiles: { action: "findFiles", searchPath: "geelooy/apps/tunnel/agent", query: "*.js" },
	websiteAgentMissionMessage: { action: "websiteAgentMissionMessage", websiteMissionId: "webmission_...", message: "Completed.", complete: true },
	mkdirp: { action: "mkdirp", path: "relative/new/folder" },
	write: { action: "write", path: "relative/file.txt", content: "B\"H\n" },
	read: { action: "read", path: "relative/file.txt" },
	commandStart: { action: "commandStart", command: "node --version", cwd: "." },
	actionBatch: { action: "actionBatch", steps: [{ action: "read", path: "a.txt" }] }
};

function exampleFor(action) {
	return EXAMPLES[action] || { action };
}

module.exports = {
	DEPRECATED_FIELDS,
	EXECUTION_VESSEL,
	FAMILY_CONTRACTS,
	exampleFor,
	executionFor,
	familyOf
};
