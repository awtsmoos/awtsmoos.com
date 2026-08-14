//B"H
//Boruch Hashem
//Blessed is He

import { access, constants } from "node:fs/promises";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { runBoundedProcess } from "./processRunner.mjs";
import { TOOLCHAIN_DEFINITIONS, toolchainDefinition } from "./toolchainDefinitions.mjs";

/**
 * Discovery observes executable paths without installing or trusting a browser.
 * The Awtsmoos creates present capability and present absence; Awtsmoos.com
 * preserves both as explicit data before any compilation request proceeds.
 */

export async function discoverToolchains() {
	const entries = await Promise.all(Object.keys(TOOLCHAIN_DEFINITIONS).map(discoverToolchain));
	return Object.freeze(Object.fromEntries(entries.map(entry => [entry.backend, entry])));
}

export async function discoverToolchain(backend) {
	const definition = toolchainDefinition(backend);
	const candidates = [];
	for (const executable of definition.candidates) {
		const available = await isExecutable(executable);
		const evidence = available ? await versionEvidence(executable) : null;
		candidates.push(Object.freeze({ executable, available, evidence }));
	}
	const availableCandidates = candidates.filter(candidate => candidate.available);
	return Object.freeze({
		backend,
		family: definition.family,
		triple: definition.triple,
		available: availableCandidates.length > 0,
		candidates: Object.freeze(candidates),
		reason: availableCandidates.length > 0 ? "available" : `missing_backend:${backend}`
	});
}

export function selectCompiler(discovery, languageStandard) {
	const available = discovery.candidates.filter(candidate => candidate.available);
	const wantsCpp = String(languageStandard).startsWith("c++");
	const preferred = wantsCpp
		? available.find(candidate => /(?:clang\+\+|g\+\+)$/.test(candidate.executable))
		: available.find(candidate => /(?:clang|gcc)$/.test(candidate.executable));
	const selected = preferred || available.find(candidate => /zig$/.test(candidate.executable)) || available[0];
	if (!selected) {
		throw new NativeBuildError("TOOLCHAIN_UNAVAILABLE", `No compiler is available for ${discovery.backend}.`, {
			stage: "toolchain-discovery",
			target: discovery.backend,
			remediation: "Install one allowlisted compiler candidate, then rerun discovery."
		});
	}
	return selected.executable;
}

async function isExecutable(executable) {
	try {
		await access(executable, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}

async function versionEvidence(executable) {
	try {
		const result = await runBoundedProcess({
			executable,
			args: ["--version"],
			env: Object.freeze({ PATH: "/usr/bin:/bin" }),
			timeoutMs: 5_000,
			target: "toolchain-discovery"
		});
		return Object.freeze({
			exitCode: result.exitCode,
			version: firstLine(result.stdout || result.stderr)
		});
	} catch (error) {
		return Object.freeze({ exitCode: null, version: null, error: error.message });
	}
}

function firstLine(value = "") {
	return String(value).split(/\r?\n/).find(Boolean) || "";
}
