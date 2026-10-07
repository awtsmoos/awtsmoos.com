// B"H
// Boruch Hashem
// Blessed is He

const { chromeEval } = require("../../chrome/actions.js");
const { PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");
const { optimizeDom } = require("./domOptimizer.js");

/** The Awtsmoos touches Send once, verifies its exact page, and keeps uncertain evidence. */
async function sendPrompt(payload = {}) {
	const port = Number(payload.port || payload.chromePort || 9223);
	const message = String(payload.message || payload.prompt || payload.text || "");
	if (!message) return fail("missing_message", { port });
	const timeoutMs = clamp(payload.timeoutMs, 1000, 5000, 1500);
	const optimizer = payload.optimizeDom === false ? { skipped: true } :
		await withDeadline(optimizeDom({ ...payload, port }), 700, "optimizer_timeout")
			.catch(error => ({ ok: false, skipped: true, error: error.message }));
	const expression = browserScript(message, payload.expectedUrl || payload.preferUrl || payload.url || "", payload.turnId || "");
	const got = await withDeadline(chromeEval({ ...payload, port, expression, timeoutMs, maxLogs: 20, maxValueChars: 12000 }),
		timeoutMs + 750, "send_eval_timeout").catch(error => ({ ok: false, error: error.message }));
	const value = unwrapEvalValue(got);
	const submitted = value?.ok === true;
	return { ok: submitted, submitted, action: "chatgptSendPrompt", port, optimizer,
		result: value || null, proof: proofOf(got, value), uncertain: !submitted && value?.notSent !== true,
		error: submitted ? "" : value?.error || got?.error || unwrapError(got) || "send_no_eval_value" };
}
function fail(error, extra = {}) { return { ok: false, submitted: false, action: "chatgptSendPrompt", error, ...extra }; }
function unwrapEvalValue(got = {}) {
	return got?.result?.result?.valueSummary?.value || got?.result?.valueSummary?.value ||
		got?.result?.result?.value || got?.result?.value || got?.valueSummary?.value || got?.value || null;
}
function unwrapError(got = {}) {
	return got?.result?.exceptionDetails?.text || got?.result?.exceptionDetails?.exception?.description || got?.exceptionDetails?.text || "";
}
function proofOf(got = {}, value = null) {
	return { chromeOk: got?.ok !== false, hasValue: !!value, valueOk: !!value?.ok,
		via: value?.via || "", href: value?.href || "", tag: value?.tag || "", valueLength: value?.valueLength || 0 };
}
function withDeadline(promise, ms, label) {
	let timer;
	return Promise.race([promise, new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(label + " after " + ms + "ms")), ms);
	})]).finally(() => clearTimeout(timer));
}
function clamp(value, min, max, fallback) {
	const number = Number(value || fallback);
	return Math.max(min, Math.min(Number.isFinite(number) ? Math.floor(number) : fallback, max));
}
function browserScript(message, expectedUrl = "", turnId = "") {
	return `(() => {
		const selectors = ${JSON.stringify(PROMPT_SELECTORS)};
		const sendSelectors = ${JSON.stringify(SEND_SELECTORS)};
		const text = ${JSON.stringify(message)};
		const expected = ${JSON.stringify(expectedUrl)};
		const turnId = ${JSON.stringify(turnId)};
		const visible = el => !!el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
		const canonical = value => { try { const u = new URL(value); return u.origin + u.pathname.replace(/\\/$/, ''); } catch { return ''; } };
		const correctTarget = () => location.origin === 'https://chatgpt.com' && (!expected || canonical(location.href) === canonical(expected));
		const marker = turnId ? 'awtsmoos-send-' + turnId : '';
		return (async () => {
			if (!correctTarget()) return { ok:false, notSent:true, error:'unexpected_conversation', href:location.href };
			if (marker && sessionStorage.getItem(marker)) return { ok:false, error:'submission_intent_already_present', href:location.href };
			const prompt = selectors.map(s => document.querySelector(s)).find(visible);
			const button = sendSelectors.map(s => document.querySelector(s)).find(visible);
			if (!prompt || !button || button.disabled || button.getAttribute('aria-disabled') === 'true') {
				return { ok:false, notSent:true, error:'composer_or_send_unavailable', href:location.href };
			}
			prompt.focus();
			if (prompt.isContentEditable) {
				document.execCommand('selectAll', false, null);
				document.execCommand('insertText', false, text);
			} else {
				const prototype = prompt instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
				const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
				if (setter) setter.call(prompt, text); else prompt.value = text;
			}
			prompt.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:text }));
			prompt.dispatchEvent(new Event('change', { bubbles:true }));
			await new Promise(resolve => setTimeout(resolve, 150));
			if (!correctTarget()) return { ok:false, notSent:true, error:'target_changed_before_send', href:location.href };
			const value = prompt.isContentEditable ? prompt.innerText : prompt.value;
			if (String(value || '').trim() !== text.trim()) return { ok:false, notSent:true, error:'composer_readback_mismatch' };
			const ready = sendSelectors.map(s => document.querySelector(s)).find(visible);
			if (!ready || ready.disabled || ready.getAttribute('aria-disabled') === 'true') return { ok:false, notSent:true, error:'send_not_ready' };
			if (marker) sessionStorage.setItem(marker, 'intent');
			ready.click();
			if (marker) sessionStorage.setItem(marker, 'activated');
			return { ok:true, via:'button', evidence:'single_ui_activation', tag:prompt.tagName,
				valueLength:text.length, href:location.href, turnId };
		})();
	})()`;
}
module.exports = { sendPrompt, browserScript, unwrapEvalValue, unwrapError, proofOf, withDeadline, clamp };
