//B"H
//Boruch Hashem
//Blessed is He

import { discoverToolchain } from "../../scripts/awtsmoos/compiling/native/service/toolchainDiscovery.mjs";
import { writeEvidenceLog } from "./evidenceWriter.mjs";
import { VERIFICATION_LOGS } from "./verificationPaths.mjs";

/**
 * Missing backends receive durable testimony instead of counterfeit artifacts.
 * The Awtsmoos creates absence as a present fact; Awtsmoos.com records candidate
 * paths, target triples, error codes, and remediation without installing tools.
 */

export async function createUnavailableEvidence() {
	const windowsX64 = await unavailable("windows-x64", "Windows x86_64", VERIFICATION_LOGS.windowsX64);
	const windowsArm64 = await unavailable("windows-arm64", "Windows ARM64", VERIFICATION_LOGS.windowsArm64);
	const linuxX64 = await unavailable("linux-x64", "Linux x86_64", VERIFICATION_LOGS.linuxX64);
	const linuxArm64 = await unavailable("linux-arm64", "Linux ARM64", VERIFICATION_LOGS.linuxArm64);
	const wasmWasi = await discoverToolchain("wasm-wasi");
	const wasmBrowser = await discoverToolchain("wasm-browser");
	const wasm = Object.freeze({
		status: wasmWasi.available || wasmBrowser.available ? "candidate" : "unavailable",
		code: wasmWasi.available || wasmBrowser.available ? null : "TOOLCHAIN_UNAVAILABLE",
		wasi: wasmWasi,
		browser: wasmBrowser,
		artifactCreated: false,
		remediation: "Install an allowlisted WASI SDK, Zig, and optionally Wasmtime, then rerun discovery and byte validation."
	});
	await writeEvidenceLog(VERIFICATION_LOGS.wasm, "WebAssembly backend evidence", wasm);
	return Object.freeze({ windowsX64, windowsArm64, linuxX64, linuxArm64, wasm });
}

async function unavailable(backend, label, logPath) {
	const discovery = await discoverToolchain(backend);
	const evidence = Object.freeze({
		status: discovery.available ? "candidate" : "unavailable",
		code: discovery.available ? null : "TOOLCHAIN_UNAVAILABLE",
		label,
		discovery,
		artifactCreated: false,
		remediation: discovery.available
			? "Run a real hello-world build and validate bytes before marking this target complete."
			: "Install one allowlisted compiler and compatible SDK/sysroot, then rerun discovery and validation."
	});
	await writeEvidenceLog(logPath, `${label} backend evidence`, evidence);
	return evidence;
}
