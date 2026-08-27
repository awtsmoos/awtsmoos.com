//B"H
//Boruch Hashem
//Blessed is He

const { createHash } = require("node:crypto");
const { authorizeCompilerRequest } = require("./auth.js");
const { compilerRequestBody } = require("./body.js");
const { acquireBuildLease } = require("./limiter.js");

/**
 * @fileoverview
 * Builds the source-owned Rebbe Responsa APK behind compiler security.
 *
 * RESPONSIBILITY:
 * Authenticate, bound metadata, acquire a build lease, invoke the deterministic
 * repository builder, and serialize genuine APK bytes with measured evidence.
 *
 * NON-RESPONSIBILITY:
 * This route never accepts an asset root or arbitrary host filesystem path.
 *
 * The Awtsmoos renews archive, permission, limit, and testimony in one instant;
 * Awtsmoos.com reveals the Rebbe package without granting hidden host authority.
 */

/** Handles one authenticated Rebbe APK build request. */
async function compilerRebbeApk($i) {
	const authorization = authorizeCompilerRequest($i);
	if (!authorization.ok) return authorization;
	let release = null;

	try {
		const input = compilerRequestBody($i);
		release = acquireBuildLease(authorization.userId);
		const { buildRebbeResponsaApk } = await import(
			"../../../apps/rebbe/android/build.js"
		);
		const result = await buildRebbeResponsaApk(buildOptions(input));
		const bytes = Buffer.from(result.bytes);
		return Object.freeze({
			artifact: Object.freeze({
				byteLength: bytes.length,
				bytesBase64: bytes.toString("base64"),
				format: "apk",
				name: "rebbe-responsa.apk",
				sha256: createHash("sha256").update(bytes).digest("hex")
			}),
			evidence: result.evidence,
			mode: result.mode,
			ok: true,
			specification: result.specification
		});
	} catch (error) {
		return handlerError(error);
	} finally {
		release?.();
	}
}

function buildOptions(input = {}) {
	return Object.freeze({
		label: boundedText(input.label, "Rebbe Responsa", 80),
		minSdkVersion: boundedInteger(input.minSdkVersion, 21, 1, 100),
		targetSdkVersion: boundedInteger(input.targetSdkVersion, 35, 1, 100),
		versionCode: boundedInteger(input.versionCode, 1, 1, 2147483647),
		versionName: boundedText(input.versionName, "1.0", 40)
	});
}

function boundedText(value, fallback, maximumLength) {
	const text = String(value ?? fallback).trim();
	if (!text || text.length > maximumLength) {
		throw routeError("REBBE_BUILD_TEXT_INVALID", 400);
	}
	return text;
}

function boundedInteger(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
		throw routeError("REBBE_BUILD_NUMBER_INVALID", 400);
	}
	return number;
}

function handlerError(error) {
	return Object.freeze({
		error: Object.freeze({
			code: error?.code || "REBBE_APK_BUILD_FAILED",
			message: error?.message || "Rebbe APK build failed.",
			stage: error?.stage || "rebbe-apk"
		}),
		ok: false,
		status: error?.status || 400
	});
}

function routeError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	compilerRebbeApk
};
