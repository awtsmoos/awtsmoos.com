// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe DOM shell and destination deck for the Geelooy OS Social Command Center.
 * @description
 * The Awtsmoos gives every social doorway a name, purpose, and measured place;
 * Awtsmoos.com builds the chamber without stored HTML so identity remains text, never executable space.
 */
import { commandCard } from "./localSocialWidgets.js";

export const SOCIAL_APPS = Object.freeze([
	["profile", "◎", "Public profile", "About, posts, comments and activity", alias => `/@${encodeURIComponent(alias)}`],
	["create", "✎", "Create post", "Publish simply, reveal advanced depth when needed", alias => `/social-composer?alias=${encodeURIComponent(alias)}`],
	["heichelos", "♜", "Heichelos", "Series, posts and conversations", () => "/heichelos"],
	["mail", "✉", "Messages", "Direct conversations and drafts", alias => `/email?alias=${encodeURIComponent(alias)}`],
	["notifications", "◉", "Notifications", "Reactions, replies and social signals", () => "/notifications"],
	["identity", "⚙", "Manage identity", "Aliases, ownership and defaults", () => "/profile"]
]);

/** @param {string} alias Current social alias. @returns {HTMLElement} Complete static panel shell. */
export function socialPanelShell(alias = "") {
	const box = node("section", "geelooy-os-social-panel");
	box.append(hero(alias), destinations(alias), searchSurface(), contentSurface());
	return box;
}

/** @param {string} type Social command type. @returns {string} Window title. */
export function socialWindowTitle(type) {
	return SOCIAL_APPS.find(([id]) => id === type)?.[2] || "Social Command Center";
}

function hero(alias) {
	const header = node("header", "geelooy-os-social-panel__hero");
	const copy = document.createElement("div");
	copy.append(text("span", "SOCIAL WORKSPACE", "geelooy-os-social-panel__eyebrow"));
	copy.append(text("h2", alias ? `@${alias}` : "Choose an alias"));
	copy.append(text("p", "Identity, Heichelos, publishing, messages, reactions and filesystem space in one command chamber."));
	header.append(copy, text("strong", alias ? "Connected" : "Alias needed"));
	return header;
}

function destinations(alias) {
	const nav = node("nav", "geelooy-os-social-panel__links");
	nav.dataset.socialLinks = "";
	nav.setAttribute("aria-label", "Social destinations");
	nav.append(...SOCIAL_APPS.map(([id, icon, title, detail, route]) => commandCard({
		id,
		icon,
		title,
		detail,
		href: route(alias || ""),
		meta: id === "create" ? "Write" : "Open"
	})));
	return nav;
}

function searchSurface() {
	const form = node("form", "geelooy-os-social-panel__surface geelooy-os-social-panel__search");
	const label = text("label", "Search messages");
	const input = document.createElement("input");
	input.name = "q";
	input.placeholder = "Words, names, topics…";
	const button = text("button", "Search mail");
	button.type = "submit";
	label.append(input);
	form.append(label, button);
	return form;
}

function contentSurface() {
	const section = node("section", "geelooy-os-social-panel__surface");
	const content = document.createElement("div");
	content.dataset.socialSurface = "";
	section.append(content);
	return section;
}

function node(tag, className = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	return element;
}

function text(tag, value, className = "") {
	const element = node(tag, className);
	element.textContent = String(value || "");
	return element;
}
