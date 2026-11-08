// B"H
// Shliach Browser Link — content script (Standard + Minimal).
//
// Runs in the extension's isolated world: it sees the DOM but NOT the
// page's own JavaScript variables. It answers a small fixed set of actions
// from the background worker. It never modifies the page except when the
// agent asks it to click or fill something — and then only that element.
// The page readers (raw HTML, DOM tree, summary, clickable elements) are
// pure: they only read, so the page cannot tell it was read — but the page
// can in principle detect that an extension is present, unlike the
// debugger path in the Unrestricted version. The readers live in
// extract.js, concatenated in front of this file by build.mjs.
//
// Standard: declared in the manifest for https://awtsmoos.com/*.
// Minimal: injected on demand into the ACTIVE tab only (user clicked the
// extension, so activeTab grants this one tab).

function readPage() {
	const links = [...document.querySelectorAll("a")].slice(0, 50).map((a) => ({
		text: (a.textContent || "").trim().slice(0, 80),
		href: a.href,
	}));
	const forms = [...document.querySelectorAll("form")].slice(0, 10).map((f) => ({
		action: f.action || "",
		fields: [...f.querySelectorAll("input, textarea, select")].slice(0, 20).map((el) => ({
			name: el.name || "",
			type: el.type || el.tagName.toLowerCase(),
			placeholder: el.placeholder || "",
			value: (el.value || "").slice(0, 200),
		})),
	}));
	return {
		title: document.title,
		url: location.href,
		text: document.body ? document.body.innerText.slice(0, 20000) : "",
		links,
		forms,
	};
}

function clickElement(selector) {
	const el = document.querySelector(selector);
	if (!el) return { ok: false, error: "no such element: " + selector };
	el.click();
	return { ok: true };
}

function fillElement(selector, value) {
	const el = document.querySelector(selector);
	if (!el) return { ok: false, error: "no such element: " + selector };
	const proto = el.tagName === "TEXTAREA"
		? window.HTMLTextAreaElement.prototype
		: window.HTMLInputElement.prototype;
	const setter = Object.getOwnPropertyDescriptor(proto, "value");
	if (setter && setter.set) setter.set.call(el, String(value));
	else el.value = String(value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
	el.dispatchEvent(new Event("change", { bubbles: true }));
	return { ok: true };
}

function navigate(url) {
	location.href = String(url);
	return { ok: true, url: String(url) };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	(async () => {
		try {
			if (!msg || typeof msg !== "object") return sendResponse({ ok: false, error: "bad message" });
			if (msg.action === "read") return sendResponse({ ok: true, ...readPage() });
			if (msg.action === "html") return sendResponse({ ok: true, ...extractPageHtml(msg) });
			if (msg.action === "dom") return sendResponse({ ok: true, ...extractPageDom(msg) });
			if (msg.action === "summary") return sendResponse({ ok: true, ...extractPageSummary(msg) });
			if (msg.action === "elements") return sendResponse({ ok: true, ...extractPageElements(msg) });
			if (msg.action === "click") return sendResponse(clickElement(msg.selector));
			if (msg.action === "fill") return sendResponse(fillElement(msg.selector, msg.value));
			if (msg.action === "navigate") return sendResponse(navigate(msg.url));
			return sendResponse({ ok: false, error: "unknown content action: " + msg.action });
		} catch (e) {
			sendResponse({ ok: false, error: String((e && e.message) || e) });
		}
	})();
	return true;
});
