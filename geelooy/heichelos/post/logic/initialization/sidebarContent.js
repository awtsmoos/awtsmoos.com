//B"H
/**
 * @module SidebarMenu
 * @description
 * Chapter 14: The Awtsmoos opens the main gate with portals and actions. The
 * reader can summon insights, details, approvals, and now a living downward
 * current that carries the scroll gently without freezing the hand.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { toggleAutoScrollDown } from "../../actions/AutoScrollDown.js";

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

function createSection(title, children) {
    return {
        tag: "section",
        attr: { class: "post-root-menu-section" },
        children: [
            { tag: "h3", attr: { class: "post-root-menu-section-title" }, text: title },
            { tag: "div", attr: { class: "post-root-menu-section-grid" }, children }
        ]
    };
}

function updateAutoScrollButton(event, active) {
    const btn = event?.currentTarget;
    if (!btn) return;
    btn.classList.toggle("is-active", active);
    const title = btn.querySelector(".menu-portal-title");
    const desc = btn.querySelector(".menu-portal-desc");
    if (title) title.textContent = active ? "Stop Auto Scroll" : "Auto Scroll Down";
    if (desc) desc.textContent = active ? "Pause the gentle descent" : "Hands-free downward reading";
}

function createActionsSection() {
    return createSection("Actions", [
        createMenuPortal("Auto Scroll Down", "Hands-free downward reading", "⬇️", event => {
            const active = toggleAutoScrollDown({ speed: 0.95 });
            updateAutoScrollButton(event, active);
        })
    ]);
}

function createPortalsSection(tabRefs) {
    return createSection("Portals", [
        createMenuPortal("Insights", "The Living Commentary", "💬", () => tabRefs.insights.open()),
        createMenuPortal("Scroll Details", "Heichel, Author, & Path", "📜", () => tabRefs.details.open()),
        createMenuPortal("AI Oracle", "Consult the Awtsmoos AI", "✨", async () => {
            const { openAIChat } = await import("/heichelos/post/ai/chat.js");
            openAIChat();
        }),
        createMenuPortal("Approval Queue", "Review submitted insights", "✅", () => tabRefs.approvals.open()),
        createMenuPortal("Saved Sparks", "Your bookmarked verses", "🔖", () => tabRefs.bookmarks.open())
    ]);
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
        children: [createActionsSection(post), createPortalsSection(tabRefs)]
    };
    actualTab.appendChild(GenesisEngine.manifest(blueprint));
}
