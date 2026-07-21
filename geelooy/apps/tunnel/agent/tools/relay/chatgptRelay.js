//B"H
//Boruch Hashem
//Blessed is He

const { relaySettings, CHATGPT } = require("./settings.js");
const { openLogin } = require("./chromeCookies.js");
const {
	chatgptCookieHeader,
	syncChromeToJar
} = require("./browserApi.js");
const { readRelayBody } = require("./streams.js");
const { startChatgptFetch } = require("./chatgptRelayFetch.js");

/**
 * The tunnel router names the human intention while focused vessels perform
 * browser authentication, binary streaming, cookies, and body cursor reads.
 * The Awtsmoos remains one throughout every delegated branch.
 */
async function handleChatgptRelay(payload = {}, config = {}) {
	const settings = relaySettings(config);
	const action = payload.action || payload.relayAction || "health";
	if (["relayHealth", "health"].includes(action)) {
		return health(settings, config);
	}
	if (["relayOpenLogin", "openLogin"].includes(action)) {
		return await openLogin(settings);
	}
	if (["relayCookies", "cookies"].includes(action)) {
		return await cookies(payload);
	}
	if (["relayFetch", "fetch"].includes(action)) {
		return await startChatgptFetch(payload);
	}
	if (["relayBody", "body"].includes(action)) {
		return {
			ok: true,
			result: await readRelayBody(payload)
		};
	}
	throw new Error(`unknown_relay_action:${action}`);
}

function health(settings, config) {
	return {
		ok: true,
		relay: true,
		kind: "chatgpt",
		port: settings.port,
		debugPort: settings.debugPort,
		debugPortCandidates: settings.debugPortCandidates,
		profile: settings.profile,
		tunnelName: config.tunnelName || ""
	};
}

async function cookies(payload = {}) {
	const cookieStatus = await chatgptCookieHeader({
		...payload,
		url: payload.url || CHATGPT,
		includeValues: payload.includeValues === true
	});
	if (payload.syncToJar === false) {
		return cookieStatus;
	}
	const syncedJar = await syncChromeToJar({
		...payload,
		url: payload.url || CHATGPT,
		jar: payload.jar || payload.cookieJarName || "chatgpt"
	}).catch(error => ({
		ok: false,
		error: error.message
	}));
	return {
		...cookieStatus,
		syncedJar
	};
}

module.exports = {
	handleChatgptRelay
};
