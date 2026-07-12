// B"H

const Aliases = require("./actionAliases.js");
const { normalizeText } = require("./normalizers.js");
const Identity = require("./responseIdentity.js");
const Paths = require("./pathValidation.js");

function requiredMismatch(expectedValue, actualValue) {
	return Boolean(expectedValue) && String(actualValue || "") !== String(expectedValue);
}

function optionalMismatch(expectedValue, actualValue) {
	return Boolean(expectedValue) && Boolean(actualValue) && String(actualValue) !== String(expectedValue);
}

function textMismatch(expectedValue, actualValue) {
	return Boolean(expectedValue) && normalizeText(actualValue) !== normalizeText(expectedValue);
}

function mismatchFlags(expected, data = {}) {
	const actualAction = Identity.actualActionOf(data);
	const routeReason = String(data.routeReason || "");
	return {
		wrongTunnel: optionalMismatch(expected.tunnelName, data.tunnelName || data.actualTunnelName),
		actionMismatch: Boolean(expected.requestedAction) && !Aliases.allowed(expected.requestedAction, actualAction),
		controlRequestMismatch: requiredMismatch(expected.controlRequestId, data.controlRequestId),
		clientRequestMismatch: requiredMismatch(expected.clientRequestId, data.clientRequestId),
		agentSessionMismatch: requiredMismatch(expected.agentSessionId, data.agentSessionId),
		logicalAgentMismatch: requiredMismatch(expected.logicalAgentId, data.logicalAgentId),
		projectRootMismatch: requiredMismatch(expected.projectRoot, data.projectRoot || data.root),
		nonceMismatch: requiredMismatch(expected.nonce, data.nonce),
		vesselMismatch: optionalMismatch(expected.expectedVessel, data.vessel || data.targetVessel),
		routeReasonMismatch: Boolean(expected.expectedRouteReason) && Boolean(routeReason) && !routeReason.includes(expected.expectedRouteReason),
		jobIdMismatch: requiredMismatch(expected.jobId, Identity.actualJobId(data)),
		streamMismatch: /^command(Job)?OutputPage$/.test(expected.requestedAction) && requiredMismatch(expected.stream, Identity.actualStream(data)),
		cwdMismatch: /^(command|commandRun|commandStart|shellCommand)$/.test(expected.requestedAction) && textMismatch(expected.cwd, data.cwd),
		commandMismatch: /^(command|commandRun|commandStart|shellCommand)$/.test(expected.requestedAction) && textMismatch(expected.command, data.command),
		pathMismatch: Paths.hasPathMismatch(expected, data)
	};
}

module.exports = {
	mismatchFlags,
	optionalMismatch,
	requiredMismatch,
	textMismatch
};
