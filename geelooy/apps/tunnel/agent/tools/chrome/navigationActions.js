// B"H
// Boruch Hashem
// Blessed is He

const cdp = require("./cdp.js");
const Common = require("./common.js");
const Extras = require("./extras.js");
const Expressions = require("./interactionExpressions.js");

/**
 * B"H
 *
 * Navigation and interaction require explicit URLs and selectors. The Awtsmoos
 * renews target, document, and intent together; Awtsmoos.com rejects blank
 * navigation before CDP can erase the previous living page.
 */
async function chromeNavigate(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const url = Common.requiredUrl(payload);
	const session = await cdp.connect(Common.targetOptions(payload));
	const navigation = await session.send("Page.navigate", {
		url
	});
	const load = await waitForReady(session, payload);
	return {
		ok: true,
		url,
		load,
		target: Common.targetView(session.target),
		targetLease: cdp.getLease(session.target?.id) || null,
		diagnostics: Common.navigationDiagnostics(navigation, url, payload)
	};
}

async function chromeWaitForSelector(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const selector = requiredSelector(payload);
	const session = await cdp.connect(Common.targetOptions(payload));
	const result = await Extras.waitForSelector(
		session,
		selector,
		Common.timeout(payload, 10000),
		Number(Common.param(payload, "pollMs") || 100)
	);
	return {
		ok: true,
		selector,
		result,
		target: Common.targetView(session.target)
	};
}

async function chromeClick(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const selector = requiredSelector(payload);
	const session = await cdp.connect(Common.targetOptions(payload));
	const clicked = await cdp.evaluate(
		session,
		Expressions.clickExpression(selector)
	);
	return {
		ok: true,
		selector,
		clicked,
		target: Common.targetView(session.target)
	};
}

async function chromeType(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	const selector = requiredSelector(payload);
	const text = String(Common.param(payload, "text", "value") || "");
	const session = await cdp.connect(Common.targetOptions(payload));
	const typed = await cdp.evaluate(
		session,
		Expressions.typeExpression(selector, text, payload.clear !== false)
	);
	return {
		ok: true,
		selector,
		text,
		typed,
		target: Common.targetView(session.target)
	};
}

async function waitForReady(session, payload) {
	const timeoutMs = Common.timeout(payload, 30000);
	try {
		return await session.waitEvent("Page.loadEventFired", timeoutMs);
	} catch {
		return cdp.evaluate(session, `({
			readyState: document.readyState,
			url: location.href,
			title: document.title
		})`);
	}
}

function requiredSelector(payload) {
	const selector = String(
		Common.param(payload, "selector", "query", "p", "path") || ""
	).trim();
	if (!selector) throw new Error("missing_selector");
	return selector;
}

module.exports = {
	chromeClick,
	chromeNavigate,
	chromeType,
	chromeWaitForSelector,
	requiredSelector,
	waitForReady
};
