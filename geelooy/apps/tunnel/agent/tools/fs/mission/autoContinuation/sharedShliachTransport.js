//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { chromeNavigate } = require("../../../chrome/actions.js");
const { sendPrompt } = require("../../../chatgpt/runtime/sendPrompt.js");

const REGISTRY = path.join(os.homedir(), ".awtsmoos-ai-browser", "device-browser.json");
const SHARED_PROFILE = path.join(os.homedir(), ".awtsmoos-split-debug-chrome");
const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * @file Opens one successor chat inside the already-running shared Shliach Chrome profile.
 * @description The Awtsmoos reuses one authenticated browser vessel; Awtsmoos.com never
 * launches a second profile here, and existing navigation/send mechanics remain authoritative.
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
	const navigate = deps.navigate || chromeNavigate;
	const send = deps.send || sendPrompt;
	const registered = await readRegistry(context.registryFile);
	const url = urlFor(context.prompt, context.shliachUrl || SHLIACH_URL);
	const navigation = await navigate({
		port: registered.port,
		url,
		newTab: true,
		autoLaunch: false,
		shared: true
	});
	if (navigation?.ok === false) {
		return { ok: false, error: navigation.error || "shared_shliach_navigation_failed", navigation };
	}
	const sent = await send({
		port: registered.port,
		prompt: context.prompt,
		message: context.prompt,
		timeoutMs: context.sendTimeoutMs
	});
	if (!sent?.ok) {
		return { ok: false, error: sent?.error || "shared_shliach_send_failed", navigation, sent };
	}
	return {
		ok: true,
		recovered: false,
		transport: "shared_shliach",
		port: registered.port,
		profile: registered.profile,
		url,
		navigation,
		sent
	};
}

module.exports = { REGISTRY, SHARED_PROFILE, SHLIACH_URL, dispatch, registry, urlFor };
