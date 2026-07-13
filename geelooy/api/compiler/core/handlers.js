//B"H
//Boruch Hashem
//Blessed is He

const { authorizeCompilerRequest } = require("./auth.js");
const { compilerRequestBody } = require("./body.js");
const { acquireBuildLease, LIMITS } = require("./limiter.js");
const { serializeBuildResult } = require("./serializer.js");
const { loadCompilerServices } = require("./serviceLoader.js");

/**
 * Route handlers join authentication, discovery, guarded execution, and honest
 * error testimony. The Awtsmoos creates success and refusal together;
 * Awtsmoos.com never emits placeholder bytes when a backend is unavailable.
 */

async function compilerBackends($i) {
	const authorization = authorizeCompilerRequest($i);
	if (!authorization.ok) {
		return authorization;
	}
	try {
		const services = await loadCompilerServices();
		const discovery = await services.discoverToolchains();
		const capabilities = Object.fromEntries(
			Object.entries(discovery).map(([backend, state]) => [backend, state.available])
		);
		capabilities["awtsmoos-simulated"] = true;
		capabilities["browser-pe-generator"] = true;
		return Object.freeze({
			ok: true,
			targets: services.listCompilerTargets(capabilities),
			discovery,
			routeLimits: LIMITS
		});
	} catch (error) {
		return errorResponse(error);
	}
}

async function compilerBuild($i) {
	const authorization = authorizeCompilerRequest($i);
	if (!authorization.ok) {
		return authorization;
	}
	let release = null;
	let detachAbort = null;
	try {
		const input = compilerRequestBody($i);
		release = acquireBuildLease(authorization.userId);
		const cancellation = requestCancellation($i.request);
		detachAbort = cancellation.detach;
		const services = await loadCompilerServices();
		const result = input.target === "macos-universal"
			? await services.compileMacUniversalProject(input, { signal: cancellation.signal })
			: await services.compileNativeProject(input, { signal: cancellation.signal });
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
		signal: controller.signal,
		detach() {
			request?.off?.("aborted", abort);
		}
	});
}

function errorResponse(error) {
	const diagnostic = error?.buildDiagnostic || {
		code: error?.code || "NATIVE_BUILD_FAILED",
		message: error?.message || "Native build failed.",
		stage: error?.stage || "compiler-api",
		retryable: Boolean(error?.retryable)
	};
	return Object.freeze({
		ok: false,
		status: error?.status || statusFor(diagnostic.code),
		error: diagnostic
	});
}

function statusFor(code) {
	if (String(code).includes("UNAVAILABLE")) {
		return 503;
	}
	if (String(code).includes("LIMIT") || String(code).includes("CONCURRENCY")) {
		return 429;
	}
	return 400;
}

module.exports = {
	compilerBackends,
	compilerBuild
};
