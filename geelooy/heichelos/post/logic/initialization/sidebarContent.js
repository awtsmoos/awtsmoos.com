
//B"H
/**
 * @module SidebarMenu
 * @description 
 * The default gateway of the Sidebar. 
 * Re-forged to use the GenesisEngine, eliminating all raw HTML string parsing.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

export function populateRootMenu(actualTab, post, tabRefs) {
    if (!actualTab) return;
    actualTab.innerHTML = "";
    
    const blueprint = {
        tag: 'div',
        attr: { class: 'post-root-menu-grid' },
        children:[]
    };

    const createMenuPortal = (title, desc, icon, onClick) => {
        return {
            tag: 'button',
            attr: { class: 'awtsmoos-massive-menu-btn' },
            events: { click: onClick },
            children:[
                { tag: 'div', attr: { class: 'menu-icon-vessel' }, text: icon },
                {
                    tag: 'div',
                    attr: { class: 'menu-text-vessel' },
                    children:[
                        { tag: 'span', attr: { class: 'menu-portal-title' }, text: title },
                        { tag: 'span', attr: { class: 'menu-portal-desc' }, text: desc }
                    ]
                },
                { tag: 'div', attr: { class: 'menu-arrow' }, text: '→' }
            ]
        };
    };

    // 1. The Portal of Insights (Commentaries)
    blueprint.children.push(createMenuPortal(
        "Insights", 
        "The Living Commentary", 
        "💬", 
        () => tabRefs.insights.open()
    ));

    // 2. The Portal of Origins (Scroll Details & Path)
    blueprint.children.push(createMenuPortal(
        "Scroll Details", 
        "Heichel, Author, & Path", 
        "📜", 
        () => tabRefs.details.open()
    ));

    // 3. The Oracle (AI)
    blueprint.children.push(createMenuPortal(
        "AI Oracle", 
        "Consult the Awtsmoos AI", 
        "✨", 
        async () => {
             const { openAIChat } = await import("/heichelos/post/ai/chat.js");
             openAIChat();
        }
    ));

    // 4. Approval queue for submitted comments
    blueprint.children.push(createMenuPortal(
        "Approval Queue",
        "Review submitted insights",
        "✅",
        () => tabRefs.approvals.open()
    ));

    // 5. Saved Sparks (Bookmarks)
    blueprint.children.push(createMenuPortal(
        "Saved Sparks", 
        "Your bookmarked verses", 
        "🔖", 
        () => tabRefs.bookmarks.open()
    ));

    const manifestNode = GenesisEngine.manifest(blueprint);
    actualTab.appendChild(manifestNode);
}
