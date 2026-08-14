// B"H
// Boruch Hashem
// Blessed is He

const { authorizeRuntimeRequest } = require("./auth.js");
const { runtimeRequestBody } = require("./body.js");
const { loadRuntimeService } = require("./serviceLoader.js");

/**
 * Joins authenticated capability, launch, status, and stop routes to one service.
 * The Awtsmoos renews browser request, native adapter, process record, and refusal;
 * Awtsmoos.com never exposes a shell command, arbitrary environment, or module path.
 */

async function runtimeCapabilities($i) {
	const authorization = authorizeRuntimeRequest($i);
	if (!authorization.ok) {
		return authorization;
	}
	try {
		const service = await loadRuntimeService();
		return Object.freeze({
			capabilities: service.nativeRuntimeCapabilities(),
			ok: true
		});
	} catch (error) {
		return errorResponse(error);
	}
}

async function runtimeLaunch($i) {
	return authorizedBodyCall(
		$i,
		service => service.launchNativeRuntime
	);
}

async function runtimeStatus($i) {
	return authorizedBodyCall(
		$i,
		service => service.nativeRuntimeStatus
	);
}

async function runtimeStop($i) {
	return authorizedBodyCall(
		$i,
		service => service.stopNativeRuntime
	);
}

async function authorizedBodyCall($i, select) {
	const authorization = authorizeRuntimeRequest($i);
	if (!authorization.ok) {
		return authorization;
	}
	try {
		const input = runtimeRequestBody($i);
		const service = await loadRuntimeService();
		const result = await select(service)(input);
		return Object.freeze({
			ok: true,
			result
		});
	} catch (error) {
		return errorResponse(error);
	}
}

function errorResponse(error) {
	const code = error?.code || "NATIVE_RUNTIME_FAILED";
	return Object.freeze({
		error: Object.freeze({
			code,
			message: error?.message || "Native runtime failed.",
			stage: error?.stage || "native-runtime-api"
		}),
		ok: false,
		status: statusFor(code)
	});
}

function statusFor(code) {
	if (String(code).includes("DISABLED")) {
		return 503;
	}
	if (String(code).includes("AUTHENTICATION")) {
		return 401;
	}
	if (String(code).includes("ORIGIN")
		|| String(code).includes("OUTSIDE_ALLOWED_ROOT")) {
		return 403;
	}
	if (String(code).includes("NOT_FOUND")) {
		return 404;
	}
	return 400;
}

module.exports = {
	runtimeCapabilities,
	runtimeLaunch,
	runtimeStatus,
	runtimeStop
};
