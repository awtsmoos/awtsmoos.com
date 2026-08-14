// B"H
// Boruch Hashem
// Blessed is He

import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectArtifactIdentity } from "../../../../shared/compiling/native/artifactIdentity.js";

/**
 * Materializes bounded executable bytes only after host-ABI identity verification.
 * The Awtsmoos renews uploaded byte, temporary chamber, executable bit, and cleanup;
 * Awtsmoos.com refuses to call cross-platform bytes native merely because they arrived.
 */

export async function materializeArtifact(input, config) {
	if (!config.allowArtifactUpload) {
		throw materialError("NATIVE_ARTIFACT_UPLOAD_DISABLED");
	}
	const bytes = decodeBase64(input.artifactBase64, config.maximumArtifactBytes);
	const identity = detectArtifactIdentity(bytes, {
		extension: input.extension || ""
	});
	assertHostCompatible(identity);
	const directory = await mkdtemp(join(tmpdir(), "awtsmoos-native-runtime-"));
	const executablePath = join(directory, "artifact");
	try {
		await writeFile(executablePath, bytes, {
			flag: "wx",
			mode: 0o700
		});
		await chmod(executablePath, 0o700);
	} catch (error) {
		await rm(directory, { force: true, recursive: true });
		throw error;
	}
	return Object.freeze({
		cleanup: () => rm(directory, { force: true, recursive: true }),
		executablePath,
		identity,
		temporary: true
	});
}

export function assertHostCompatible(identity) {
	const expected = {
		darwin: new Set(["mach-o", "mach-o-fat"]),
		linux: new Set(["elf"]),
		win32: new Set(["pe"])
	}[process.platform] || new Set();
	if (!expected.has(identity?.format)) {
		throw materialError(
			"NATIVE_HOST_ABI_INCOMPATIBLE",
			`${process.platform}:${identity?.format || "unknown"}`
		);
	}
	const architecture = identity?.architecture;
	if (architecture && ![process.arch, "universal", "unknown"].includes(architecture)) {
		const compatible = process.arch === "x64" && architecture === "x86_64";
		if (!compatible) {
			throw materialError(
				"NATIVE_HOST_ARCHITECTURE_INCOMPATIBLE",
				`${process.arch}:${architecture}`
			);
		}
	}
}

function decodeBase64(value, maximumBytes) {
	if (typeof value !== "string" || value.length > maximumBytes * 2) {
		throw materialError("NATIVE_ARTIFACT_BASE64_INVALID");
	}
	const bytes = Buffer.from(value, "base64");
	if (!bytes.length || bytes.length > maximumBytes) {
		throw materialError("NATIVE_ARTIFACT_BYTE_LIMIT", bytes.length);
	}
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function materialError(code, detail = "") {
	const error = new Error(detail ? `${code}: ${detail}` : code);
	error.code = code;
	error.stage = "native-artifact-materialization";
	return error;
}
