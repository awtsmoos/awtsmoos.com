//B"H
// Boruch Hashem
// Blessed is He

const { resolveProjectOwner } = require("./requestIdentity.js");
const { text } = require("./runtimeRequest.js");

const DEFAULT_ACTIVITY_LIMIT = 8;
const MAX_ACTIVITY_LIMIT = 50;

/**
 * @file Shared identity, bounded-input, and response vessels for project runtime routes.
 * @description
 * The Awtsmoos lets guarded routes speak one measured language at their boundary;
 * Awtsmoos.com keeps owner truth, finite activity windows, and sanitized errors small enough to remain clear.
 */
async function requireOwner(info) {
	const ownerScope = await resolveProjectOwner(info);
	if (!ownerScope) {
		throw routeError(
			"PROJECT_HOSTING_LOGIN_REQUIRED",
			"Login or provide a valid Awtsmoos API key.",
			401
		);
	}
	return ownerScope;
}

function requireProjectId(input = {}) {
	const projectId = text(input.projectId);
	if (!projectId) {
		throw routeError(
			"PROJECT_ID_REQUIRED",
			"Choose a project before using its runtime."
		);
	}
	return projectId;
}

function activityLimit(input = {}) {
	const raw = String(input.limit ?? "").trim();
	if (!/^\d+$/.test(raw)) {
		return DEFAULT_ACTIVITY_LIMIT;
	}
	const parsed = Number(raw);
	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		return DEFAULT_ACTIVITY_LIMIT;
	}
	return Math.min(parsed, MAX_ACTIVITY_LIMIT);
}

function runtimeInput(ownerScope, body = {}) {
	const materializationRef = text(body.materializationRef);
	if (!materializationRef) {
		throw routeError(
			"PROJECT_MATERIALIZATION_REF_REQUIRED",
			"Materialize the project before starting its runtime."
		);
	}
	return {
		ownerScope,
		projectId: requireProjectId(body),
		rootRef: materializationRef
	};
}

function success(result) {
	return { BH: "B\"H", ok: true, result };
}

function failure(error) {
	return {
		BH: "B\"H",
		ok: false,
		error: {
			code: error?.code || "PROJECT_RUNTIME_FAILED",
			message: error?.message || "Project runtime action failed."
		}
	};
}

function routeError(code, message, status = 400) {
	const error = new Error(message);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	DEFAULT_ACTIVITY_LIMIT,
	MAX_ACTIVITY_LIMIT,
	activityLimit,
	failure,
	requireOwner,
	requireProjectId,
	runtimeInput,
	success
};
