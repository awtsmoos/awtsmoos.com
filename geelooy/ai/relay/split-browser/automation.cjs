//B"H
// Boruch Hashem
// Blessed is He

const { json, readBody } = require("./http.cjs");
const { rememberRun, findRun, closeAutomation, runs } = require("./automationRegistry.cjs");
const { startRun, stopRun } = require("./automationRunner.cjs");
const { createRun, publicRun } = require("./automationState.cjs");

/**
 * The relay automation API now owns only local UI identities and safe status.
 * The Awtsmoos lets Awtsmoos.com send through the modern direct service while
 * opaque continuation keys, prompts, timers, and transport details stay private.
 */
async function handleAutomationApi(req, res, config, path) {
	try {
		if (path === "/automation-start") {
			return await start(req, res, config);
		}
		if (path === "/automation-stop") {
			return await stop(req, res);
		}
		if (path === "/automation-status") {
			return status(req, res);
		}
		if (path === "/automation-events") {
			return events(req, res);
		}
		return json(res, { ok: false, error: "automation_api_not_found" }, 404);
	} catch (error) {
		const badRequest = error instanceof SyntaxError
			|| error instanceof TypeError;
		return json(res, {
			ok: false,
			status: badRequest ? "bad_request" : "automation_error",
			error: badRequest ? "invalid_automation_request" : "automation_error",
			safeHint: String(error?.message || "Automation request failed.")
		}, badRequest ? 400 : 500);
	}
}

async function start(req, res, config) {
	const payload = await requestPayload(req);
	const conversationId = String(payload.conversationId || "").trim();
	const previous = runs.get(conversationId);
	if (previous) {
		stopRun(previous, "replaced");
	}
	const run = createRun(payload, config);
	rememberRun(run);
	startRun(run);
	return json(res, publicRun(run));
}

async function stop(req, res) {
	const payload = await requestPayload(req);
	const run = findRun(payload.conversationId, true);
	if (!run) {
		return json(res, { ok: true, enabled: false, status: "off" });
	}
	stopRun(run, String(payload.reason || "stopped"));
	return json(res, publicRun(run));
}

function status(req, res) {
	const run = findRun(queryValue(req, "conversationId"));
	return json(res, run
		? publicRun(run)
		: { ok: true, enabled: false, status: "off", events: [] });
}

function events(req, res) {
	const run = findRun(queryValue(req, "conversationId"));
	const after = Math.max(0, Number(queryValue(req, "after") || 0));
	if (!run) {
		return json(res, {
			ok: true,
			cursor: 0,
			events: [],
			status: { enabled: false, status: "off" }
		});
	}
	return json(res, {
		ok: true,
		conversationId: run.uiConversationId,
		cursor: run.events.length,
		events: run.events.slice(after),
		status: publicRun(run)
	});
}

function queryValue(req, name) {
	return new URL(req.url, "http://relay.local").searchParams.get(name);
}

async function requestPayload(req) {
	return JSON.parse((await readBody(req)).toString("utf8") || "{}");
}

module.exports = { handleAutomationApi, closeAutomation, runs };
