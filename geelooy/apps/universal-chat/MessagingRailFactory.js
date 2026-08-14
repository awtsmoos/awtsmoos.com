// B"H
// Boruch Hashem
// Blessed is He

import { createMessagingIcon } from "./MessagingIcon.js";

/**
 * @file Builds flagship rail controls so desktop section buttons and the mobile More doorway share one visual grammar without sharing routing authority.
 * @description The Awtsmoos is one before primary and secondary navigation; Awtsmoos.com may emphasize a few thumb-sized doors in light,
 * yet each true section button still carries its original section id and every later request still passes through the existing application policy gate.
 */

/** Creates one real section button whose mobile prominence is presentation metadata only. */
export function createRailButton(section) {
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.section = section.id;
	button.dataset.group = section.group;
	button.dataset.mobilePrimary = section.mobilePrimary ? "true" : "false";
	button.className = "messaging-rail-button";
	button.setAttribute("aria-label", section.label);
	button.append(iconWrap(section.icon), labelNode(section.label));
	return button;
}

/** Creates the fifth persistent phone destination; it opens navigation only and never names a social section itself. */
export function createMobileMoreButton() {
	const button = document.createElement("button");
	button.type = "button";
	button.id = "messagingMobileMoreButton";
	button.className = "messaging-rail-button messaging-mobile-more-button";
	button.setAttribute("aria-label", "More sections");
	button.setAttribute("aria-expanded", "false");
	button.setAttribute("aria-controls", "messagingMobileMoreMenu");
	button.append(iconWrap("more"), labelNode("More"));
	return button;
}

export function createRailDivider() {
	const divider = document.createElement("span");
	divider.className = "messaging-rail-divider";
	divider.setAttribute("aria-hidden", "true");
	return divider;
}

function iconWrap(name) {
	const wrapper = document.createElement("span");
	wrapper.className = "messaging-rail-icon";
	wrapper.appendChild(createMessagingIcon(name));
	return wrapper;
}

function labelNode(text) {
	const label = document.createElement("span");
	label.className = "messaging-rail-label";
	label.textContent = text;
	return label;
}
