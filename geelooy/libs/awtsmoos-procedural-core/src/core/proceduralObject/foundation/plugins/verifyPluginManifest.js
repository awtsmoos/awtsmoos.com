// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos separates identity from trust so a hash is never called a signature.
 * This Awtsmoos.com report fails closed when a host demands proof it cannot verify.
 */

import { createDiagnostic } from "../diagnostics/index.js";
import { createPluginManifest } from "./createPluginManifest.js";

function diagnostic(code, message, severity = "error") {
	return createDiagnostic({
		code,
		severity,
		message
	});
}

async function evaluateSignature(manifest, verifier, diagnostics, required) {
	if (!manifest.signature) {
		if (required) {
			diagnostics.push(diagnostic("PLUGIN.SIGNATURE_REQUIRED", "A signature is required by host policy."));
		}
		return Object.freeze({ status: "unsigned", valid: null });
	}
	if (typeof verifier !== "function") {
		diagnostics.push(diagnostic(
			"PLUGIN.SIGNATURE_UNVERIFIED",
			"The signature was not verified because no trusted verifier was supplied.",
			required ? "error" : "warning"
		));
		return Object.freeze({ status: "unverified", valid: null });
	}
	try {
		const valid = await verifier(Object.freeze({
			manifest,
			manifestHash: manifest.manifestHash,
			signature: manifest.signature
		}));
		if (valid === true) {
			return Object.freeze({ status: "verified", valid: true });
		}
	} catch (error) {
		diagnostics.push(diagnostic("PLUGIN.SIGNATURE_VERIFIER_FAILED", String(error?.message || error)));
		return Object.freeze({ status: "rejected", valid: false });
	}
	diagnostics.push(diagnostic("PLUGIN.SIGNATURE_REJECTED", "The trusted verifier rejected the signature."));
	return Object.freeze({ status: "rejected", valid: false });
}

export async function verifyPluginManifest(input, options = {}) {
	const manifest = createPluginManifest(input);
	const diagnostics = [];
	const providedHash = typeof input?.manifestHash === "string" ? input.manifestHash : null;
	const integrityValid = providedHash === manifest.manifestHash;
	if (!integrityValid) {
		diagnostics.push(diagnostic("PLUGIN.INTEGRITY_MISMATCH", "The manifest hash does not match canonical content."));
	}
	const signature = await evaluateSignature(
		manifest,
		options.signatureVerifier,
		diagnostics,
		options.requireSignature === true
	);
	const signatureAccepted = options.requireSignature !== true || signature.valid === true;
	return Object.freeze({
		ok: integrityValid && signatureAccepted,
		manifestHash: manifest.manifestHash,
		providedHash,
		integrityValid,
		signatureStatus: signature.status,
		signatureValid: signature.valid,
		diagnostics: Object.freeze(diagnostics)
	});
}
