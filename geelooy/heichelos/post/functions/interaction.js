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
                // B"H - When no paragraph is active, clear the sub parameter
                // This ensures the sidebar refreshes to show empty or verse-level state
                // rather than getting stuck on the last paragraph.
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
 * @method scrollToActiveEl
 */
export function scrollToActiveEl() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    const sub = params.get("sub");

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
            
            // Optional: Flash the element to show it was selected
            target.style.transition = "background-color 0.5s";
            const originalBg = target.style.backgroundColor;
            target.style.backgroundColor = "rgba(255, 214, 0, 0.2)";
            setTimeout(() => {
                target.style.backgroundColor = originalBg;
            }, 1000);
            
            return; // Stop polling
        }

        attempts++;
        if (attempts < maxAttempts) {
            requestAnimationFrame(() => setTimeout(tryScroll, 100));
        }
    };

    // Start polling
    setTimeout(tryScroll, 100);
}

/**
 * Footnote Logic & Interactions
 */
export function initializeFootnotes() {
    document.querySelectorAll('.footnote-ref').forEach(ref => {
        ref.onclick = (e) => {
            e.preventDefault();
            const content = ref.dataset.content;
            if (content) createFootnoteOverlay(content);
        };
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
    const box = document.createElement('div');
    box.className = "awtsmoosFootnote";
    box.innerHTML = content;
    overlay.onclick = () => overlay.remove();
    box.onclick = (e) => e.stopPropagation();
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}
