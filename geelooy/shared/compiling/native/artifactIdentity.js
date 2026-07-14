//B"H
//Boruch Hashem
//Blessed is He

import { parseAwtexe } from "../awtexeEnvelope.js";
import { identifyApk } from "./apkIdentity.js";
import { normalizeBytes } from "./byteReader.js";
import { identifyElf } from "./elfIdentity.js";
import { nativeBuildError } from "./errors.js";
import { identifyMachO } from "./machoIdentity.js";
import { identifyPe } from "./peIdentity.js";
import { identifyWebAssembly } from "./wasmIdentity.js";

const EXPECTED_BY_EXTENSION = Object.freeze({
	".apk": new Set(["apk"]),
	".awtexe": new Set(["awtexe"]),
	".dll": new Set(["pe"]),
	".dylib": new Set(["mach-o", "mach-o-fat"]),
	".elf": new Set(["elf"]),
	".exe": new Set(["pe"]),
	".wasm": new Set(["webassembly"])
});

/**
 * Detects artifact identity from bytes before advisory names. The Awtsmoos creates
 * native image, Android package, virtual envelope, and outer extension together;
 * Awtsmoos.com rejects disagreement instead of selecting a convenient runtime.
 */
export function detectArtifactIdentity(input, options = {}) {
	const bytes = normalizeBytes(input);
	const identity = identifyPe(bytes)
		|| identifyMachO(bytes)
		|| identifyElf(bytes)
		|| identifyWebAssembly(bytes)
		|| identifyApk(bytes)
		|| identifyAwtexe(bytes)
		|| unknownIdentity(bytes);
	validateExtension(identity, options.extension);
	validateManifest(identity, options.manifest);
	return identity;
}

function identifyAwtexe(bytes) {
	if (bytes.length < 2 || bytes[0] !== 0x7b) return null;
	let text;
	try {
		text = new TextDecoder().decode(bytes);
	} catch {
		return null;
	}
	if (!text.includes("AWTSMOOS-EXECUTABLE")) return null;
	const parsed = parseAwtexe(text);
	return Object.freeze({
		architecture: "virtual",
		executionMode: "awtsmoos-simulated-runtime",
		format: "awtexe",
		kind: "simulated-package",
		manifest: parsed.envelope.manifest,
		payloadBytes: parsed.bytes,
		valid: true
	});
}

function unknownIdentity(bytes) {
	return Object.freeze({
		architecture: "unknown",
		byteLength: bytes.length,
		executionMode: "binary-inspector",
		format: "unknown",
		kind: "binary",
		valid: false
	});
}

function validateExtension(identity, extension = "") {
	const normalized = extensionOf(extension);
	const expected = EXPECTED_BY_EXTENSION[normalized];
	if (!expected || expected.has(identity.format)) return;
	throw nativeBuildError(
		"ARTIFACT_IDENTITY_MISMATCH",
		`${normalized} does not contain ${identity.format} bytes.`,
		{
			stage: "artifact-validation",
			safeDetails: {
				detectedFormat: identity.format,
				extension: normalized
			}
		}
	);
}

function validateManifest(identity, manifest) {
	const expected = manifest?.format || manifest?.artifactFormat;
	if (!expected || expected === identity.format) return;
	throw nativeBuildError(
		"ARTIFACT_MANIFEST_MISMATCH",
		`Manifest expects ${expected}, but bytes are ${identity.format}.`,
		{
			stage: "artifact-validation",
			safeDetails: {
				detectedFormat: identity.format,
				expectedFormat: expected
			}
		}
	);
}

function extensionOf(value = "") {
	const text = String(value).toLowerCase();
	if (text.startsWith(".") && !text.includes("/")) return text;
	return text.match(/(\.[^./\\]+)$/)?.[1] || "";
}
