//B"H
import { createFootnoteOverlay } from "../../functions/interaction.js";

export function renderFootnotesPanel(actualTab) {
    actualTab.innerHTML = "";
    const footnotes = window.post?.dayuh?.footnotes;
    
    if(!footnotes || !Array.isArray(footnotes) || footnotes.length === 0) {
        actualTab.innerHTML = `<div style="padding:20px; text-align:center; color:#888;">No footnotes found for this post.</div>`;
        return;
    }

    const list = document.createElement("div");
    list.className = "footnotes-list";
    
    footnotes.forEach((note, i) => {
        const item = document.createElement("div");
        item.className = "awtsmoos-list-item footnote-item";
        
        // Ensure ID matches what's in the text (often just the index + 1 or a specific ID)
        const idVal = note.id || (i + 1);
        item.dataset.footnoteId = idVal;
        
        item.innerHTML = `
            <div class="footnote-id">${idVal}</div>
            <div style="font-size:14px; line-height:1.5;">${note.content || ""}</div>
        `;
        
        // Click Side -> Scroll to Text
        item.onclick = (e) => {
            e.stopPropagation();
            // Look for both sup and .footnote-ref
            const ref = document.querySelector(`sup[data-footnote-id="${CSS.escape(idVal)}"], .footnote-ref[data-footnote-id="${CSS.escape(idVal)}"]`);
            if(ref) {
                ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                ref.classList.add('active-footnote-match');
                setTimeout(() => ref.classList.remove('active-footnote-match'), 2000);
                
                // On mobile, close sidebar to see text
                if (window.innerWidth <= 900) {
                    import("../../logic/listeners.js").then(m => m.toggleSidebar(false));
                }
            }
        };
        
        list.appendChild(item);
    });
    
    actualTab.appendChild(list);
}