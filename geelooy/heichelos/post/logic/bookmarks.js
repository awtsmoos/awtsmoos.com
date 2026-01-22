//B"H
/**
 * @file bookmarks.js
 * @description 
 * B"H - THE MEMORY OF THE SECTIONS.
 * This module manages the saved sparks (bookmarks) that the user anchors 
 * in the text. It manifests the Bookmark Panel in the Sidebar.
 */
import { updateQueryStringParameter } from "../functions/utils.js";

/**
 * renderBookmarksPanel
 * @description B"H - Transforms the saved sparks in LocalStorage into a visual list.
 */
export async function renderBookmarksPanel(tab) {
    if (!tab) return;
    console.log("B\"H - [Bookmarks] Manifesting saved sparks.");
    tab.innerHTML = "";
    
    const bookmarks = JSON.parse(localStorage.getItem("awtsmoos-bookmarks") || "[]");
    
    if (bookmarks.length === 0) {
        tab.innerHTML = `
            <div class="awtsmoos-empty-state" style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px; opacity: 0.3;">🔖</div>
                <div style="font-weight: 800; text-transform: uppercase; color: var(--color-ink-secondary);">No bookmarks saved yet.</div>
                <p style="font-size: 14px; opacity: 0.7;">Click the 'B' sigil next to any verse to anchor it here.</p>
            </div>
        `;
        return;
    }

    const list = document.createElement("ul");
    list.className = "bookmarks-list";
    list.style.cssText = "list-style: none; padding: 0; margin: 0;";
    
    bookmarks.forEach((bm, i) => {
        const li = document.createElement("li");
        li.className = "bookmark-item";
        li.style.cssText = `
            padding: 20px;
            border: 4px solid var(--color-ink);
            margin-bottom: 15px;
            cursor: pointer;
            position: relative;
            background: var(--bg-surface);
            transition: all 0.1s ease;
            box-shadow: 4px 4px 0 var(--color-ink);
        `;
        
        li.innerHTML = `
            <div class="bm-title" style="font-weight: 900; text-transform: uppercase; font-size: 12px; background: var(--color-ink); color: var(--bg-surface); width: fit-content; padding: 2px 8px; margin-bottom: 8px;">
                ${bm.title}
            </div>
            <div class="bm-text" style="font-size: 16px; font-weight: 500; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${bm.textPreview}
            </div>
        `;
        
        // THE REMOVAL SIGIL
        const del = document.createElement("button");
        del.innerHTML = "×";
        del.className = "bookmark-delete-btn";
        del.style.cssText = "position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 24px; font-weight: 900; cursor: pointer; color: var(--color-danger);";
        del.onclick = (e) => {
            e.stopPropagation();
            bookmarks.splice(i, 1);
            localStorage.setItem("awtsmoos-bookmarks", JSON.stringify(bookmarks));
            renderBookmarksPanel(tab);
        };
        li.appendChild(del);

        // NAVIGATION PULSE
        li.onclick = () => {
            console.log(`B"H - [Bookmarks] Navigating to Verse ${bm.idx}`);
            updateQueryStringParameter("idx", bm.idx);
            if(bm.sub) updateQueryStringParameter("sub", bm.sub);
            else updateQueryStringParameter("sub", null);
            
            // Close sidebar on mobile for better landing
            if (window.innerWidth <= 900) {
                const sidebar = document.querySelector(".sidebar");
                sidebar?.classList.add("hidden-comments");
                const btn = document.getElementById("commentaryBtn");
                btn?.classList.remove("pushed");
            }
            
            window.location.reload(); 
        };

        // HOVER EFFECTS
        li.onmouseenter = () => {
            li.style.transform = "translate(-2px, -2px)";
            li.style.boxShadow = "6px 6px 0 var(--color-accent)";
        };
        li.onmouseleave = () => {
            li.style.transform = "none";
            li.style.boxShadow = "4px 4px 0 var(--color-ink)";
        };

        list.appendChild(li);
    });
    tab.appendChild(list);
}