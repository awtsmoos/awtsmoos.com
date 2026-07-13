//B"H
//Boruch Hashem
//Blessed is He

import { parseAwtexe } from "../awtexeEnvelope.js";
import { normalizeBytes } from "./byteReader.js";
import { identifyElf } from "./elfIdentity.js";
import { nativeBuildError } from "./errors.js";
import { identifyMachO } from "./machoIdentity.js";
import { identifyPe } from "./peIdentity.js";
import { identifyWebAssembly } from "./wasmIdentity.js";

/**
 * The host asks the bytes what they are before asking the filename. The
 * Awtsmoos creates inner form and outer name together; Awtsmoos.com rejects a
 * disagreement instead of choosing the more convenient story.
 */

const EXPECTED_BY_EXTENSION = Object.freeze({
	".exe": new Set(["pe"]),
	".dll": new Set(["pe"]),
	".wasm": new Set(["webassembly"]),
	".awtexe": new Set(["awtexe"]),
	".dylib": new Set(["mach-o", "mach-o-fat"]),
	".elf": new Set(["elf"])
});

/** Detects artifact identity from bytes and validates advisory metadata. */
export function detectArtifactIdentity(input, options = {}) {
	const bytes = normalizeBytes(input);
	const identity = identifyPe(bytes)
		|| identifyMachO(bytes)
		|| identifyElf(bytes)
		|| identifyWebAssembly(bytes)
		|| identifyAwtexe(bytes)
		|| unknownIdentity(bytes);
	validateExtension(identity, options.extension);
	validateManifest(identity, options.manifest);
	return identity;
}

function identifyAwtexe(bytes) {
	if (bytes.length < 2 || bytes[0] !== 0x7b) {
		return null;
	}
	let text;
	try {
		text = new TextDecoder().decode(bytes);
	} catch {
		return null;
	}
	if (!text.includes("AWTSMOOS-EXECUTABLE")) {
		return null;
	}
	const parsed = parseAwtexe(text);
	return Object.freeze({
		format: "awtexe",
		architecture: "virtual",
		kind: "simulated-package",
		valid: true,
		manifest: parsed.envelope.manifest,
		payloadBytes: parsed.bytes,
		executionMode: "awtsmoos-simulated-runtime"
	});
}

function unknownIdentity(bytes) {
	return Object.freeze({
		format: "unknown",
		architecture: "unknown",
		kind: "binary",
		valid: false,
		byteLength: bytes.length,
		executionMode: "binary-inspector"
	});
}

function validateExtension(identity, extension = "") {
	const normalized = extensionOf(extension);
	const expected = EXPECTED_BY_EXTENSION[normalized];
	if (expected && !expected.has(identity.format)) {
		throw nativeBuildError("ARTIFACT_IDENTITY_MISMATCH", `${normalized} does not contain ${identity.format} bytes.`, {
			stage: "artifact-validation",
			safeDetails: { extension: normalized, detectedFormat: identity.format }
		});
	}
}

function validateManifest(identity, manifest) {
	const expected = manifest?.format || manifest?.artifactFormat;
	if (expected && expected !== identity.format) {
		throw nativeBuildError("ARTIFACT_MANIFEST_MISMATCH", `Manifest expects ${expected}, but bytes are ${identity.format}.`, {
			stage: "artifact-validation",
			safeDetails: { expectedFormat: expected, detectedFormat: identity.format }
		});
	}
}

function extensionOf(value = "") {
	const text = String(value).toLowerCase();
	if (text.startsWith(".") && !text.includes("/")) {
		return text;
	}
	const match = text.match(/(\.[^./\\]+)$/);
	return match?.[1] || "";
}
