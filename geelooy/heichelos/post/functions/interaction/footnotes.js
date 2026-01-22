// /BH/awtsmoos.com/geelooy/heichelos/post/functions/interaction/footnotes.js
//B"H
/**
 * @file footnotes.js
 * The Keeper of Hidden Wisdom.
 */

export function initializeFootnotes() {
    const postData = window.post?.dayuh;
    const footnotesMeta = postData?.footnotes || postData?.meta?.footnotes;
    
    if (!footnotesMeta || !Array.isArray(footnotesMeta)) return;

    const refs = document.querySelectorAll('#realPost sup, .footnote-ref');
    
    refs.forEach(ref => {
        ref.style.cursor = "pointer";
        // Clean ID (remove brackets)
        let id = ref.innerText.replace(/[\[\]]/g, '').trim();
        if(!id) return;

        ref.dataset.footnoteId = id;
        
        ref.onclick = async (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            
            const matching = footnotesMeta.find(f => String(f.id) === String(id));
            if (!matching) return console.warn(`Footnote ${id} not found.`);

            // Prefer opening the sidebar panel
            if (window.openFootnotesPanel) {
                await window.openFootnotesPanel();
                // Scroll to specific note in sidebar
                setTimeout(() => {
                    const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${CSS.escape(id)}"]`);
                    if (item) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        item.classList.add('active');
                        setTimeout(() => item.classList.remove('active'), 2000);
                    }
                }, 450);
            } else {
                // Fallback: Overlay
                createFootnoteOverlay(matching.content || matching.paragraphs?.join("<br>"));
            }
        };
    });
}

export function createFootnoteOverlay(content) {
    const existing = document.getElementById('footnote-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'footnote-overlay';
    overlay.className = "awtsmoos-footnote-overlay"; // Uses CSS class for style
    
    const contentBox = document.createElement('div');
    contentBox.className = "awtsmoosFootnote";
    contentBox.innerHTML = content;

    overlay.onclick = () => overlay.remove();
    contentBox.onclick = (e) => e.stopPropagation();

    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);
}