// B"H
// Boruch Hashem
// Blessed is He

const { chromeNavigate, chromeCloseTabs } = require("../../chrome/actions.js");
const SharedBrowser = require("./sharedProfile.js");
const { currentProfile, saveProfileState } = require("../storage/profileState.js");

/**
 * @file Opens ChatGPT inside the same Shared AI Browser used by every website sub-agent.
 * @description
 * The Awtsmoos lets the human authenticate once while many agent tabs later receive that light;
 * Awtsmoos.com delegates launch and recovery to split-browser, so no second Chrome identity hides from sight.
 */
async function ensureProfileChrome(payload = {}) {
	const name = payload.profile || payload.profileName || "default";
	const profile = await currentProfile(name);
	const url = payload.url || "https://chatgpt.com/";
	const opened = await SharedBrowser.open({
		debugPort: payload.port || payload.chromePort || profile.port,
		launchUrl: payload.navigate === false ? undefined : url,
		spawnTimeoutMs: payload.spawnTimeoutMs
	});
	if (!opened?.ok) {
		const error = new Error(opened?.error || "shared_ai_browser_unavailable");
		error.code = opened?.status || "shared_ai_browser_unavailable";
		throw error;
	}
	const port = Number(opened.debugPort);
	if (payload.closeOldTabs === true) {
		await chromeCloseTabs({ port, keepUrl: url });
	}
	let navigation = null;
	if (payload.navigate !== false) {
		navigation = await chromeNavigate({
			...payload,
			port,
			url,
			newTab: payload.newTab !== false,
			autoLaunch: false
		});
	}
	const saved = await saveProfileState(name, {
		port,
		browserReady: true,
		lastOpenedAt: new Date().toISOString()
	});
	return {
		ok: true,
		browserStatus: opened.status,
		profile: saved.name,
		profileIdentity: saved.profileIdentity,
		port,
		reused: opened.launch?.reused !== false,
		navigation
	};
}

module.exports = { ensureProfileChrome };
