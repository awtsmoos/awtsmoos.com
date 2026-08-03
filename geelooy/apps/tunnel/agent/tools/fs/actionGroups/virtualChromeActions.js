// B"H
const { simulateNodeDomRuntime } = require("../nodeDomRuntime/index.js");

const TARGET_ID = "node-dom-page";
const VIRTUAL_HOME = "http://node-dom.local/";
const MAX_HTML_BYTES = 5 * 1024 * 1024;

/** Routes explicit node-dom browser requests without pretending native pixels exist. */
function wantsVirtualChrome(payload = {}) {
	const engine = String(payload.engine || payload.runtime || "").toLowerCase();
	return ["node-dom", "virtual-dom", "nodedom", "nodejs-dom"].includes(engine) ||
		payload.virtualDom === true || String(payload.virtualDom).toLowerCase() === "true";
}

/** Executes the Chrome-shaped vocabulary against one honest, stateless virtual page. */
async function virtualChrome(action, payload = {}) {
	if (["chromeStatus", "chromeTargets", "chromeTargetSelector", "chromeNewPage", "chromeLaunch", "chromeFind"].includes(action)) {
		return virtualSurface(action, payload);
	}
	const script = action === "chromeRunScript"
		? normalizeChromeScript(payload.script || payload.steps || payload.actions || payload.actionsJson)
		: [];
	const scriptUrl = firstNavigationUrl(script);
	const prepared = await prepareOptions(payload, {
		requireUrl: action === "chromeNavigate",
		fetchUrl: Boolean(scriptUrl),
		url: scriptUrl || undefined
	});
	if (!prepared.ok) return { ...prepared, action, engine: "node-dom", virtual: true };
	const options = prepared.options;
	if (action === "chromeEval") return await evalVirtual(options, payload);
	if (action === "chromeNavigate") return await snapshotVirtual(options, payload, action, true);
	if (action === "chromeSnapshot") return await snapshotVirtual(options, payload, action, false);
	if (action === "chromeClick") return await actionVirtual(options, payload, {
		action: "click",
		selector: selectorOf(payload)
	}, action);
	if (action === "chromeType") return await actionVirtual(options, payload, {
		action: payload.mode === "fill" ? "fill" : "type",
		selector: selectorOf(payload),
		text: payload.text ?? payload.value ?? ""
	}, action);
	if (action === "chromeWaitForSelector") return await actionVirtual(options, payload, {
		action: "waitForSelector",
		selector: selectorOf(payload),
		timeoutMs: payload.timeoutMs
	}, action);
	if (action === "chromeRunScript") return await runScriptVirtual(options, payload, script);
	return { ok: false, action, engine: "node-dom", virtual: true, error: "unsupported_virtual_chrome_action" };
}

function virtualSurface(action, payload = {}) {
	const url = virtualUrl(payload, VIRTUAL_HOME);
	const target = {
		id: TARGET_ID,
		targetId: TARGET_ID,
		type: "page",
		url,
		href: url,
		title: payload.title || "Node DOM virtual page",
		virtual: true,
		engine: "node-dom"
	};
	const common = {
		ok: true,
		action,
		engine: "node-dom",
		virtual: true,
		connected: true,
		browserControl: true,
		nativeBrowser: false,
		chromeTargetId: TARGET_ID,
		url,
		target,
		targets: [target],
		message: "Node DOM browser control is available. Every action receives explicit HTML, files, or a fetchable URL."
	};
	if (action === "chromeFind") return { ...common, found: true, foundEngine: "node-dom" };
	if (action === "chromeLaunch") return { ...common, launched: false, reused: true };
	if (action === "chromeNewPage") return { ...common, created: true };
	return common;
}

