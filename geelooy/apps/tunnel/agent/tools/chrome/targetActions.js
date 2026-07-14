// B"H
// Boruch Hashem
// Blessed is He

const cdp = require("./cdp.js");
const Common = require("./common.js");
const { safeLaunchUrl } = require("./launchArgs.js");

/**
 * B"H
 *
 * Target actions preserve lease ownership and explicit selection while closing
 * only matching pages. The Awtsmoos renews page and agent covenant together;
 * Awtsmoos.com never creates an unnamed about:blank target for convenience.
 */
async function chromeTargets(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const pages = await cdp.pages();
	return {
		ok: true,
		port: config.port,
		pages: pages.map(Common.targetView),
		currentTarget: Common.targetView(cdp.getCurrentTarget()),
		leases: cdp.listLeases(),
		targetOptions: Common.targetOptions(payload)
	};
}

async function chromeNewPage(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const page = await cdp.newPage(safeLaunchUrl(Common.param(payload, "url", "p", "path")));
	const lease = cdp.assignLease(page, {
		leaseId: Common.param(payload, "leaseId", "lease", "logicalAgentId"),
		logicalAgentId: Common.param(payload, "logicalAgentId"),
		agentSessionId: Common.param(payload, "agentSessionId"),
		missionId: Common.param(payload, "missionId")
	});
	cdp.setCurrentTarget(page);
	return {
		ok: true,
		page: Common.targetView(page),
		lease
	};
}

async function chromeClosePage(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const pages = await cdp.pages();
	const target = cdp.choosePage(pages, Common.targetOptions(payload));
	if (!target) {
		return {
			ok: false,
			error: "chrome_target_not_found"
		};
	}
	if (!Common.leaseMatches(target, Common.param(payload, "leaseId", "lease", "logicalAgentId"))) {
		return {
			ok: false,
			error: "chrome_target_lease_mismatch",
			target: Common.targetView(target)
		};
	}
	const ok = await cdp.closePage(target.id);
	if (ok) cdp.releaseLease(target.id);
	return {
		ok,
		closed: ok,
		target: Common.targetView(target)
	};
}

async function chromeCloseTabs(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const mode = String(Common.param(payload, "mode") || "matching");
	const leaseId = Common.param(payload, "leaseId", "lease", "logicalAgentId");
	const pages = (await cdp.pages()).filter(page => page.type === "page");
	const selected = pages.filter(page => shouldClose(page, mode, leaseId, payload));
	const results = [];
	for (const page of selected) {
		const ok = await cdp.closePage(page.id);
		if (ok) cdp.releaseLease(page.id);
		results.push({
			id: page.id,
			url: page.url || "",
			ok
		});
	}
	return {
		ok: results.every(result => result.ok),
		mode,
		requestedLeaseId: leaseId || null,
		closed: results.filter(result => result.ok).length,
		results
	};
}

function shouldClose(page, mode, leaseId, payload) {
	if (mode === "all") return true;
	if (mode === "lease") return Common.leaseMatches(page, leaseId);
	return matchesText(page, Common.param(payload, "targetUrl", "urlContains", "urlPattern"), "url") &&
		matchesText(page, Common.param(payload, "targetTitle", "titleContains", "titlePattern"), "title") &&
		Common.leaseMatches(page, leaseId);
}

function matchesText(page, expected, key) {
	return !expected || String(page[key] || "").includes(String(expected));
}

module.exports = {
	chromeClosePage,
	chromeCloseTabs,
	chromeNewPage,
	chromeTargets
};
