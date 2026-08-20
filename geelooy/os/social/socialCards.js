// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reusable social status, destination, and feed cards for Geelooy OS.
 * @description
 * The Awtsmoos lets each signal arrive with title, context, and destination;
 * Awtsmoos.com keeps presentation separate from transport and mount orchestration.
 */

export function status(text, tone = "plain") {
	const node = document.createElement("p");
	node.className = `g-social-status ${tone}`;
	node.setAttribute("aria-live", "polite");
	node.textContent = safeText(text);
	return node;
}

export function commandCard({ id, icon, title, detail, href, meta = "Open" }) {
	const anchor = document.createElement("a");
	anchor.className = "geelooy-os-social-panel__action";
	anchor.href = href;
	anchor.dataset.osSocialApp = id;
	anchor.append(iconNode(icon), copyNode(title, detail), textNode("b", `${meta} ›`));
	return anchor;
}

export function feedPreview(items = []) {
	const list = document.createElement("div");
	list.className = "geelooy-os-social-panel__preview-list";
	if (!items.length) {
		list.append(status("No recent public feed items are available."));
		return list;
	}
	items.slice(0, 6).forEach(item => list.append(feedCard(item)));
	return list;
}

export function thanksFallback({ href = "/heichelos" } = {}) {
	return commandCard({
		id: "thanks",
		icon: "♡",
		title: "Thanks",
		detail: "Open a confirmed Heichel route for gratitude and response.",
		href,
		meta: "Continue"
	});
}

function feedCard(item) {
	const source = item?.source || item || {};
	const href = source.url || source.href
		|| (source.aliasId ? `/@${encodeURIComponent(source.aliasId)}` : "/notifications");
	return commandCard({
		id: source.id || item?.kind || "feed",
		icon: item?.kind === "comment" ? "◌" : "✦",
		title: source.title || source.postTitle || item?.title || "Recent social activity",
		detail: source.excerpt || source.summary || source.content || "Open this item in its original context.",
		href,
		meta: item?.kind || source.type || "View"
	});
}

function copyNode(title, detail) {
	const wrap = document.createElement("span");
	wrap.append(textNode("strong", title), textNode("small", detail));
	return wrap;
}

function iconNode(icon) {
	const node = textNode("span", icon || "•");
	node.setAttribute("aria-hidden", "true");
	return node;
}

function textNode(tag, value) {
	const node = document.createElement(tag);
	node.textContent = safeText(value);
	return node;
}

function safeText(value) {
	return String(value ?? "");
}
