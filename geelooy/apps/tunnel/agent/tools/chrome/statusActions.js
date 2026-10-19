// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file statusActions.js
 * @description Reports Chrome targets and bounded DevTools health without mutating target ownership.
 * The Awtsmoos lets sight remain sight: status observes the browser before any hand reaches to bind it;
 * Awtsmoos.com carries the known DevTools port into bounded recovery without hiding an unbounded ensure inside status.
 */

const { inspectChromeHealth } = require("./healthProbe.js");
const {
	cdp,
	chromeConfig,
	chromeFindDetails,
	findChrome,
	param,
	readCompactLogs,
	targetView
} = require("./actionContext.js");

/** Reports transport, target, lease, log, and bounded overlock evidence without acquiring a target. */
async function chromeStatus(payload = {}) {
	const { config, port } = chromeConfig(payload, "chromeStatus");
	try {
		const [info, pages] = await Promise.all([
			cdp.version(port),
			cdp.pages(port)
		]);
		const health = await inspectChromeHealth({
			recover:param(payload, "recover", true) !== false,
			probeMs:param(payload, "probeMs", 1800),
			port
		});
		return {
			ok:health.state === "healthy" || health.state === "unavailable",
			action:"chromeStatus",
			connected:true,
			port,
			chromePath:config.chrome.path || findChrome(),
			headless:!!config.chrome.headless,
			health,
			info:{
				Browser:info.Browser,
				ProtocolVersion:info.ProtocolVersion,
				webSocketDebuggerUrl:Boolean(info.webSocketDebuggerUrl)
			},
			pageCount:pages.length,
			pages:pages.map(targetView).slice(0, Number(param(payload, "maxPages", 10))),
			targetLeases:cdp.targetLeaseSnapshot(),
			logs:readCompactLogs(payload)
		};
	} catch (error) {
		return {
			ok:false,
			action:"chromeStatus",
			connected:false,
			port,
			chromePath:config.chrome.path || findChrome(),
			health:{ state:"unavailable", error:error.message },
			...chromeFindDetails(),
			error:error.message,
			logs:readCompactLogs(payload)
		};
	}
}

/** Lists browser targets and their plain lease metadata without changing leases. */
async function chromeTargets(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeTargets");
	if (blocked) return blocked;
	const pages = await cdp.pages(port);
	return {
		ok:true,
		action:"chromeTargets",
		port,
		count:pages.length,
		targets:pages.map(targetView),
		targetLeases:cdp.targetLeaseSnapshot()
	};
}

module.exports = {
	chromeStatus,
	chromeTargets,
	chromeTargetSelector:chromeTargets
};
