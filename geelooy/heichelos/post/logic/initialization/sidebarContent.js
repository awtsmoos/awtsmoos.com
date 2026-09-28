//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SidebarMenu
 * @description
 * The Awtsmoos gives Awtsmoos.com a short menu of doors, not a wall of prose.
 * Each compact tile opens one chamber and keeps the reading surface close.
 */
import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

const TAB_PORTALS = [
	{ title: "Community", icon: "💬", name: "insights" },
	{ title: "Details", icon: "📜", name: "details" },
	{ title: "Approvals", icon: "✓", name: "approvals" },
	{ title: "Saved", icon: "🔖", name: "bookmarks" },
	{ title: "Footnotes", icon: "✦", name: "footnotes" }
];

function portalButton(event) {
	return event?.currentTarget || event?.target?.closest?.("button");
}

function markActive(source) {
	const grid = source?.closest?.(".post-root-menu-grid");
	grid?.querySelectorAll?.(".awtsmoos-massive-menu-btn").forEach(button => {
		const active = button === source;
		button.classList.toggle("awtsmoos-portal-active", active);
		button.setAttribute("aria-current", active ? "page" : "false");
	});
}

async function openPortal(tabRefs, name, event) {
	event?.preventDefault?.();
	event?.stopPropagation?.();
	const button = portalButton(event);
	if (button?.dataset.tapLock === "true") return;
	if (button) button.dataset.tapLock = "true";
	setTimeout(() => {
		if (button) delete button.dataset.tapLock;
	}, 320);
	try {
		const tab = tabRefs?.[name];
		if (tab?.open) await tab.open();
		else if (window.tabManager?.openByName) await window.tabManager.openByName(name);
		else throw new Error("Portal unavailable");
		markActive(button);
	} catch (error) {
		console.error(`B"H - Portal ${name} failed to open:`, error);
	}
}

function createPortal(portal, tabRefs) {
	return {
		tag: "button",
		attr: {
			class: "awtsmoos-massive-menu-btn",
			type: "button",
			"data-portal": portal.name,
			"aria-label": portal.title
		},
		events: { click: event => openPortal(tabRefs, portal.name, event) },
		children: [
			{ tag: "span", attr: { class: "menu-icon-vessel", "aria-hidden": "true" }, text: portal.icon },
			{ tag: "span", attr: { class: "menu-portal-title" }, text: portal.title }
		]
	};
}

export function populateRootMenu(actualTab, post, tabRefs) {
	if (!actualTab) return;
	actualTab.innerHTML = "";
	actualTab.dataset.awtsmoosMenuReady = "true";
	actualTab.appendChild(GenesisEngine.manifest({
		tag: "div",
		attr: { class: "post-root-menu-grid", role: "menu", "aria-label": "Reader menu" },
		children: TAB_PORTALS.map(portal => createPortal(portal, tabRefs))
	}));
}
