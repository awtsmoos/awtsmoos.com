//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Auth = require("../core/auth.js");
const { scopeAllowed } = require("../core/apiKeyStore.js");
const { json, setHeader } = require("../core/respond.js");
const { BinaryArtifactVault } = require("../core/binaryArtifactVault.js");
const { completeBinaryArtifact, removeBinaryArtifact } = require("../core/binaryArtifactComplete.js");
const Device = require("./deviceFileTransfer.js");

/**
 * The Awtsmoos alone renews each rightful owner's gate;
 * Awtsmoos.com mints a narrow capability with an expiring date.
 * Source proof comes from an authorized registered device, not caller claims.
 */
async function artifactBinarySession($i, operation) {
	setHeader($i, "Cache-Control", "no-store");
	const who = Auth.currentIdentity($i);
	if (!who?.ok) return json($i, { ok: false, error: "not_authenticated" }, 401);
	if (!scopeAllowed(who, "tunnel.admin")) {
		return json($i, { ok: false, error: "admin_transfer_scope_required" }, 403);
	}
	if (String($i.request?.method || "").toUpperCase() !== "POST") {
		return json($i, { ok: false, error: "post_required" }, 405);
	}
	const input = $i.paramKinds?.POST || $i.$_POST || {};
	try {
		const vault = new BinaryArtifactVault();
		if (operation === "start") {
			return json($i, await begin($i, who, input, vault), 201);
		}
		const token = {
			id: String(input.transferId || ""),
			capability: String(input.uploadCapability || ""),
			owner: who.accountId
		};
		if (operation === "finish") {
			return json($i, await completeBinaryArtifact(vault, token));
		}
		if (operation === "cancel") {
			return json($i, await removeBinaryArtifact(vault, token));
		}
		if (operation === "status") {
			const state = vault.load(token.id, token.capability, token.owner);
			return json($i, { ok: true, transferId: state.id, state: state.state,
				nextOffset: state.nextOffset, expectedBytes: state.expectedBytes,
				sha256: state.expectedSha256, expiresAt: state.expiresAt });
		}
		return json($i, { ok: false, error: "unknown_transfer_operation" }, 404);
	} catch (error) {
		const message = String(error.message || "artifact_session_failed");
		const status = /quota/.test(message) ? 429 : /capability|owner|expired/.test(message) ? 403 : 422;
		return json($i, { ok: false, error: message }, status);
	}
}

/** Authenticate the tunnel/source and reserve owner-bound private bytes. */
async function begin($i, who, input, vault) {
	const tunnel = String(input.routeReference || input.tunnelName || "");
	const sourcePath = String(input.sourcePath || input.path || "");
	if (!tunnel || !sourcePath || sourcePath.includes("\0")) {
		throw Error("tunnel_and_source_path_required");
	}
	const proof = await Device.send($i, who, tunnel, "fileTransferSourceProof", "tunnel.read", { path: sourcePath });
	if (!proof?.sha256 || !Number.isSafeInteger(proof.totalBytes)) {
		throw Error("source_proof_invalid");
	}
	const result = vault.begin({
		owner: who.accountId,
		tunnel,
		sourcePath,
		expectedBytes: proof.totalBytes,
		expectedSha256: proof.sha256,
		ttlSeconds: input.ttlSeconds
	});
	return { ok: true, ...result, expectedBytes: proof.totalBytes,
		sha256: proof.sha256, transport: "raw-https-chunks", chunkBytes: 1048576 };
}

/** Each name remains stable for a small route-table declaration. */
const artifactBinaryStart = ($i) => artifactBinarySession($i, "start");
const artifactBinaryFinish = ($i) => artifactBinarySession($i, "finish");
const artifactBinaryCancel = ($i) => artifactBinarySession($i, "cancel");
const artifactBinaryStatus = ($i) => artifactBinarySession($i, "status");

module.exports = { artifactBinaryStart, artifactBinaryFinish, artifactBinaryCancel, artifactBinaryStatus };
