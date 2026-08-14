// B"H
// Boruch Hashem
// Blessed is He

import { createMobileMoreGroups } from "./MessagingMobileMoreItems.js";

/**
 * @file Builds the static mobile More sheet shell while interaction, motion, focus, and section routing stay in their own owners.
 * @description The Awtsmoos is one before backdrop, grabber, heading, and grouped doorways; Awtsmoos.com gives those garments a small structural home in light
 * so the navigation coordinator can remain a coordinator rather than becoming a markup warehouse.
 */

export function createMobileMoreShell(sections = []) {
	const menu = document.createElement("div");
	menu.id = "messagingMobileMoreMenu";
	menu.className = "messaging-mobile-more-menu";
	menu.dataset.motionState = "closed";
	menu.hidden = true;
	const backdrop = document.createElement("button");
	backdrop.type = "button";
	backdrop.className = "messaging-mobile-more-backdrop";
	backdrop.dataset.mobileMoreClose = "true";
	backdrop.setAttribute("aria-label", "Close more sections");
	const sheet = document.createElement("section");
	sheet.className = "messaging-mobile-more-sheet";
	sheet.setAttribute("role", "dialog");
	sheet.setAttribute("aria-modal", "true");
	sheet.setAttribute("aria-labelledby", "messagingMobileMoreTitle");
	sheet.append(grabber(), header(), createMobileMoreGroups(sections));
	menu.append(backdrop, sheet);
	return menu;
}

function grabber() {
	const element = document.createElement("span");
	element.className = "messaging-mobile-more-grabber";
	element.setAttribute("aria-hidden", "true");
	return element;
}

function header() {
	const element = document.createElement("header");
	const copy = document.createElement("div");
	const title = document.createElement("h2");
	title.id = "messagingMobileMoreTitle";
	title.textContent = "More Awtsmoos";
	const subtitle = document.createElement("p");
	subtitle.textContent = "People, Torah, mail, activity, presence, and your settings.";
	copy.append(title, subtitle);
	const close = document.createElement("button");
	close.type = "button";
	close.dataset.mobileMoreClose = "true";
	close.setAttribute("aria-label", "Close more sections");
	close.textContent = "×";
	element.append(copy, close);
	return element;
}
