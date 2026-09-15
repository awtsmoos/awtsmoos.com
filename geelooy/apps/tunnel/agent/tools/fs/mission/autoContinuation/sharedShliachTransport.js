//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const QueryPrompt = require("../../../chatgpt/runtime/queryPromptSubmit.js");

const REGISTRY = path.join(os.homedir(), ".awtsmoos-ai-browser", "device-browser.json");
const SHARED_PROFILE = path.join(os.homedir(), ".awtsmoos-split-debug-chrome");
const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * @file Creates one persistent successor conversation in the registered shared Shliach profile.
 * @description The URL carries the prompt. Success means a real /c/ conversation contains that
 * user message and the exact leased tab is closed; no textarea content is read, typed, or rewritten.
 */
async function registry(file = REGISTRY) {
	const parsed = JSON.parse(await fs.readFile(file, "utf8"));
	const port = Number(parsed.port);
	if (!Number.isFinite(port) || port <= 0) throw new Error("shared_shliach_port_invalid");
	if (path.resolve(String(parsed.profile || "")) !== path.resolve(SHARED_PROFILE)) {
		throw new Error("shared_shliach_profile_mismatch");
	}
	return { ...parsed, port };
}

function urlFor(prompt, baseUrl = SHLIACH_URL) {
	const url = new URL(baseUrl);
	url.searchParams.set("prompt", String(prompt || ""));
	return url.toString();
}

async function dispatch(context = {}, deps = {}) {
	const readRegistry = deps.registry || registry;
	const submit = deps.submit || QueryPrompt.submit;
	const registered = await readRegistry(context.registryFile);
	const url = urlFor(context.prompt, context.shliachUrl || SHLIACH_URL);
	const result = await submit({
		port: registered.port,
		url,
		timeoutMs: context.sendTimeoutMs || 45000,
		closeOnFailure: true
	}, deps.submitDeps || {});
	if (!result?.ok || !result.sent || !result.persisted || !result.conversationId) {
		return {
			ok: false,
			error: result?.error || "shared_shliach_persistence_failed",
			result
		};
	}
	return {
		ok: true,
		recovered: false,
		transport: "shared_shliach",
		port: registered.port,
		profile: registered.profile,
		url,
		chromeTargetId: result.chromeTargetId,
		sent: true,
		persisted: true,
		closed: result.closed === true,
		conversationId: result.conversationId,
		conversationHref: result.href
	};
}

module.exports = { REGISTRY, SHARED_PROFILE, SHLIACH_URL, dispatch, registry, urlFor };
