//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 181: The root menu becomes quieter and more human.
 * The AI oracle door is hidden for now. The living commentary receives the
 * first breath, and the details chamber remains concise and safe.
 */
import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

const TAB_PORTALS = [
    { title: "Insights", desc: "Write and read living commentary", icon: "💬", name: "insights" },
    { title: "Scroll Details", desc: "Heichel, author, and path", icon: "📜", name: "details" },
    { title: "Approval Queue", desc: "Review submitted insights", icon: "✅", name: "approvals" },
    { title: "Saved Sparks", desc: "Your bookmarked verses", icon: "🔖", name: "bookmarks" }
];

function getPortalButton(event) { return event?.currentTarget || event?.target?.closest?.("button") || null; }

function revealPortalFailure(source, message) {
    if (!source) return;
    source.classList.remove("awtsmoos-portal-opening");
    source.classList.add("awtsmoos-portal-failed");
    source.removeAttribute("aria-busy");
    const desc = source.querySelector(".menu-portal-desc");
    if (desc) desc.textContent = message;
}

function markActivePortal(source) {
    const grid = source?.closest?.(".post-root-menu-grid");
    grid?.querySelectorAll?.(".awtsmoos-massive-menu-btn").forEach(button => {
        const active = button === source;
        button.classList.toggle("awtsmoos-portal-active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
    });
}

function claimPortalTap(portal) {
    if (!portal) return true;
    if (portal.dataset.tapLock === "true") return false;
    portal.dataset.tapLock = "true";
    setTimeout(() => { delete portal.dataset.tapLock; }, 420);
    return true;
}

function beginPortalOpening(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const portal = getPortalButton(event);
    if (!claimPortalTap(portal)) return false;
    portal?.classList.remove("awtsmoos-portal-failed");
    portal?.classList.add("awtsmoos-portal-opening");
    portal?.setAttribute("aria-busy", "true");
    return portal;
}

function finishPortalOpening(portal) {
    portal?.classList.remove("awtsmoos-portal-opening");
    portal?.removeAttribute("aria-busy");
}

async function openRegisteredPortal(tabRefs, name, event) {
    const portal = beginPortalOpening(event);
    if (portal === false) return;
    try {
        const tab = tabRefs?.[name];
        if (tab?.open) await tab.open();
        else if (window.tabManager?.openByName) await window.tabManager.openByName(name);
        else throw new Error("Portal unavailable");
        markActivePortal(portal);
    } catch (error) {
        console.error(`B"H - Portal ${name} failed to open:`, error);
        revealPortalFailure(portal, error?.message || "Could not open");
    } finally {
        finishPortalOpening(portal);
    }
}

function createMenuPortal(portal, tabRefs) {
    const onClick = event => openRegisteredPortal(tabRefs, portal.name, event);
    return {
        tag: "button",
        attr: { class: "awtsmoos-massive-menu-btn", type: "button", "data-portal": portal.name, "aria-label": `${portal.title}: ${portal.desc}` },
        events: { click: onClick, pointerup: onClick },
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
    actualTab.appendChild(GenesisEngine.manifest({
        tag: "div",
        attr: { class: "post-root-menu-grid", role: "menu", "aria-label": "Divine Context portals" },
        children: TAB_PORTALS.map(portal => createMenuPortal(portal, tabRefs))
    }));
}
