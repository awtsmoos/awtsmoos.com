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
    
    const verseChai = new Highlighter(
        containerSelector,
        ".section",
        (h) => { if (typeof onSection === 'function') onSection(h); }
    );

    const subChai = new Highlighter(
        containerSelector,
        ".sub-awtsmoos",
        (h) => { if (typeof onParagraph === 'function') onParagraph(h); },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                updateQueryStringParameter("sub", null);
                window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { sub: null } }));
            }
        }
    );

    window.chai = verseChai;
    window.subChai = subChai;
}

/**
 * Scrolls to the coordinate defined in the URL with retry logic.
 */
export function scrollToActiveEl() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    const sub = params.get("sub");

    if (idx === null) return;
    
    const tryScroll = () => {
        const section = document.querySelector(`.section[data-awtsmoos-idx="${idx}"]`);
        if (section) {
            let target = section;
            if (sub !== null) {
                const paragraph = section.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${sub}"]`);
                if (paragraph) target = paragraph;
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; 
        }
        requestAnimationFrame(() => setTimeout(tryScroll, 100));
    };
    setTimeout(tryScroll, 100);
}

/**
 * Footnote Logic - Sovereign Sidebar Bridge
 */
export function initializeFootnotes() {
    document.querySelectorAll('sup, .footnote-ref').forEach(ref => {
        ref.style.cursor = "pointer";
        let id = ref.innerText.replace(/[\[\]]/g, '').trim();
        if(!id) id = ref.innerText.trim();
        if(!id) return;

        ref.dataset.footnoteId = id;
        ref.classList.add('active-footnote-ref');

        ref.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // B"H - Command Sidebar to open Footnotes
            if (window.openFootnotesPanel) {
                await window.openFootnotesPanel();
                
                // Wait for stack slide
                setTimeout(() => {
                    const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${CSS.escape(id)}"]`);
                    if (item) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        item.classList.add('active');
                        setTimeout(() => item.classList.remove('active'), 2000);
                    }
                }, 450);
            } else {
                // Fallback if Sidebar isn't initialized
                const footnotes = window.post?.dayuh?.footnotes;
                const note = footnotes?.find(n => String(n.id) === String(id));
                if(note) createFootnoteOverlay(note.content);
            }
        };
    });
}

/**
 * B"H - Syncs Sidebar Footnotes with text view
 */
export function syncFootnotesInSidebar(containerElement) {
    if (!containerElement) return;
    const refs = containerElement.querySelectorAll('[data-footnote-id]');
    const activeIds = Array.from(refs).map(el => el.dataset.footnoteId);
    const sidebarList = document.querySelector('.footnotes-list');
    if (!sidebarList) return; 

    const previouslyActive = sidebarList.querySelectorAll('.footnote-item.active');
    previouslyActive.forEach(el => el.classList.remove('active'));

    if (activeIds.length === 0) return;
    const activeIdSet = new Set(activeIds);

    Array.from(sidebarList.children).forEach(item => {
        if(activeIdSet.has(item.dataset.footnoteId)) {
             item.classList.add('active');
        }
    });
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

export function createFootnoteOverlay(content) {
    const existing = document.getElementById('footnote-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'footnote-overlay';
    
    // Brutalist Overlay
    Object.assign(overlay.style, {
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        border: '5px solid #000',
        padding: '2rem',
        boxShadow: '15px 15px 0 #000',
        zIndex: '10000',
        maxWidth: '90%',
        maxHeight: '40vh',
        overflowY: 'auto',
        fontFamily: 'Crimson Pro, serif',
        fontSize: '1.2rem'
    });

    overlay.innerHTML = content;
    const close = document.createElement('div');
    close.innerHTML = '&times;';
    Object.assign(close.style, {
        position: 'absolute', top: '5px', right: '10px', fontSize: '24px', cursor: 'pointer', fontWeight: '900'
    });
    close.onclick = () => overlay.remove();
    overlay.appendChild(close);

    document.body.appendChild(overlay);
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}
