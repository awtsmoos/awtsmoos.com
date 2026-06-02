
//B"H
/**
 * @file bookmarks.js
 * @description 
 * B"H - THE MEMORY OF THE SECTIONS.
 * This module manages the saved sparks (bookmarks).
 * Purged of `innerHTML` strings. Now utilizes the GenesisEngine.
 */
import { updateQueryStringParameter } from "../functions/utils.js";
import { GenesisEngine } from "../functions/dom/GenesisEngine.js";

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
        const emptyPlan = {
            tag: 'div',
            attr: { class: 'awtsmoos-empty-state awtsmoos-empty-placeholder', style: 'padding: 40px 20px; text-align: center;' },
            children:[
                { tag: 'div', attr: { style: 'font-size: 40px; margin-bottom: 20px; opacity: 0.3;' }, text: '🔖' },
                { tag: 'div', attr: { style: 'font-weight: 900; text-transform: uppercase; color: var(--color-ink-secondary);' }, text: 'No bookmarks saved yet.' },
                { tag: 'p', attr: { style: 'font-size: 14px; opacity: 0.7; margin-top: 10px;' }, text: 'Click the \'B\' sigil next to any verse to anchor it here.' }
            ]
        };
        tab.appendChild(GenesisEngine.manifest(emptyPlan));
        return;
    }

    const listPlan = {
        tag: 'ul',
        attr: { class: 'bookmarks-list' },
        children: bookmarks.map((bm, i) => {
            return {
                tag: 'li',
                attr: { class: 'bookmark-item awtsmoos-list-item' },
                events: {
                    click: () => {
                        console.log(`B"H - [Bookmarks] Navigating to Verse ${bm.idx}`);
                        updateQueryStringParameter("idx", bm.idx);
                        if(bm.sub) updateQueryStringParameter("sub", bm.sub);
                        else updateQueryStringParameter("sub", null);
                        
                        if (window.innerWidth <= 900) {
                            const sidebar = document.querySelector(".sidebar");
                            sidebar?.classList.add("hidden-comments");
                            const btn = document.getElementById("commentaryBtn");
                            btn?.classList.remove("pushed");
                        }
                        window.location.reload(); 
                    }
                },
                children:[
                    {
                        tag: 'div',
                        attr: { class: 'bm-title awtsmoos-student-name', style: 'font-weight: 900; text-transform: uppercase; font-size: 11px; margin-bottom: 5px;' },
                        text: bm.title
                    },
                    {
                        tag: 'div',
                        attr: { class: 'bm-text awtsmoos-student-location', style: 'font-size: 13px; opacity: 0.8; line-height: 1.3;' },
                        text: bm.textPreview
                    },
                    {
                        tag: 'button',
                        attr: { class: 'bookmark-delete-btn' },
                        text: '×',
                        events: {
                            click: (e) => {
                                e.stopPropagation();
                                bookmarks.splice(i, 1);
                                localStorage.setItem("awtsmoos-bookmarks", JSON.stringify(bookmarks));
                                renderBookmarksPanel(tab);
                            }
                        }
                    }
                ]
            };
        })
    };

    tab.appendChild(GenesisEngine.manifest(listPlan));
}
