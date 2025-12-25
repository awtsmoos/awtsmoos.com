
// B"H
import Highlighter from "/api/nav/highlighter.js";
import { makeToast } from "./ui.js";
import { updateQueryStringParameter } from "./utils.js";

/**
 * Initiates the unified highlighting engine.
 * @method startHighlighting
 */
export function startHighlighting(elId, { onSection, onParagraph } = {}) {
    const containerSelector = "#" + elId;
    
    // 1. Section Highlighter
    const verseChai = new Highlighter(
        containerSelector,
        ".section",
        (h) => {
            if (typeof onSection === 'function') onSection(h);
        }
    );

    // 2. Paragraph Highlighter
    const subChai = new Highlighter(
        containerSelector,
        ".sub-awtsmoos",
        (h) => {
            if (typeof onParagraph === 'function') onParagraph(h);
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                // B"H - Only clear 'sub', preserve other params if they exist
                updateQueryStringParameter("sub", null);
                window.dispatchEvent(new CustomEvent("awtsmoos index", {
                    detail: { sub: null }
                }));
            }
        }
    );

    window.chai = verseChai;
    window.subChai = subChai;
}

/**
 * Scrolls to the coordinate defined in the URL with retry logic.
 * Also handles deep linking to comments/messages.
 * @method scrollToActiveEl
 */
export function scrollToActiveEl() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    const sub = params.get("sub");
    // const cid = params.get("cid"); // Handled by inline.js

    if (idx === null) return;

    let attempts = 0;
    const maxAttempts = 50; 
    
    const tryScroll = () => {
        const section = document.querySelector(`.section[data-awtsmoos-idx="${idx}"]`);
        
        if (section) {
            let target = section;
            if (sub !== null) {
                const paragraph = section.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${sub}"]`);
                if (paragraph) {
                    target = paragraph;
                }
            }
            
            // Found it! Scroll and highlight.
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Flash
            target.style.transition = "background-color 0.5s";
            const originalBg = target.style.backgroundColor;
            target.style.backgroundColor = "rgba(255, 214, 0, 0.2)";
            setTimeout(() => {
                target.style.backgroundColor = originalBg;
            }, 1000);
            
            return; 
        }

        attempts++;
        if (attempts < maxAttempts) {
            requestAnimationFrame(() => setTimeout(tryScroll, 100));
        }
    };

    setTimeout(tryScroll, 100);
}

/**
 * Footnote Logic & Interactions
 */
export function initializeFootnotes() {
    // B"H - Attach click listeners to all sup tags that look like footnotes
    document.querySelectorAll('sup, .footnote-ref').forEach(ref => {
        ref.style.cursor = "pointer";
        
        // B"H - Robust ID Extraction
        // 1. Remove brackets [ ] 
        // 2. Trim whitespace
        let id = ref.innerText.replace(/[\[\]]/g, '').trim();
        
        // If empty (e.g. just brackets), fallback to original text or skip
        if(!id) id = ref.innerText.trim();
        if(!id) return;

        // Assign data attribute for reverse-lookup
        ref.dataset.footnoteId = id;
        ref.classList.add('active-footnote-ref');

        ref.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            let content = ref.dataset.content;
            
            if(!content) {
                const footnotes = window.post?.dayuh?.footnotes;
                if(footnotes && Array.isArray(footnotes)) {
                    // Loose matching to handle string/number differences
                    const note = footnotes.find(f => String(f.id) === String(id));
                    if(note) content = note.content;
                }
            }

            if (content) createFootnoteOverlay(content);
            else console.warn("Footnote content not found for ID:", id);
        };
    });
}

/**
 * B"H - Highlights footnotes in the sidebar based on the current text view.
 * @param {HTMLElement} containerElement - The section or paragraph currently in view.
 */
export function syncFootnotesInSidebar(containerElement) {
    if (!containerElement) return;

    const refs = containerElement.querySelectorAll('[data-footnote-id]');
    const activeIds = Array.from(refs).map(el => el.dataset.footnoteId);

    const sidebarList = document.querySelector('.footnotes-list');
    if (!sidebarList) return; 

    // Clear previous active states
    const previouslyActive = sidebarList.querySelectorAll('.footnote-item.active');
    previouslyActive.forEach(el => el.classList.remove('active'));

    if (activeIds.length === 0) return;

    let firstActive = null;
    const activeIdSet = new Set(activeIds);

    Array.from(sidebarList.children).forEach(item => {
        const itemId = item.dataset.footnoteId;
        // Check if ID is in the set of active IDs found in the text
        if(activeIdSet.has(itemId)) {
             item.classList.add('active');
             if (!firstActive) firstActive = item;
        }
    });

    if (firstActive) {
        firstActive.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

const atzilusActions = {
    Share() {
        const link = window.location.href;
        if (navigator.share) navigator.share({ title: 'Awtsmoos Revelation', url: link }).catch(console.error);
        else navigator.clipboard.writeText(link).then(() => makeToast('Link copied! B"H')).catch(console.error);
    },
    async Comment() {
        if(window?.openPanelToComments) await window.openPanelToComments();
    }
};

export async function weaveDropdownFromAwtsmoos(element, actions = atzilusActions) {
    let menu = element.querySelector('.ohr-ein-sof-dropdown');
    if (menu) { menu.classList.toggle('ohr-ein-sof-revealed'); return; }
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
    menu.classList.add('ohr-ein-sof-revealed');
}

document.addEventListener('click', (e) => {
    document.querySelectorAll('.ohr-ein-sof-dropdown').forEach(m => {
        if (!e.target.closest(".awtsmoos-section-header")) m.classList.remove('ohr-ein-sof-revealed');
    });
});

export function createFootnoteOverlay(content) {
    const existing = document.getElementById('footnote-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'footnote-overlay';
    
    // Allow HTML in footnotes (like bold/links)
    overlay.innerHTML = content;
    
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}
