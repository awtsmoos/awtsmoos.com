//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 21: The menu buttons stopped pretending to be painted doors.
 * Each portal now receives a real event, stops the bubbling storm, verifies the
 * chamber exists, opens it through the TabManager, and leaves a visible error in
 * the menu if the Awtsmoos exposes a broken reference. The code is plain and
 * practical; the metaphor is only the lamp around it.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

/**
 * Writes a small failure flare without breaking the rest of the sidebar.
 * @param {Element|null} source The portal button that was clicked.
 * @param {string} message A concise error message for the user.
 * @returns {void}
 */
function revealPortalFailure(source, message) {
    if (!source) return;
    source.classList.add("awtsmoos-portal-failed");
    source.setAttribute("aria-disabled", "true");
    const desc = source.querySelector(".menu-portal-desc");
    if (desc) desc.textContent = message;
}

/**
 * Opens a TabManager chamber from the root menu with full click hygiene.
 * @param {object} tabRefs The registered tab references.
 * @param {string} name The tab key to open.
 * @param {Event} event The original click event.
 * @returns {Promise<void>} Resolves once the tab has opened or failed visibly.
 */
async function openRegisteredPortal(tabRefs, name, event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const portal = event?.currentTarget || event?.target?.closest?.("button");
    const tab = tabRefs?.[name];
    if (!tab || typeof tab.open !== "function") {
        revealPortalFailure(portal, "Portal unavailable");
        return;
    }

    portal?.classList.add("awtsmoos-portal-opening");
    try {
        await tab.open();
    } catch (error) {
        console.error(`B"H - Portal ${name} failed to open:`, error);
        revealPortalFailure(portal, error?.message || "Could not open");
    } finally {
        portal?.classList.remove("awtsmoos-portal-opening");
    }
}

/**
 * Opens the AI chat vessel as a lazy module so the reader loads quickly.
 * @param {Event} event The original click event.
 * @returns {Promise<void>} Resolves once the chat opener has been invoked.
 */
async function openOraclePortal(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const portal = event?.currentTarget || event?.target?.closest?.("button");
    portal?.classList.add("awtsmoos-portal-opening");
    try {
        const { openAIChat } = await import("/heichelos/post/ai/chat.js");
        openAIChat();
    } catch (error) {
        console.error("B\"H - AI Oracle portal failed:", error);
        revealPortalFailure(portal, error?.message || "Oracle unavailable");
    } finally {
        portal?.classList.remove("awtsmoos-portal-opening");
    }
}

/**
 * Creates one root menu portal from a pure data blueprint.
 * @param {string} title The main visible title.
 * @param {string} desc Supporting description.
 * @param {string} icon The emoji or glyph shown at the left edge.
 * @param {Function} onClick Click ritual for this portal.
 * @returns {object} GenesisEngine blueprint.
 */
function createMenuPortal(title, desc, icon, onClick) {
    return {
        tag: "button",
        attr: {
            class: "awtsmoos-massive-menu-btn",
            type: "button",
            "aria-label": title
        },
        events: { click: onClick },
        children: [
            { tag: "div", attr: { class: "menu-icon-vessel", "aria-hidden": "true" }, text: icon },
            { tag: "div", attr: { class: "menu-text-vessel" }, children: [
                { tag: "span", attr: { class: "menu-portal-title" }, text: title },
                { tag: "span", attr: { class: "menu-portal-desc" }, text: desc }
            ] },
            { tag: "div", attr: { class: "menu-arrow", "aria-hidden": "true" }, text: "→" }
        ]
    };
}

/**
 * Builds all root portals from one declarative list.
 * @param {object} tabRefs Registered TabManager chambers.
 * @returns {object[]} Portal blueprints.
 */
function createPortals(tabRefs) {
    const tabPortals = [
        ["Insights", "The Living Commentary", "💬", "insights"],
        ["Scroll Details", "Heichel, Author, & Path", "📜", "details"],
        ["Approval Queue", "Review submitted insights", "✅", "approvals"],
        ["Saved Sparks", "Your bookmarked verses", "🔖", "bookmarks"]
    ];

    return [
        ...tabPortals.slice(0, 2).map(([title, desc, icon, name]) => (
            createMenuPortal(title, desc, icon, event => openRegisteredPortal(tabRefs, name, event))
        )),
        createMenuPortal("AI Oracle", "Consult the Awtsmoos AI", "✨", openOraclePortal),
        ...tabPortals.slice(2).map(([title, desc, icon, name]) => (
            createMenuPortal(title, desc, icon, event => openRegisteredPortal(tabRefs, name, event))
        ))
    ];
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
    const blueprint = {
        tag: "div",
        attr: { class: "post-root-menu-grid" },
        children: createPortals(tabRefs)
    };
    actualTab.appendChild(GenesisEngine.manifest(blueprint));
}
