// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Transport, identity, and mount primitives for Geelooy OS social windows.
 * @description
 * The Awtsmoos lets transport remain transport and presentation remain presentation;
 * Awtsmoos.com keeps this bridge small while cards and messaging live in their own stations.
 */
export {
	commandCard,
	feedPreview,
	status,
	thanksFallback
} from "./socialCards.js";
export { inlineMessaging } from "./messageWidgets.js";

export function safeText(value) {
	return String(value ?? "");
}

export function currentAlias() {
	const stored = localStorage.getItem("awtsmoos_social_inbox_alias")
		|| localStorage.getItem("awtsmoosAlias")
		|| window.awtsmoosAlias
		|| "";
	return safeText(stored).replace(/^@/, "").trim();
}

export async function json(url) {
	const response = await fetch(url);
	const text = await response.text();
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		body = { raw: text };
	}
	if (!response.ok || body?.error) {
		throw new Error(body?.error?.message || body?.message || response.statusText || "Request failed.");
	}
	return body?.ok && Object.prototype.hasOwnProperty.call(body, "data")
		? body.data
		: body?.success ?? body;
}

export function mountCard({ enabled, aliasId, onToggle }) {
	const card = document.createElement("article");
	card.className = "geelooy-os-social-panel__card social-mount-card";
	card.append(textNode("small", "OPTIONAL SOCIAL FILESYSTEM"));
	card.append(textNode("strong", enabled ? `@${aliasId} is mounted` : "Social drive is hidden"));
	card.append(textNode("p", enabled
		? "Heichelos appear as folders, series as folders, and posts as readable files."
		: "Enable the drive when you want publishing spaces inside Explorer."));
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = enabled ? "Hide social drive" : "Mount social drive";
	button.addEventListener("click", onToggle);
	card.append(button);
	return card;
}

function textNode(tag, value) {
	const node = document.createElement(tag);
	node.textContent = safeText(value);
	return node;
}
