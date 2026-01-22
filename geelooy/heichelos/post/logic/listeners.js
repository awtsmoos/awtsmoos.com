//B"H
/**
 * @file listeners.js
 * @description 
 * B"H - THE GATES OF PERCEPTION.
 * This module governs the sensory input of the Scribe's interface. 
 * It ensures the "i" and "A" keys function as physical latches, manifesting
 * the Sidebar and Typography panels. Crucially, it commits the state of the 
 * gates to the 'Memory of the Vessel' (LocalStorage), allowing the seeker's 
 * perspective to persist through the constant recreation of the page.
 */
import { updateQueryStringParameter } from "../functions/utils.js";

/**
 * toggleSidebar
 * @description B"H - Commands the Sidebar to emerge or retreat. 
 * Persists the intention of the seeker to the vessel's memory.
 * @param {boolean|null} forceState - If true, ensures sidebar is visible.
 */
export function toggleSidebar(forceState = null) {
    const sidebar = document.querySelector(".sidebar");
    const commBtn = document.getElementById("commentaryBtn");
    if (!sidebar) return;

    const currentlyHidden = sidebar.classList.contains("hidden-comments");
    
    // Determine the next state based on force or current toggle
    const shouldShow = forceState !== null ? forceState : currentlyHidden;

    if (shouldShow) {
        console.log("B\"H - [Listeners] Expanding the Sidebar Gate.");
        sidebar.classList.remove("hidden-comments");
        if(commBtn) commBtn.classList.add("pushed");
        localStorage.setItem("awtsmoos-sidebar-visible", "true");
    } else {
        console.log("B\"H - [Listeners] Collapsing the Sidebar Gate.");
        sidebar.classList.add("hidden-comments");
        if(commBtn) commBtn.classList.remove("pushed");
        localStorage.setItem("awtsmoos-sidebar-visible", "false");
    }
}

/**
 * renderBookmarksPanel
 * @description B"H - Manifests the saved bookmarks in the sidebar.
 */
export async function renderBookmarksPanel(tab) {
    if (!tab) return;
    tab.innerHTML = "";
    const bookmarks = JSON.parse(localStorage.getItem("awtsmoos-bookmarks") || "[]");
    
    if (bookmarks.length === 0) {
        tab.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-ink-secondary); font-weight: 800; text-transform: uppercase;">No bookmarks saved yet.<br>Click 'B' next to any verse.</div>`;
        return;
    }

    const list = document.createElement("ul");
    list.className = "bookmarks-list";
    list.style.listStyle = "none";
    list.style.padding = "0";
    
    bookmarks.forEach((bm, i) => {
        const li = document.createElement("li");
        li.style.cssText = "padding: 15px; border-bottom: 2px solid var(--color-ink); cursor: pointer; position: relative;";
        li.innerHTML = `<div style="font-weight: 900; text-transform: uppercase; font-size: 12px; margin-bottom: 5px;">${bm.title}</div><div style="font-size: 14px; opacity: 0.8;">${bm.textPreview}</div>`;
        
        // Remove Btn
        const del = document.createElement("button");
        del.innerHTML = "×";
        del.style.cssText = "position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; font-weight: 900; cursor: pointer; color: var(--color-danger);";
        del.onclick = (e) => {
            e.stopPropagation();
            bookmarks.splice(i, 1);
            localStorage.setItem("awtsmoos-bookmarks", JSON.stringify(bookmarks));
            renderBookmarksPanel(tab);
        };
        li.appendChild(del);

        li.onclick = () => {
            updateQueryStringParameter("idx", bm.idx);
            if(bm.sub) updateQueryStringParameter("sub", bm.sub);
            else updateQueryStringParameter("sub", null);
            window.location.reload(); 
        };
        list.appendChild(li);
    });
    tab.appendChild(list);
}

/**
 * setupUIListeners
 * @description B"H - Binds the central event loop to the user's intent.
 */
export function setupUIListeners() {
    console.log("B\"H - [Listeners] Establishing Conduits of Interaction.");

    // 1. Restore Sidebar State from Memory
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    if (sidebarStoredState === "true") {
        toggleSidebar(true);
    } else {
        toggleSidebar(false);
    }

    // 2. Global Click Dispatcher
    document.body.addEventListener("click", (e) => {
        
        // --- SIDEBAR TOGGLE (THE "i" SIGNAL) ---
        const commBtn = e.target.closest("#commentaryBtn");
        if (commBtn) {
            e.preventDefault(); e.stopPropagation();
            console.log("B\"H - [Listeners] 'i' button clicked.");
            toggleSidebar();
            return;
        }

        // --- TYPOGRAPHY TOGGLE (THE "A" SIGNAL) ---
        const typeBtn = e.target.closest("#typographyBtn");
        if (typeBtn) {
            e.preventDefault(); e.stopPropagation();
            console.log("B\"H - [Listeners] 'A' button clicked.");
            const panel = document.getElementById("typographyDetails");
            if (panel) {
                const wasHidden = panel.classList.contains("hidden-details");
                if (wasHidden) {
                    panel.classList.remove("hidden-details");
                    typeBtn.classList.add("pushed");
                } else {
                    panel.classList.add("hidden-details");
                    typeBtn.classList.remove("pushed");
                }
            }
            return;
        }

        // --- POPOVER DISMISSAL ---
        if (!e.target.closest('.selection-popover')) {
            const pop = document.getElementById('selection-popover');
            if(pop && pop.classList.contains('visible')) {
                pop.classList.remove('visible');
            }
        }
        
        // --- SETTINGS DISMISSAL ---
        if (!e.target.closest('#typographyDetails') && !e.target.closest('#typographyBtn')) {
            const panel = document.getElementById("typographyDetails");
            const btn = document.getElementById("typographyBtn");
            if(panel && !panel.classList.contains('hidden-details')) {
                panel.classList.add('hidden-details');
                if(btn) btn.classList.remove('pushed');
            }
        }
    });

    // 3. COLOR ENGINE LISTENERS
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const cssVar = e.target.dataset.cssVar;
            console.log(`B"H - [Listeners] Tincture Shift: ${cssVar} to ${e.target.value}`);
            document.querySelector('.post-reader-localized-context').style.setProperty(cssVar, e.target.value);
        });
    });
    
    // 4. RESET RITUAL
    const resetBtn = document.getElementById("resetDefaultsBtn");
    if(resetBtn) {
        resetBtn.addEventListener("click", () => {
            if(confirm("B\"H - Restore factory appearance settings? This will clear your custom alchemy.")) {
                localStorage.removeItem("awtsmoos-theme");
                localStorage.removeItem("awtsmoos-font");
                localStorage.removeItem("currentPostFontSize");
                localStorage.removeItem("awtsmoos-custom-themes");
                localStorage.removeItem("awtsmoos-sidebar-visible");
                localStorage.removeItem("awtsmoos-active-tab");
                window.location.reload();
            }
        });
    }
}