
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
        item.style.flexDirection = "column";
        item.style.alignItems = "flex-start";
        item.style.gap = "5px";
        
        const idVal = note.id || (i + 1);
        const contentVal = note.content || "";
        
        // B"H - Tag sidebar item with ID for syncing
        item.dataset.footnoteId = idVal;

        item.innerHTML = `
            <div class="footnote-id">${idVal}</div>
            <div style="font-size:0.9em; color:#333;">${contentVal}</div>
        `;
        
        // B"H - Scroll to text element instead of overlay
        item.onclick = (e) => {
            e.stopPropagation();
            
            // Try precise selector first
            let textEl = document.querySelector(`sup[data-footnote-id="${CSS.escape(idVal)}"], .footnote-ref[data-footnote-id="${CSS.escape(idVal)}"]`);
            
            // If ID has issues (e.g. *), try looping as fallback if simple selector failed
            if (!textEl) {
                const allRefs = document.querySelectorAll('sup, .footnote-ref');
                for(let ref of allRefs) {
                    if(ref.dataset.footnoteId === String(idVal)) {
                        textEl = ref;
                        break;
                    }
                }
            }

            if (textEl) {
                // Scroll main window to the element
                textEl.scrollIntoView({ behavior: "smooth", block: "center" });
                
                // Add intense active class
                document.querySelectorAll('.active-footnote-match').forEach(el => el.classList.remove('active-footnote-match'));
                textEl.classList.add('active-footnote-match');
                
                // Auto-remove after animation
                setTimeout(() => textEl.classList.remove('active-footnote-match'), 2000);
                
                // On mobile, maybe close the sidebar to see the text?
                if (window.innerWidth <= 900) {
                    const sidebar = document.querySelector(".sidebar");
                    if (sidebar) sidebar.classList.add("hidden-comments");
                    const btn = document.getElementById("commentaryBtn");
                    if (btn) btn.classList.remove("pushed");
                }
            } else {
                // Fallback to overlay if not found in text (weird edge case)
                createFootnoteOverlay(contentVal);
            }
        };
        
        list.appendChild(item);
    });
    
    actualTab.appendChild(list);
}
