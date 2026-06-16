//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 356: The portals become single-touch vessels.
 * No duplicate pointer/click storms. The Main Menu always paints a real grid,
 * and each button opens exactly one chamber.
 */
import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

const TAB_PORTALS = [
    { title: "Insights", desc: "Write and read living commentary", icon: "💬", name: "insights" },
    { title: "Scroll Details", desc: "Heichel, author, and path", icon: "📜", name: "details" },
    { title: "Approval Queue", desc: "Review submitted insights", icon: "✅", name: "approvals" },
    { title: "Saved Sparks", desc: "Your bookmarked verses", icon: "🔖", name: "bookmarks" },
    { title: "Footnotes", desc: "Sources and notes", icon: "✦", name: "footnotes" }
];

function portalButton(event) { return event?.currentTarget || event?.target?.closest?.("button"); }

function setPortalState(button, state, message = "") {
    if (!button) return;
    button.classList.toggle("awtsmoos-portal-opening", state === "opening");
    button.classList.toggle("awtsmoos-portal-failed", state === "failed");
    button.toggleAttribute("aria-busy", state === "opening");
    const desc = button.querySelector(".menu-portal-desc");
    if (message && desc) desc.textContent = message;
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
    setTimeout(() => { if (button) delete button.dataset.tapLock; }, 360);
    setPortalState(button, "opening");
    try {
        const tab = tabRefs?.[name];
        if (tab?.open) await tab.open();
        else if (window.tabManager?.openByName) await window.tabManager.openByName(name);
        else throw new Error("Portal unavailable");
        markActive(button);
        setPortalState(button, "ready");
    } catch (error) {
        console.error(`B"H - Portal ${name} failed to open:`, error);
        setPortalState(button, "failed", "Could not open");
    }
}

function createMenuPortal(portal, tabRefs) {
    return {
        tag: "button",
        attr: { class: "awtsmoos-massive-menu-btn", type: "button", "data-portal": portal.name, "aria-label": `${portal.title}: ${portal.desc}` },
        events: { click: event => openPortal(tabRefs, portal.name, event) },
        children: [
            { tag: "div", attr: { class: "menu-icon-vessel", "aria-hidden": "true" }, text: portal.icon },
            { tag: "div", attr: { class: "menu-text-vessel awtsmoos-student-copy" }, children: [
                { tag: "span", attr: { class: "menu-portal-title" }, text: portal.title },
                { tag: "span", attr: { class: "menu-portal-desc" }, text: portal.desc }
            ] },
            { tag: "div", attr: { class: "menu-arrow", "aria-hidden": "true" }, text: "→" }
        ]
    };
}

export function populateRootMenu(actualTab, post, tabRefs) {
    if (!actualTab) return;
    actualTab.innerHTML = "";
    actualTab.dataset.awtsmoosMenuReady = "true";
    actualTab.appendChild(GenesisEngine.manifest({
        tag: "div",
        attr: { class: "post-root-menu-grid", role: "menu", "aria-label": "Divine Context portals" },
        children: TAB_PORTALS.map(portal => createMenuPortal(portal, tabRefs))
    }));
}