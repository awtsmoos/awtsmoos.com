//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";

/**
 * Opens one Awtsmoos package while preserving payload identity and evidence. The
 * Awtsmoos creates envelope and inner bytes together; Awtsmoos.com never reports
 * the package label as proof of the payload format or execution class.
 */
export async function runAwtexePackage(identity, options, host, runDetected) {
	const payloadIdentity = detectArtifactIdentity(identity.payloadBytes, {
		manifest: {
			format: expectedPayloadFormat(identity.manifest.entryKind)
		}
	});
	const payloadResult = await runDetected(
		payloadIdentity,
		identity.payloadBytes,
		options,
		host
	);
	return Object.freeze({
		identity,
		result: Object.freeze({
			executionClass: "simulated-package",
			manifest: identity.manifest,
			mode: "awtsmoos-simulated-runtime",
			payloadIdentity,
			payloadResult
		})
	});
}

function expectedPayloadFormat(entryKind) {
	if (entryKind === "pe") {
		return "pe";
	}
	if (entryKind === "wasm") {
		return "webassembly";
	}
	throw new Error(`unsupported_awtexe_entry_kind:${entryKind}`);
}