async function prepareOptions(payload = {}, request = {}) {
	const url = virtualUrl({ ...payload, url: request.url || payload.url }, "");
	if (request.requireUrl && !url) {
		return { ok: false, error: "browser_navigation_url_required" };
	}
	if ((request.requireUrl || request.fetchUrl) && /^about:blank(?:[#?].*)?$/i.test(url)) {
		return { ok: false, error: "about_blank_rejected", url };
	}
	const files = parseMaybeJson(payload.files, payload.files || {});
	let html = payload.html || "";
	const hasEntryFile = files && typeof files === "object" &&
		Boolean(files[payload.entry || "index.html"]);
	if (!html && !hasEntryFile && url && (request.requireUrl || request.fetchUrl)) {
		if (payload.allowUrlFetch === false || payload.fetchUrl === false) {
			return { ok: false, error: "virtual_navigation_html_required", url };
		}
		const fetched = await fetchNavigationHtml(url, payload.timeoutMs);
		if (!fetched.ok) return fetched;
		html = fetched.html;
	}
	return {
		ok: true,
		options: baseOptions({ ...payload, files, html, url: url || VIRTUAL_HOME })
	};
}

function baseOptions(payload = {}) {
	return {
		...payload,
		engine: "node-dom",
		runtime: "browser",
		html: payload.html || "<body></body>",
		files: parseMaybeJson(payload.files, payload.files || {}),
		entry: payload.entry || "index.html",
		url: virtualUrl(payload, VIRTUAL_HOME),
		waitMs: Number(payload.waitMs || 0),
		timeoutMs: Number(payload.timeoutMs || 30000),
		format: "json"
	};
}

async function evalVirtual(options, payload) {
	const expression = expressionOf(payload);
	const result = await simulateNodeDomRuntime({ ...options, returnValues: [expression] });
	const value = result.values ? result.values[expression] : undefined;
	return {
		ok: result.ok !== false,
		action: "chromeEval",
		engine: "node-dom",
		virtual: true,
		url: options.url,
		href: options.url,
		expression,
		value,
		result: { result: { value } },
		runtime: result
	};
}

async function snapshotVirtual(options, payload, action, navigated) {
	const result = await simulateNodeDomRuntime({
		...options,
		browserActions: [{ action: "snapshot" }]
	});
	const snapshot = result.snapshot || result.interactionLog?.at?.(-1)?.value || null;
	return {
		ok: result.ok !== false,
		action,
		engine: "node-dom",
		virtual: true,
		url: options.url,
		href: options.url,
		currentUrl: result.snapshot?.window?.location || options.url,
		chromeTargetId: TARGET_ID,
		...(navigated ? {
			navigation: {
				ok: result.ok !== false,
				url: options.url,
				currentUrl: result.snapshot?.window?.location || options.url,
				virtual: true
			}
		} : {}),
		snapshot,
		runtime: result
	};
}

async function actionVirtual(options, payload, step, action) {
	if (!step.selector) return { ok: false, action, engine: "node-dom", virtual: true, error: "missing_selector" };
	const actions = [...existingActions(payload), step];
	const result = await simulateNodeDomRuntime({
		...options,
		browserActions: actions,
		returnValues: parseReturnValues(payload)
	});
	return {
		ok: result.ok !== false,
		action,
		engine: "node-dom",
		virtual: true,
		url: options.url,
		href: options.url,
		step,
		interactionLog: result.interactionLog || [],
		values: result.values || {},
		runtime: result
	};
}

async function runScriptVirtual(options, payload, actions) {
	const result = await simulateNodeDomRuntime({
		...options,
		browserActions: actions,
		returnValues: parseReturnValues(payload)
	});
	return {
		ok: result.ok !== false,
		action: "chromeRunScript",
		engine: "node-dom",
		virtual: true,
		url: options.url,
		href: options.url,
		count: actions.length,
		interactionLog: result.interactionLog || [],
		values: result.values || {},
		runtime: result
	};
}

function normalizeChromeScript(raw) {
	const list = parseMaybeJson(raw, raw || []);
	if (!Array.isArray(list)) return [];
	return list.map(step => {
		const type = step.type || step.action;
		if (["goto", "navigate"].includes(type)) return { action: "snapshot", navigationUrl: step.url || step.href || step.targetUrl };
		if (type === "eval") return { ...step, action: "evaluate", expression: expressionOf(step) };
		if (type === "wait") return { ...step, action: step.selector ? "waitForSelector" : "waitForTimeout" };
		return { ...step, action: type };
	});
}

function firstNavigationUrl(actions = []) {
	return actions.find(step => step.navigationUrl)?.navigationUrl || "";
}

function existingActions(payload = {}) {
	const parsed = parseMaybeJson(
		payload.browserActions || payload.pageActions || payload.interactions || payload.actionsJson,
		[]
	);
	return Array.isArray(parsed) ? parsed : [];
}

function parseReturnValues(payload = {}) {
	const parsed = parseMaybeJson(payload.returnValues || payload.values, []);
	return Array.isArray(parsed) ? parsed : [];
}

function parseMaybeJson(value, fallback) {
	if (value == null || value === "") return fallback;
	if (typeof value !== "string") return value;
	try { return JSON.parse(value); } catch { return fallback; }
}

function selectorOf(payload = {}) {
	return String(payload.selector || payload.query || "").trim();
}

function expressionOf(payload = {}) {
	return String(
		payload.expression ?? payload.script ?? payload.source ?? payload.code ??
		payload.command ?? payload.text ?? "document.title"
	);
}

function virtualUrl(payload = {}, fallback = "") {
	const params = parseMaybeJson(payload.params, {});
	let raw = "";
	for (const key of ["url", "href", "targetUrl", "p", "path"]) {
		for (const value of [payload[key], params?.[key]]) {
			const text = String(value ?? "").trim();
			if (text) {
				raw = text;
				break;
			}
		}
		if (raw) break;
	}
	if (!raw) raw = String(fallback || "").trim();
	if (!raw) return "";
	try {
		return new URL(raw, payload.origin || VIRTUAL_HOME).toString();
	} catch {
		return raw;
	}
}

async function fetchNavigationHtml(url, timeoutMs = 15000) {
	if (!/^https?:\/\//i.test(url)) {
		return { ok: false, error: "virtual_navigation_protocol_unsupported", url };
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), Math.min(15000, Math.max(1000, Number(timeoutMs || 15000))));
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" }
		});
		if (!response.ok) return { ok: false, error: "virtual_navigation_http_error", status: response.status, url };
		const declared = Number(response.headers.get("content-length") || 0);
		if (declared > MAX_HTML_BYTES) return { ok: false, error: "virtual_navigation_response_too_large", url };
		const html = await response.text();
		if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
			return { ok: false, error: "virtual_navigation_response_too_large", url };
		}
		return { ok: true, html };
	} catch (error) {
		return { ok: false, error: "virtual_navigation_fetch_failed", message: error.message, url };
	} finally {
		clearTimeout(timer);
	}
}

module.exports = {
	TARGET_ID,
	baseOptions,
	expressionOf,
	fetchNavigationHtml,
	normalizeChromeScript,
	virtualChrome,
	virtualUrl,
	wantsVirtualChrome
};
