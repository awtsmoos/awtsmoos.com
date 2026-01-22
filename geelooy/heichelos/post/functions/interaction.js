// B"H
/**
 * @file interaction.js
 * @description 
 * Logic for the Watchers. This module handles Highlighting, Scrolling, 
 * and Footnotes. It is the bridge between the physical UI and the state of truth.
 * 
 * NO LOGIC REMOVED. DUAL HIGHLIGHTER RESTORED.
 */

import Highlighter from "/api/nav/highlighter.js";
import { makeToast } from "./ui.js";
import { updateQueryStringParameter } from "./utils.js";

/**
 * Initiates the dual-level highlighting engine.
 * @method startHighlighting
 */
export function startHighlighting(elId, targetClass, callback, desCallback) {
    console.log("B\"H - [Interaction] startHighlighting: Engaging High-Intensity Watchers.");
    const containerSelector = "#" + elId;
    
    // Watcher Level 1: THE VERSES (.section)
    const verseChai = new Highlighter(
        containerSelector,
        "." + targetClass,
        (h) => { 
            console.log(`B"H - [Interaction] Verse Highlighted: ${h.dataset.awtsmoosIdx || h.dataset.idx}`);
            if (typeof callback === 'function') callback({ main: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                console.log("B\"H - [Interaction] Verse Deselected.");
                if (typeof desCallback === 'function') desCallback();
            }
        }
    );

    // Watcher Level 2: THE PARAGRAPHS (.sub-awtsmoos)
    const subChai = new Highlighter(
        containerSelector,
        "." + targetClass + " .sub-awtsmoos",
        (h) => { 
            console.log(`B"H - [Interaction] Sub-section Highlighted: ${h.dataset.awtsmoosSub || h.dataset.idx}`);
            if (typeof callback === 'function') callback({ sub: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                console.log("B\"H - [Interaction] Sub-section Deselected.");
                // Update URL to remove paragraph focus
                updateQueryStringParameter("sub", null);
                window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { sub: null } }));
            }
        }
    );

    window.chai = verseChai;
    window.subChai = subChai;
}

/**
 * Scrolls to the coordinates defined in the URL.
 */
export function scrollToActiveEl() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    const sub = params.get("sub");

    if (idx === null) return;
    
    console.log(`B"H - [Interaction] scrollToActiveEl: Targetting Verse ${idx}, Sub ${sub}`);
    
    const tryScroll = () => {
        // Try both modern and legacy dataset keys
        const section = document.querySelector(`.section[data-awtsmoos-idx="${idx}"], .section[data-idx="${idx}"]`);
        if (section) {
            let target = section;
            if (sub !== null && sub !== "null") {
                const paragraph = section.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${sub}"], .sub-awtsmoos[data-idx="${sub}"]`);
                if (paragraph) target = paragraph;
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; 
        }
        // Retry logic if the Scribe is still manifest the content
        setTimeout(tryScroll, 100);
    };
    tryScroll();
}

/**
 * @method weaveDropdownFromAwtsmoos
 * @description Manifests a dropdown portal from the Verse Number.
 */
export async function weaveDropdownFromAwtsmoos(element, actions) {
    let menu = element.querySelector('.ohr-ein-sof-dropdown');
    if (menu) { 
        menu.classList.toggle('ohr-ein-sof-revealed'); 
        return; 
    }
    
    menu = document.createElement('div');
    menu.classList.add('ohr-ein-sof-dropdown');
    element.appendChild(menu);
    
    Object.keys(actions).forEach(k => {
        const item = document.createElement("div");
        item.classList.add('atzilus-menu-item');
        item.textContent = k;
        item.onclick = async (e) => {
            e.stopPropagation();
            await actions[k](e);
            menu.classList.remove('ohr-ein-sof-revealed');
        };
        menu.appendChild(item);
    });
    
    requestAnimationFrame(() => menu.classList.add('ohr-ein-sof-revealed'));
}

/**
 * Footnote Logic - Unified with Sidebar
 */
export function initializeFootnotes() {
    const footnotesMeta = window.post?.dayuh?.footnotes || window.post?.dayuh?.meta?.footnotes;
    if (!footnotesMeta || !Array.isArray(footnotesMeta)) return;

    document.querySelectorAll('#realPost sup, .footnote-ref').forEach(ref => {
        ref.style.cursor = "pointer";
        let id = ref.innerText.replace(/[\[\]]/g, '').trim();
        if(!id) return;

        ref.dataset.footnoteId = id;
        ref.onclick = async (e) => {
            e.preventDefault(); e.stopPropagation();
            
            const matching = footnotesMeta.find(f => String(f.id) === String(id));
            if (!matching) return console.warn(`Footnote ${id} not found.`);

            if (window.openFootnotesPanel) {
                await window.openFootnotesPanel();
                setTimeout(() => {
                    const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${CSS.escape(id)}"]`);
                    if (item) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        item.classList.add('active');
                        setTimeout(() => item.classList.remove('active'), 2000);
                    }
                }, 450);
            } else {
                createFootnoteOverlay(matching.content || matching.paragraphs?.join("<br>"));
            }
        };
    });
}

/**
 * Conjures a modal for Footnote viewing when sidebar is closed.
 */
export function createFootnoteOverlay(content) {
    const existing = document.getElementById('footnote-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'footnote-overlay';
    
    const contentBox = document.createElement('div');
    contentBox.className = "awtsmoosFootnote";
    contentBox.innerHTML = content;

    overlay.onclick = () => overlay.remove();
    contentBox.onclick = (e) => e.stopPropagation();

    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);
}