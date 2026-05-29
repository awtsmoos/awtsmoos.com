//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 20: The root menu returns to portals only. Auto-scroll has been lifted
 * out of this chamber into a global floating control, so the sidebar no longer
 * hides the reader's movement ritual behind a menu.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

function createMenuPortal(title, desc, icon, onClick) {
    return {
        tag: "button",
        attr: { class: "awtsmoos-massive-menu-btn", type: "button" },
        events: { click: onClick },
        children: [
            { tag: "div", attr: { class: "menu-icon-vessel" }, text: icon },
            { tag: "div", attr: { class: "menu-text-vessel" }, children: [
                { tag: "span", attr: { class: "menu-portal-title" }, text: title },
                { tag: "span", attr: { class: "menu-portal-desc" }, text: desc }
            ] },
            { tag: "div", attr: { class: "menu-arrow" }, text: "→" }
        ]
    };
}

function createPortals(tabRefs) {
    return [
        createMenuPortal("Insights", "The Living Commentary", "💬", () => tabRefs.insights.open()),
        createMenuPortal("Scroll Details", "Heichel, Author, & Path", "📜", () => tabRefs.details.open()),
        createMenuPortal("AI Oracle", "Consult the Awtsmoos AI", "✨", async () => {
            const { openAIChat } = await import("/heichelos/post/ai/chat.js");
            openAIChat();
        }),
        createMenuPortal("Approval Queue", "Review submitted insights", "✅", () => tabRefs.approvals.open()),
        createMenuPortal("Saved Sparks", "Your bookmarked verses", "🔖", () => tabRefs.bookmarks.open())
    ];
}

/**
 * Populates the sidebar root menu.
 * @param {Element} actualTab Sidebar tab body.
 * @param {object} post Current post.
 * @param {object} tabRefs Registered tabs.
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
