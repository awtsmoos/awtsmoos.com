// B"H
// Boruch Hashem
// Blessed is He
//
// Shliach Browser Link — pure DOM readers (raw HTML, DOM tree, summary,
// clickable elements with stable selectors).
//
// These functions ONLY READ. They never modify the page, define no globals,
// add no listeners, and make no network requests. That is the whole point:
// the page cannot tell it was read.
//
// They are shared by both worlds:
//   - background.js loads this file with importScripts, then sends the
//     functions' own source into the page through the debugger
//     (Runtime.evaluate) — the Unrestricted version. Nothing is injected
//     into the page at all; the debugger runs the read outside the page's
//     JavaScript context, so the page has nothing to detect.
//   - build.mjs concatenates this file in front of content.js, so the
//     Standard / Minimal versions run the same readers from the content
//     script's isolated world. Those reads are also pure, but the page can
//     in principle detect that an extension is present (see the download
//     page); only the debugger path is truly invisible.
//
// Rules for this file: function declarations only, no top-level side
// effects, no references to anything outside the functions except each
// other and the DOM. The debugger path serializes these functions with
// toString() and runs them inside the page, so a function that referenced
// a file-level constant would break there.

/**
 * Raw HTML of the page, chunked. The relay refuses any message over
 * 64 KiB, so a whole page never fits in one answer; the agent pages
 * through with start/length. The HTML is the LIVE DOM serialized
 * (doctype + <html>), which is what the agent needs to see what is
 * actually rendered — not the original bytes from the server.
 */
function extractPageHtml(options) {
	const opts = options || {};
	const start = Math.max(0, opts.start || 0);
	const length = Math.min(Math.max(1, opts.length || 32000), 60000);
	const doctype = document.doctype ? "<!DOCTYPE " + document.doctype.name + ">\n" : "";
	const html = doctype + (document.documentElement ? document.documentElement.outerHTML : "");
	const totalLength = html.length;
	const chunk = html.slice(start, start + length);
	return {
		html: chunk,
		totalLength: totalLength,
		start: start,
		length: chunk.length,
		truncated: start + chunk.length < totalLength,
	};
}

/**
 * The parsed DOM tree as JSON: tag, meaningful attributes, the element's
 * own direct text, and element children. Script/style/noscript/template
 * contents are not recursed into (their code is noise for an agent reading
 * the page). Depth and node caps keep the answer under the relay's 64 KiB.
 */
function extractPageDom(options) {
	const opts = options || {};
	const maxDepth = Math.min(Math.max(1, opts.maxDepth || 6), 12);
	const maxNodes = Math.min(Math.max(1, opts.maxNodes || 200), 1000);
	const KEPT_ATTRS = ["id", "class", "href", "src", "alt", "title", "type", "name", "value", "placeholder", "role", "aria-label", "for", "action", "method", "target", "rel", "lang", "tabindex"];
	const NO_CHILDREN = { script: true, style: true, noscript: true, template: true };
	let count = 0;
	let truncated = false;

	function attrsOf(el) {
		const out = {};
		for (const name of KEPT_ATTRS) {
			const value = el.getAttribute ? el.getAttribute(name) : null;
			if (value != null && value !== "") out[name] = String(value).slice(0, 120);
		}
		return out;
	}

	function directText(el) {
		let text = "";
		const kids = el.childNodes || [];
		for (let i = 0; i < kids.length; i++) {
			if (kids[i].nodeType === 3) text += kids[i].textContent || "";
		}
		return text.replace(/\s+/g, " ").trim().slice(0, 200);
	}

	function nodeJson(el, depth) {
		if (count >= maxNodes) { truncated = true; return null; }
		if (depth > maxDepth) { truncated = true; return null; }
		count++;
		const tag = (el.tagName || "").toLowerCase();
		const node = { tag: tag, attrs: attrsOf(el) };
		// Script/style/noscript/template carry code, not readable text.
		if (!NO_CHILDREN[tag]) {
			const text = directText(el);
			if (text) node.text = text;
		}
		if (!NO_CHILDREN[tag]) {
			const kids = [];
			const children = el.children || [];
			for (let i = 0; i < children.length; i++) {
				const child = nodeJson(children[i], depth + 1);
				if (child) kids.push(child);
			}
			if (kids.length) node.children = kids;
		}
		return node;
	}

	const root = document.documentElement;
	if (!root) return { tree: null, nodeCount: 0, truncated: false };
	return { tree: nodeJson(root, 0), nodeCount: count, truncated: truncated };
}

/**
 * A compact summary the agent can read in seconds: title, headings
 * outline, meta description, the page's text (collapsed, capped), word
 * count, and the first links and forms. Deliberately small — a few KiB.
 */
