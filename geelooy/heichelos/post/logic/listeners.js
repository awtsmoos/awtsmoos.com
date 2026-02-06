//B"H
/**
 * @file listeners.js
 * @description 
 * B"H - THE GATES OF PERCEPTION.
 * Connects the physical inputs (buttons, keys) to the metaphysical changes (styles, state).
 */
import { updateQueryStringParameter, adjustFontSize } from "../functions/utils.js";
import { performGeometricCheck } from "./visuals/observer.js";

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
        sidebar.classList.remove("hidden-comments");
        if(commBtn) commBtn.classList.add("pushed");
        localStorage.setItem("awtsmoos-sidebar-visible", "true");
    } else {
        sidebar.classList.add("hidden-comments");
        if(commBtn) commBtn.classList.remove("pushed");
        localStorage.setItem("awtsmoos-sidebar-visible", "false");
    }

    // B"H - After the transition, re-center the universe's focus.
    setTimeout(performGeometricCheck, 350);
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
    
    bookmarks.forEach((bm, i) => {
        const li = document.createElement("li");
        li.style.cssText = "padding: 15px; border-bottom: 1px solid var(--color-ink); cursor: pointer; position: relative; background: var(--bg-surface);";
        li.innerHTML = `<div style="font-weight: 900; text-transform: uppercase; font-size: 11px; margin-bottom: 5px;">${bm.title}</div><div style="font-size: 13px; opacity: 0.8; line-height: 1.3;">${bm.textPreview}</div>`;
        
        // Remove Btn
        const del = document.createElement("button");
        del.innerHTML = "×";
        del.className = "bookmark-delete-btn"; // Use CSS class
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

    // B"H - The sidebar begins its journey collapsed, as per the Divine Will.
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    if (sidebarStoredState === "true") {
        toggleSidebar(true);
    } else {
        toggleSidebar(false);
    }

    // 2. FONT SIZE CONTROLS (The "+" and "-" buttons)
    const fontInc = document.getElementById('fontIncreaseBtn');
    const fontDec = document.getElementById('fontDecreaseBtn');
    
    if (fontInc) fontInc.onclick = (e) => { 
        e.preventDefault(); e.stopPropagation(); 
        adjustFontSize('increase'); 
    };
    if (fontDec) fontDec.onclick = (e) => { 
        e.preventDefault(); e.stopPropagation(); 
        adjustFontSize('decrease'); 
    };

    // 3. Global Click Dispatcher
    document.body.addEventListener("click", (e) => {
        
        // --- SIDEBAR TOGGLE (THE "i" SIGNAL) ---
        const commBtn = e.target.closest("#commentaryBtn");
        if (commBtn) {
            e.preventDefault(); e.stopPropagation();
            toggleSidebar();
            return;
        }

        // --- TYPOGRAPHY TOGGLE (THE "A" SIGNAL) ---
        const typeBtn = e.target.closest("#typographyBtn");
        if (typeBtn) {
            e.preventDefault(); e.stopPropagation();
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

    // 4. COLOR ENGINE LISTENERS
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const cssVar = e.target.dataset.cssVar;
            document.querySelector('.post-reader-localized-context').style.setProperty(cssVar, e.target.value);
        });
    });
    
    // 5. RESET RITUAL
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
