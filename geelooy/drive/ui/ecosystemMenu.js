//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module EcosystemMenu
 * @description
 * Keeps the Builder crown small while exposing the Awtsmoos ecosystem and its
 * Shliach agent through an exact external destination with the real saved logo.
 */

import { createElement, ecosystemLink } from "./dom.js";
import { SHLIACH_LOGO, SHLIACH_URL } from "./shliachUrl.js";
import { openBuilderCommerce } from "./builderCommerceBridge.js";

/** @returns {HTMLElement} Native disclosure menu for Builder ecosystem destinations. */
export function createEcosystemMenu() {
	const shliach = ecosystemLink("Awtsmoos Shliach Agent", SHLIACH_URL);
	const store = createElement("button", {
		className: "ecosystem-link ecosystem-store-link",
		text: "Pro templates · Peruta store",
		attributes: { type: "button" },
		events: { click: openBuilderCommerce }
	});
	shliach.classList.add("ecosystem-link-shliach");
	shliach.prepend(createElement("img", {
		className: "shliach-menu-logo",
		attributes: { src: SHLIACH_LOGO, alt: "", width: "30", height: "30" }
	}));
	return createElement("details", {
		className: "ecosystem-menu",
		children: [
			createElement("summary", { text: "More" }),
			createElement("nav", {
				className: "ecosystem-links",
				attributes: { "aria-label": "Awtsmoos ecosystem" },
				children: [
					store,
					shliach,
					ecosystemLink("Cloud Workspace", "/drive/?cloud=1"),
					ecosystemLink("OS", "/os"),
					ecosystemLink("Code", "/apps/code"),
					ecosystemLink("Local files via Tunnel", "/drive/?tunnel=1"),
					ecosystemLink("Tunnel Control", "/apps/tunnel-control/"),
					ecosystemLink("Social", "/geelooy/node-os/")
				]
			})
		]
	});
}