function extractPageSummary(options) {
	const opts = options || {};
	const maxText = Math.min(Math.max(100, opts.maxText || 2000), 10000);
	const headings = [];
	const found = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
	for (let i = 0; i < found.length && headings.length < 30; i++) {
		const h = found[i];
		const text = (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120);
		if (text) headings.push({ level: parseInt(h.tagName.slice(1), 10), text: text });
	}
	let description = "";
	const meta = document.querySelector('meta[name="description"]');
	if (meta) description = (meta.getAttribute("content") || "").slice(0, 300);
	const rawText = document.body ? (document.body.innerText || "") : "";
	const text = rawText.replace(/\s+/g, " ").trim().slice(0, maxText);
	const links = [];
	const as = document.querySelectorAll("a[href]");
	for (let i = 0; i < as.length && links.length < 20; i++) {
		const a = as[i];
		const label = (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
		if (label) links.push({ text: label, href: a.href || "" });
	}
	const forms = [];
	const fs = document.querySelectorAll("form");
	for (let i = 0; i < fs.length && forms.length < 5; i++) {
		const f = fs[i];
		const fields = [];
		const inputs = f.querySelectorAll("input, textarea, select");
		for (let j = 0; j < inputs.length && fields.length < 20; j++) {
			const el = inputs[j];
			fields.push({
				name: el.name || "",
				type: el.type || (el.tagName || "").toLowerCase(),
				placeholder: el.placeholder || "",
				value: (el.value || "").slice(0, 200),
			});
		}
		forms.push({ action: f.action || "", fields: fields });
	}
	return {
		title: document.title || "",
		url: location.href || "",
		lang: (document.documentElement && document.documentElement.lang) || "",
		description: description,
		headings: headings,
		text: text,
		wordCount: text ? text.split(/\s+/).length : 0,
		links: links,
		forms: forms,
	};
}

/**
 * A stable selector for one element: the shortest selector that selects
 * exactly this element, verified with querySelector. Prefers #id, then
 * tag + classes, then a full path with :nth-of-type (unique by
 * construction, so it needs no verification). The agent clicks and fills
 * with these selectors.
 */
function stableSelector(el) {
	if (!el || el.nodeType !== 1) return "";
	if (el.id) {
		const idSel = "#" + (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(el.id) : el.id.replace(/([^a-zA-Z0-9_-])/g, "\\$1"));
		try {
			if (document.querySelector(idSel) === el) return idSel;
		} catch (e) {}
	}
	const tag = (el.tagName || "").toLowerCase();
	const className = (el.className && typeof el.className === "string") ? el.className : "";
	const classes = className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
	if (classes.length) {
		const esc = function (c) {
			return (typeof CSS !== "undefined" && CSS.escape) ? CSS.escape(c) : c.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
		};
		const clsSel = tag + "." + classes.map(esc).join(".");
		try {
			if (document.querySelector(clsSel) === el) return clsSel;
		} catch (e) {}
	}
	const parts = [];
	let node = el;
	while (node && node.nodeType === 1 && node !== document.documentElement) {
		let part = (node.tagName || "").toLowerCase();
		const parent = node.parentElement;
		if (parent) {
			const siblings = [];
			const kids = parent.children || [];
			for (let i = 0; i < kids.length; i++) {
				if (kids[i].tagName === node.tagName) siblings.push(kids[i]);
			}
			if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")";
		}
		parts.unshift(part);
		node = node.parentElement;
	}
	parts.unshift("html");
	return parts.join(" > ");
}

/**
 * Every clickable / selectable element the agent can act on, each with a
 * stable selector, its tag and type, visible text, and state. Only
 * visible elements are listed (a zero-size rect means the user cannot see
 * or click it); disabled ones are listed but flagged. Capped so the answer
 * stays under the relay's 64 KiB.
 */
function extractPageElements(options) {
	const opts = options || {};
	const limit = Math.min(Math.max(1, opts.limit || 150), 500);
	const found = document.querySelectorAll("a[href], button, input, select, textarea, summary, [role=\"button\"], [role=\"link\"], [onclick], [contenteditable=\"true\"], [tabindex]");
	const elements = [];
	let total = 0;
	for (let i = 0; i < found.length; i++) {
		const el = found[i];
		let rect = null;
		try { rect = el.getBoundingClientRect(); } catch (e) { rect = null; }
		if (!rect || rect.width <= 0 || rect.height <= 0) continue;
		total++;
		if (elements.length >= limit) continue;
		const tag = (el.tagName || "").toLowerCase();
		const record = {
			selector: stableSelector(el),
			tag: tag,
			type: el.type || "",
			text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
			disabled: !!el.disabled,
		};
		if (el.href) record.href = String(el.href).slice(0, 300);
		if (el.name) record.name = String(el.name).slice(0, 100);
		if (el.placeholder) record.placeholder = String(el.placeholder).slice(0, 100);
		if (el.value != null && (tag === "input" || tag === "select" || tag === "textarea")) {
			record.value = String(el.value).slice(0, 100);
		}
		elements.push(record);
	}
	return { elements: elements, total: total, truncated: total > elements.length };
}
