// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interactionActions.js
 * @description Gives read-only Chrome work safe recovery while making uncertain human side effects explicit and non-replayable.
 * The Awtsmoos may renew a vessel to see again; Awtsmoos.com carries the known DevTools port through recovery and never clicks twice merely because an answer was lost.
 */

const { inspectChromeHealth } = require("./healthProbe.js");
const { pageSnapshot } = require("./snapshot.js");
const {
	cdp, chromeConfig, expressionOf, expressionSummary, param,
	readCompactLogs, remoteValue, targetOptions, timeoutOf, urlOf
} = require("./actionContext.js");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function chromeNavigate(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeNavigate");
	if (blocked) return blocked;
	const url = urlOf(payload, "").trim();
	if (!url) return { ok:false, action:"chromeNavigate", error:"missing_navigation_url" };
	const health = await inspectChromeHealth({ recover:true, probeMs:1500, port }).catch(() => null);
	const options = { ...targetOptions(payload), createNewIfUnbound:param(payload, "createNewIfUnbound", true) !== false };
	try {
		const navigation = await cdp.navigateAndWait(url, timeoutOf(payload), port, options);
		const waitMs = Number(param(payload, "waitMs", 0));
		if (waitMs > 0) await wait(Math.min(waitMs, 30000));
		return { ok:navigation.ok === true, action:"chromeNavigate", url, navigation, health, chromeTargetId:navigation.chromeTargetId || options.chromeTargetId, logs:readCompactLogs(payload) };
	} catch (error) {
		return ambiguous("chromeNavigate", payload, error, { url, health });
	}
}

async function chromeEval(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeEval");
	if (blocked) return blocked;
	await cdp.ensurePage(port, { ...targetOptions(payload), timeoutMs:timeoutOf(payload, 10000) });
	const health = await inspectChromeHealth({ recover:true, probeMs:1500, port });
	if (health.state !== "healthy") return { ok:false, action:"chromeEval", error:"chrome_overlocked", health };
	const expression = expressionOf(payload);
	try {
		const result = await cdp.cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload));
		const value = remoteValue(result);
		return { ok:true, action:"chromeEval", chromeTargetId:cdp.currentTargetId(), expression:expressionSummary(expression), value, valueType:result?.result?.type || typeof value, health, logs:readCompactLogs(payload) };
	} catch (error) {
		return { ok:false, action:"chromeEval", error:error.message, expression:expressionSummary(expression), health:await inspectChromeHealth({ recover:true, port }).catch(() => health), logs:readCompactLogs(payload) };
	}
}

async function chromeWaitForSelector(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeWaitForSelector");
	if (blocked) return blocked;
	await cdp.ensurePage(port, { ...targetOptions(payload), timeoutMs:timeoutOf(payload, 10000) });
	const selector = param(payload, "selector", "");
	if (!selector) return { ok:false, action:"chromeWaitForSelector", error:"missing_selector" };
	const timeout = timeoutOf(payload, 10000);
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeout) {
		const result = await cdp.cdpCall("Runtime.evaluate", { expression:`!!document.querySelector(${JSON.stringify(selector)})`, returnByValue:true }, Math.min(timeout, 5000));
		if (remoteValue(result)) return { ok:true, action:"chromeWaitForSelector", selector, found:true, durationMs:Date.now() - startedAt };
		await wait(250);
	}
	return { ok:false, action:"chromeWaitForSelector", selector, found:false, timeout, logs:readCompactLogs(payload) };
}

async function chromeClick(payload = {}) {
	return elementSideEffect("chromeClick", payload, `el.scrollIntoView({block:"center",inline:"center"});el.click();return {text:el.innerText||el.value||el.getAttribute("aria-label")||""};`);
}

async function chromeType(payload = {}) {
	const text = param(payload, "text", "");
	return elementSideEffect("chromeType", payload, `el.focus();el.value=${JSON.stringify(text)};el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));return {value:el.value};`, { textLength:text.length });
}

async function elementSideEffect(action, payload, body, extra = {}) {
	const { blocked, port } = chromeConfig(payload, action);
	if (blocked) return blocked;
	const selector = param(payload, "selector", "");
	if (!selector) return { ok:false, action, error:"missing_selector" };
	await cdp.ensurePage(port, { ...targetOptions(payload), timeoutMs:timeoutOf(payload, 10000) });
	const health = await inspectChromeHealth({ recover:true, probeMs:1500, port });
	if (health.state !== "healthy") return { ok:false, action, error:"chrome_overlocked", health };
	const expression = `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return {ok:false,error:"not_found"};${body}})()`;
	try {
		const result = await cdp.cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload), { noReconnect:true });
		return { ok:true, action, selector, value:remoteValue(result), health, ...extra, logs:readCompactLogs(payload) };
	} catch (error) {
		return ambiguous(action, payload, error, { selector, health, ...extra });
	}
}

async function chromeSnapshot(payload = {}) {
	const { blocked, port } = chromeConfig(payload, "chromeSnapshot");
	if (blocked) return blocked;
	await cdp.ensurePage(port, { ...targetOptions(payload), timeoutMs:timeoutOf(payload, 10000) });
	return { ok:true, action:"chromeSnapshot", ...(await pageSnapshot({ ...payload, maxText:Math.min(Number(payload.maxText || 3000), 8000), maxLogs:40 })) };
}

function ambiguous(action, payload, error, extra = {}) {
	return { ok:false, action, error:"ambiguous_side_effect", ambiguous:true, retryable:false, detail:error.message, ...extra, logs:readCompactLogs(payload) };
}

module.exports = { chromeNavigate, chromeEval, chromeWaitForSelector, chromeClick, chromeType, chromeSnapshot };
