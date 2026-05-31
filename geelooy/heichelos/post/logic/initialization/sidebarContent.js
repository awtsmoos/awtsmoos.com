//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 49: The root menu becomes a real covenant of doors. Each row is a
 * button with state, label, portal key, and failure flare. When the seeker taps
 * Insights, the Awtsmoos does not allow the tap to drown in a dim overlay; the
 * registered chamber opens, the menu yields, and the visible world changes.
 */
import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

const TAB_PORTALS = [
    { title: "Insights", desc: "The Living Commentary", icon: "💬", name: "insights" },
    { title: "Scroll Details", desc: "Heichel, Author, & Path", icon: "📜", name: "details" },
    { title: "AI Oracle", desc: "Consult the Awtsmoos AI", icon: "✨", name: "oracle", type: "oracle" },
    { title: "Approval Queue", desc: "Review submitted insights", icon: "✅", name: "approvals" },
    { title: "Saved Sparks", desc: "Your bookmarked verses", icon: "🔖", name: "bookmarks" }
];

/**
 * Finds the button that invoked a portal ritual.
 * @param {Event} event Original DOM event.
 * @returns {HTMLButtonElement|null} Button source when present.
 */
function getPortalButton(event) {
    return event?.currentTarget || event?.target?.closest?.("button") || null;
}

/**
 * Shows a small visible error in the portal row.
 * @param {Element|null} source Clicked portal.
 * @param {string} message User-facing failure text.
 * @returns {void}
 */
function revealPortalFailure(source, message) {
    if (!source) return;
    source.classList.remove("awtsmoos-portal-opening");
    source.classList.add("awtsmoos-portal-failed");
    source.removeAttribute("aria-busy");
    const desc = source.querySelector(".menu-portal-desc");
    if (desc) desc.textContent = message;
}

/**
 * Marks one portal as the active chosen chamber.
 * @param {Element|null} source Active button.
 * @returns {void}
 */
function markActivePortal(source) {
    const grid = source?.closest?.(".post-root-menu-grid");
    grid?.querySelectorAll?.(".awtsmoos-massive-menu-btn").forEach(button => {
        const active = button === source;
        button.classList.toggle("awtsmoos-portal-active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
    });
}

/**
 * Prevents touch/click duplicate firing on mobile glass.
 * @param {Element|null} portal Source portal.
 * @returns {boolean} True when this event may proceed.
 */
function claimPortalTap(portal) {
    if (!portal) return true;
    if (portal.dataset.tapLock === "true") return false;
    portal.dataset.tapLock = "true";
    setTimeout(() => { delete portal.dataset.tapLock; }, 420);
    return true;
}

/**
 * Creates a consistent event boundary for taps and clicks.
 * @param {Event} event Original event.
 * @returns {HTMLButtonElement|null|false} Source portal, or false if locked.
 */
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

/**
 * Ends the temporary loading state.
 * @param {Element|null} portal Source portal.
 * @returns {void}
 */
function finishPortalOpening(portal) {
    portal?.classList.remove("awtsmoos-portal-opening");
    portal?.removeAttribute("aria-busy");
}

/**
 * Opens a TabManager chamber by registry key.
 * @param {object} tabRefs Registered tab references.
 * @param {string} name Tab key.
 * @param {Event} event Original event.
 * @returns {Promise<void>} Opens or visibly fails.
 */
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

/**
 * Opens the AI chat vessel as a lazy module.
 * @param {Event} event Original event.
 * @returns {Promise<void>} Resolves after invoking the oracle.
 */
async function openOraclePortal(event) {
    const portal = beginPortalOpening(event);
    if (portal === false) return;
    try {
        const { openAIChat } = await import("/heichelos/post/ai/chat.js");
        openAIChat();
        markActivePortal(portal);
    } catch (error) {
        console.error("B\"H - AI Oracle portal failed:", error);
        revealPortalFailure(portal, error?.message || "Oracle unavailable");
    } finally {
        finishPortalOpening(portal);
    }
}

/**
 * Builds one root menu portal from a pure data blueprint.
 * @param {object} portal Portal data.
 * @param {object} tabRefs Registered tab references.
 * @returns {object} GenesisEngine blueprint.
 */
function createMenuPortal(portal, tabRefs) {
    const onClick = portal.type === "oracle"
        ? openOraclePortal
        : event => openRegisteredPortal(tabRefs, portal.name, event);
    return {
        tag: "button",
        attr: {
            class: "awtsmoos-massive-menu-btn",
            type: "button",
            "data-portal": portal.name,
            "aria-label": `${portal.title}: ${portal.desc}`
        },
        events: { click: onClick, pointerup: onClick },
        children: [
            { tag: "div", attr: { class: "menu-icon-vessel", "aria-hidden": "true" }, text: portal.icon },
            { tag: "div", attr: { class: "menu-text-vessel" }, children: [
                { tag: "span", attr: { class: "menu-portal-title" }, text: portal.title },
                { tag: "span", attr: { class: "menu-portal-desc" }, text: portal.desc }
            ] },
            { tag: "div", attr: { class: "menu-arrow", "aria-hidden": "true" }, text: "→" }
        ]
    };
}

/**
 * Populates the sidebar root menu.
 * @param {Element} actualTab Sidebar tab body.
 * @param {object} post Current post.
 * @param {object} tabRefs Registered tabs.
 * @returns {void}
 */
export function populateRootMenu(actualTab, post, tabRefs) {
    if (!actualTab) return;
    actualTab.innerHTML = "";
    actualTab.appendChild(GenesisEngine.manifest({
        tag: "div",
        attr: { class: "post-root-menu-grid", role: "menu", "aria-label": "Divine Context portals" },
        children: TAB_PORTALS.map(portal => createMenuPortal(portal, tabRefs))
    }));
}
