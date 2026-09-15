//B"H
// Boruch Hashem
// Blessed is He

const Chrome = require("../../chrome/actions.js");
const { PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");

const SEND_SELECTOR = SEND_SELECTORS.join(",");
const PROMPT_SELECTOR = PROMPT_SELECTORS.join(",");

/**
 * @file Submits a prompt that ChatGPT itself loaded from the ?prompt query string.
 * @description The Awtsmoos lets the URL carry the words; Awtsmoos.com never rewrites the
 * composer here. It waits, clicks Send once, witnesses departure, then closes only that tab.
 */
function targetPayload(port, chromeTargetId, extra = {}) {
	return {
		port,
		chromeTargetId,
		pageId: chromeTargetId,
		shared: true,
		inspectShared: true,
		...extra
	};
}

function stateExpression() {
	return `(() => {
		const visible = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
		const send = Array.from(document.querySelectorAll(${JSON.stringify(SEND_SELECTOR)})).find(visible) || null;
		const prompt = Array.from(document.querySelectorAll(${JSON.stringify(PROMPT_SELECTOR)})).find(visible) || null;
		const text = prompt ? String(prompt.innerText || prompt.value || prompt.textContent || '').trim() : '';
		const users = document.querySelectorAll('[data-message-author-role="user"]').length;
		return { href: location.href, textLength: text.length, users, sendFound: !!send, sendDisabled: !!send?.disabled };
	})()`;
}

function valueOf(result) {
	return result?.result?.result?.valueSummary?.value || {};
}

async function waitReady(port, chromeTargetId, timeoutMs, deps) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const probe = await deps.eval(targetPayload(port, chromeTargetId, { expression: stateExpression() }));
		const state = valueOf(probe);
		if (state.textLength > 0 && state.sendFound && !state.sendDisabled) return state;
		await sleep(200);
	}
	throw new Error("query_prompt_not_ready");
}

async function waitSent(port, chromeTargetId, before, timeoutMs, deps) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const probe = await deps.eval(targetPayload(port, chromeTargetId, { expression: stateExpression() }));
		const state = valueOf(probe);
		if (state.users > before.users || state.textLength === 0 || state.href !== before.href) return state;
		await sleep(200);
	}
	throw new Error("query_prompt_send_unconfirmed");
}

async function submit(input = {}, overrides = {}) {
	const deps = {
		newPage: overrides.newPage || Chrome.chromeNewPage,
		navigate: overrides.navigate || Chrome.chromeNavigate,
		click: overrides.click || Chrome.chromeClick,
		eval: overrides.eval || Chrome.chromeEval,
		close: overrides.close || Chrome.chromeClosePage
	};
	const port = Number(input.port);
	const timeoutMs = Number(input.timeoutMs || 30000);
	const opened = await deps.newPage({ port, url: input.url, shared: true, autoLaunch: false });
	const chromeTargetId = opened?.chromeTargetId || opened?.target?.id || opened?.pageId;
	if (!opened?.ok || !chromeTargetId) throw new Error(opened?.error || "query_prompt_tab_open_failed");
	let sent = false;
	try {
		const nav = await deps.navigate(targetPayload(port, chromeTargetId, {
			url: input.url,
			autoLaunch: false,
			timeoutMs
		}));
		if (!nav?.ok) throw new Error(nav?.error || "query_prompt_navigation_failed");
		const before = await waitReady(port, chromeTargetId, timeoutMs, deps);
		const clicked = await deps.click(targetPayload(port, chromeTargetId, {
			selector: SEND_SELECTOR,
			timeoutMs
		}));
		if (!clicked?.ok) throw new Error(clicked?.error || "query_prompt_send_click_failed");
		const after = await waitSent(port, chromeTargetId, before, timeoutMs, deps);
		sent = true;
		return { ok: true, sent: true, chromeTargetId, before, after };
	} finally {
		if (sent || input.closeOnFailure !== false) {
			await deps.close(targetPayload(port, chromeTargetId, { force: true })).catch(() => {});
		}
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { PROMPT_SELECTOR, SEND_SELECTOR, stateExpression, submit, valueOf };
