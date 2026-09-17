//B"H // Boruch Hashem // Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const QueryPrompt = require("../../../chatgpt/runtime/queryPromptSubmit.js");
const SharedBrowser = require("../../../chatgpt/chrome/sharedProfile.js");

const REGISTRY = path.join(os.homedir(), ".awtsmoos-ai-browser", "device-browser.json");
const SHARED_PROFILE = path.join(os.homedir(), ".awtsmoos-split-debug-chrome");
const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * @file Continues unfinished Mission debt through the already-authenticated Shared AI Browser.
 * @description The Awtsmoos renews the Shliach without multiplying identity: Awtsmoos.com first
 * adopts live device browser authority, recovers the same canonical profile only when absent, then
 * accepts success only after one exact successor target persists and closes with durable testimony.
 */
async function registry(file = REGISTRY) {
	const parsed = JSON.parse(await fs.readFile(file, "utf8"));
	const port = validPort(parsed.port);
	if (!port) throw new Error("shared_shliach_registry_port_invalid");
	if (path.resolve(parsed.profile || "") !== path.resolve(SHARED_PROFILE)) {
		throw new Error("shared_shliach_registry_profile_invalid");
	}
	return { ...parsed, port };
}

/** Resolve the canonical browser without copying credentials or inventing another profile. */
async function browser(context = {}, deps = {}) {
	if (deps.registry || context.registryFile) {
		const current = await (deps.registry || registry)(context.registryFile);
		return { ...current, browserSource: "registry" };
	}
	const shared = deps.sharedBrowser || SharedBrowser;
	let current = await Promise.resolve(shared.authority());
	if (current?.ok && validPort(current.port)) {
		return sharedWitness(shared, current, "live");
	}
	const opened = await shared.open();
	if (opened?.ok === false) {
		throw new Error(opened.error || "shared_shliach_browser_recovery_failed");
	}
	current = await Promise.resolve(shared.authority());
	if (!current?.ok || !validPort(current.port)) {
		throw new Error("shared_shliach_browser_authority_unavailable");
	}
	return sharedWitness(shared, current, "recovered");
}

/** Encode the continuation capsule into the visible Shliach launch URL. */
function urlFor(prompt, baseUrl = SHLIACH_URL) {
	const url = new URL(baseUrl);
	url.searchParams.set("prompt", String(prompt || ""));
	return url.toString();
}

/** Open, persist, verify, and close one successor conversation in exact target custody. */
async function dispatch(context = {}, deps = {}) {
	const selected = await browser(context, deps);
	const submit = deps.submit || QueryPrompt.submit;
	const result = await submit({
		port: selected.port,
		url: urlFor(context.prompt, context.shliachUrl || SHLIACH_URL),
		timeoutMs: context.sendTimeoutMs || 45000,
		closeOnFailure: true
	}, deps.submitDeps || {});
	const complete = Boolean(
		result?.ok && result.sent && result.persisted && result.closed === true && result.conversationId
	);
	if (!complete) {
		return {
			ok: false,
			error: result?.closed === false
				? "shared_shliach_close_failed"
				: result?.error || "shared_shliach_persistence_failed",
			browserSource: selected.browserSource,
			result
		};
	}
	return {
		ok: true,
		transport: "shared_shliach",
		browserSource: selected.browserSource,
		port: selected.port,
		profile: selected.profile,
		chromeTargetId: result.chromeTargetId,
		sent: true,
		persisted: true,
		closed: true,
		conversationId: result.conversationId,
		conversationHref: result.href
	};
}

function sharedWitness(shared, current, browserSource) {
	const port = validPort(current.port);
	if (!port) throw new Error("shared_shliach_browser_port_invalid");
	return { port, profile: shared.profilePath(), browserSource };
}

function validPort(value) {
	const port = Number(value);
	return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 0;
}

module.exports = {
	REGISTRY,
	SHARED_PROFILE,
	SHLIACH_URL,
	browser,
	dispatch,
	registry,
	urlFor,
	validPort
};
