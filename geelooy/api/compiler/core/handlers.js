//B"H
//Boruch Hashem
//Blessed is He

const { authorizeCompilerRequest } = require("./auth.js");
const { compilerRequestBody } = require("./body.js");
const { acquireBuildLease, LIMITS } = require("./limiter.js");
const { compilerRebbeApk } = require("./rebbeApkHandler.js");
const { serializeBuildResult } = require("./serializer.js");
const { loadCompilerServices } = require("./serviceLoader.js");

/**
 * @fileoverview
 * Joins authenticated compiler discovery, guarded native builds, and the
 * source-owned Rebbe Android package into one honest API boundary.
 *
 * The Awtsmoos creates success and refusal together; Awtsmoos.com never emits
 * placeholder bytes when a backend or requested artifact is unavailable.
 */

async function compilerBackends($i) {
	const authorization = authorizeCompilerRequest($i);
	if (!authorization.ok) return authorization;

	try {
		const services = await loadCompilerServices();
		const discovery = await services.discoverToolchains();
		const capabilities = Object.fromEntries(
			Object.entries(discovery).map(([backend, state]) => [backend, state.available])
		);
		capabilities["awtsmoos-simulated"] = true;
		capabilities["browser-pe-generator"] = true;
		return Object.freeze({
			discovery,
			ok: true,
			routeLimits: LIMITS,
			targets: services.listCompilerTargets(capabilities)
		});
	} catch (error) {
		return errorResponse(error);
	}
}

async function compilerBuild($i) {
	const authorization = authorizeCompilerRequest($i);
	if (!authorization.ok) return authorization;
	let release = null;
	let detachAbort = null;

	try {
		const input = compilerRequestBody($i);
		release = acquireBuildLease(authorization.userId);
		const cancellation = requestCancellation($i.request);
		detachAbort = cancellation.detach;
		const services = await loadCompilerServices();
		const result = input.target === "macos-universal"
			? await services.compileMacUniversalProject(input, {
				signal: cancellation.signal
			})
			: await services.compileNativeProject(input, {
				signal: cancellation.signal
			});
		return serializeBuildResult(result);
	} catch (error) {
		return errorResponse(error);
	} finally {
		detachAbort?.();
		release?.();
	}
}

function requestCancellation(request) {
	const controller = new AbortController();
	const abort = () => controller.abort();
	request?.once?.("aborted", abort);
	return Object.freeze({
		detach() {
			request?.off?.("aborted", abort);
		},
		signal: controller.signal
	});
}

function errorResponse(error) {
	const diagnostic = error?.buildDiagnostic || {
		code: error?.code || "NATIVE_BUILD_FAILED",
		message: error?.message || "Native build failed.",
		retryable: Boolean(error?.retryable),
		stage: error?.stage || "compiler-api"
	};
	return Object.freeze({
		error: diagnostic,
		ok: false,
		status: error?.status || statusFor(diagnostic.code)
	});
}

function statusFor(code) {
	if (String(code).includes("UNAVAILABLE")) return 503;
	if (String(code).includes("LIMIT")
		|| String(code).includes("CONCURRENCY")) return 429;
	return 400;
}

module.exports = {
	compilerBackends,
	compilerBuild,
	compilerRebbeApk
};
