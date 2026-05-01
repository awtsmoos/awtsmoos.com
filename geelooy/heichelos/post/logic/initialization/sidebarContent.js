
//B"H
/**
 * @module SidebarMenu
 * @description 
 * The default gateway of the Sidebar. 
 * "By default sidebar should just have two main entry points: breadcrumb details, and comments."
 * Manifested as massive, intense Neo-Brutalist portals.
 */

export function populateRootMenu(actualTab, post, tabRefs) {
    if (!actualTab) return;
    actualTab.innerHTML = "";
    
    const menuGrid = document.createElement("div");
    menuGrid.className = "post-root-menu-grid";

    const createMenuPortal = (title, desc, icon, onClick) => {
        const btn = document.createElement("button");
        btn.className = "awtsmoos-massive-menu-btn";
        btn.innerHTML = `
            <div class="menu-icon-vessel">${icon}</div>
            <div class="menu-text-vessel">
                <span class="menu-portal-title">${title}</span>
                <span class="menu-portal-desc">${desc}</span>
            </div>
            <div class="menu-arrow">→</div>
        `;
        btn.onclick = onClick;
        return btn;
    };

    // 1. The Portal of Insights (Commentaries)
    menuGrid.appendChild(createMenuPortal(
        "Insights", 
        "The Living Commentary", 
        "💬", 
        () => tabRefs.insights.open()
    ));

    // 2. The Portal of Origins (Scroll Details & Path)
    menuGrid.appendChild(createMenuPortal(
        "Scroll Details", 
        "Heichel, Author, & Path", 
        "📜", 
        () => tabRefs.details.open()
    ));

    // 3. The Oracle (AI)
    menuGrid.appendChild(createMenuPortal(
        "AI Oracle", 
        "Consult the Awtsmoos AI", 
        "✨", 
        async () => {
             const { openAIChat } = await import("/heichelos/post/ai/chat.js");
             openAIChat();
        }
    ));

    // 4. Saved Sparks (Bookmarks)
    menuGrid.appendChild(createMenuPortal(
        "Saved Sparks", 
        "Your bookmarked verses", 
        "🔖", 
        () => tabRefs.bookmarks.open()
    ));

    actualTab.appendChild(menuGrid);
}
