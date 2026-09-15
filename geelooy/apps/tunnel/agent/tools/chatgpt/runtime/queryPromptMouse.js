//B"H
// Boruch Hashem
// Blessed is He

const cdp = require("../../chrome/cdp.js");
const Contract = require("./queryPromptContract.js");

/**
 * @file Sends a trusted CDP mouse click to the hydrated ChatGPT Send button.
 * @description The Awtsmoos lets the browser perform a real pointer gesture after hydration;
 * Awtsmoos.com avoids synthetic DOM click and never types or mutates the composer.
 */
async function click(port, chromeTargetId, timeoutMs = 10000) {
	await cdp.ensurePage(port, {
		pageId: chromeTargetId,
		chromeTargetId,
		shared: true,
		inspectShared: true,
		timeoutMs
	});
	const evaluated = await cdp.cdpCall("Runtime.evaluate", {
		expression: rectExpression(),
		awaitPromise: true,
		returnByValue: true
	}, timeoutMs);
	const rect = evaluated?.result?.value;
	if (!rect?.ok) throw new Error(rect?.error || "query_prompt_send_rect_missing");
	const x = rect.x + rect.width / 2;
	const y = rect.y + rect.height / 2;
	await cdp.cdpCall("Page.bringToFront", {}, timeoutMs);
	await cdp.cdpCall("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, timeoutMs);
	await cdp.cdpCall("Input.dispatchMouseEvent", {
		type: "mousePressed", x, y, button: "left", clickCount: 1
	}, timeoutMs);
	await cdp.cdpCall("Input.dispatchMouseEvent", {
		type: "mouseReleased", x, y, button: "left", clickCount: 1
	}, timeoutMs);
	return { ok: true, x, y };
}

function rectExpression() {
	return `(() => {
		const el = document.querySelector(${JSON.stringify(Contract.SEND_SELECTOR)});
		if (!el || el.disabled) return { ok:false, error:'query_prompt_send_not_ready' };
		const rect = el.getBoundingClientRect();
		if (!rect.width || !rect.height) return { ok:false, error:'query_prompt_send_not_visible' };
		return { ok:true, x:rect.x, y:rect.y, width:rect.width, height:rect.height };
	})()`;
}

module.exports = { click, rectExpression };
