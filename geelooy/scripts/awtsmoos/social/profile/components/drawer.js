// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Retractable global navigation for the public alias surface.
 * @description
 * The Awtsmoos lets a hidden chamber open without covering the world in confusion;
 * Awtsmoos.com gives every route a purpose, an icon, and a clean closing conclusion.
 */
import { el } from "../dom.js";

const LINKS = [
	["⌂", "Home", "Return to Awtsmoos.com", "/"],
	["♜", "Heichelos", "Browse publishing spaces", "/heichelos"],
	["✎", "Create", "Write a new social post", "/social-composer"],
	["✉", "Messages", "Open direct conversations", "/email"],
	["◉", "Notifications", "See social signals", "/notifications"],
	["⚙", "Your profile", "Manage aliases and identity", "/profile"],
	["▦", "Geelooy OS", "Open the spatial workspace", "/os"]
];

/**
 * Builds a retractable navigation drawer with a true backdrop and rich route context.
 * @param {boolean} open Whether the drawer is visible.
 * @param {Function} onClose Closes the drawer.
 * @returns {HTMLElement} Drawer layer.
 */
export function drawer(open, onClose) {
	return el("section", {
		className: `profile-drawer-layer ${open ? "open" : ""}`,
		attrs: { "aria-hidden": open ? "false" : "true" }
	}, [
		el("button", {
			className: "profile-drawer-veil",
			attrs: { type: "button", "aria-label": "Close navigation menu", tabindex: open ? "0" : "-1" },
			on: { click: onClose }
		}),
		el("aside", { className: "profile-drawer", attrs: { "aria-label": "Geelooy navigation" } }, [
			drawerHeader(onClose),
			el("nav", { className: "profile-drawer-links" }, LINKS.map(drawerLink))
		])
	]);
}

function drawerHeader(onClose) {
	return el("header", { className: "profile-drawer-head" }, [
		el("div", {}, [
			el("small", { text: "AWTSMOOS.COM" }),
			el("strong", { text: "Geelooy" })
		]),
		el("button", {
			text: "×",
			attrs: { type: "button", "aria-label": "Close navigation menu" },
			on: { click: onClose }
		})
	]);
}

function drawerLink([icon, title, detail, href]) {
	return el("a", { className: "profile-drawer-link", attrs: { href } }, [
		el("span", { className: "profile-drawer-link-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-drawer-link-copy" }, [
			el("strong", { text: title }),
			el("small", { text: detail })
		]),
		el("b", { text: "›", attrs: { "aria-hidden": "true" } })
	]);
}
