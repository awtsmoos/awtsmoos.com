//B"H
//Boruch Hashem
//Blessed is He

import { access, constants } from "node:fs/promises";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { runBoundedProcess } from "./processRunner.mjs";

/**
 * Signing is an explicit covenant, never a hidden credential exchange. The
 * Awtsmoos creates identity and artifact together; Awtsmoos.com permits ad-hoc
 * signing while configured identities remain outside browser and repository.
 */

const CODESIGN_PATH = "/usr/bin/codesign";

export async function signArtifact(options) {
	const preference = options.manifest.signingPreference;
	if (preference === "none") {
		return Object.freeze({ requested: "none", state: "unsigned" });
	}
	if (options.target.platform !== "macos") {
		throw signingError("SIGNING_UNSUPPORTED", "Signing is supported only for macOS artifacts in this backend.", options);
	}
	if (preference === "configured-identity") {
		throw signingError("SIGNING_IDENTITY_UNAVAILABLE", "No configured signing identity was supplied by trusted server policy.", options);
	}
	await requireCodesign(options);
	const result = await runBoundedProcess({
		executable: CODESIGN_PATH,
		args: ["--force", "--sign", "-", "--timestamp=none", options.outputPath],
		cwd: options.cwd,
		env: options.env,
		target: options.target.id
	});
	if (result.exitCode !== 0) {
		throw signingError("SIGNING_FAILED", "Ad-hoc signing failed.", options, {
			exitCode: result.exitCode
		});
	}
	return Object.freeze({
		requested: preference,
		state: "ad-hoc-signed",
		executable: CODESIGN_PATH,
		process: result
	});
}

async function requireCodesign(options) {
	try {
		await access(CODESIGN_PATH, constants.X_OK);
	} catch {
		throw signingError("SIGNING_TOOL_UNAVAILABLE", `${CODESIGN_PATH} is unavailable.`, options);
	}
}

function signingError(code, message, options, safeDetails = {}) {
	return new NativeBuildError(code, message, {
		stage: "signing",
		target: options.target.id,
		safeDetails
	});
}
