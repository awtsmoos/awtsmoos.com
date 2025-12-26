//B"H
import { toggleContextualToolbar, toggleEditorHtmlView, getEditorContent } from "./editor.js";
import { initImageUploadModal } from "./images.js";

let sectionsArea;

export function setupSectionManager(editorInterface) {
    sectionsArea = document.getElementById("sectionsArea");
    
    // Generators
    document.getElementById("generateSectionsFromBulk")?.addEventListener("click", () => {
        const text = document.getElementById("bulkText").value.trim();
        const delims = document.getElementById("mainSectionDelimiters").value;
        generateItems(text, delims, sectionsArea, "sectionTemplate", false, editorInterface);
    });

    document.getElementById("generateSectionsFromMainEditor")?.addEventListener("click", () => {
        const mainEditor = document.getElementById("mainContentEditor");
        const content = getEditorContent(mainEditor).text;
        const delims = document.getElementById("mainSectionDelimiters").value;
        generateItems(content, delims, sectionsArea, "sectionTemplate", false, editorInterface);
    });

    document.getElementById("addSection")?.addEventListener("click", () => {
        const sec = createItem("sectionTemplate", "", false, editorInterface);
        sectionsArea.appendChild(sec);
        updateTitles();
    });
}

function parseText(text, delimitersStr) {
    if (!text) return [];
    let delims = delimitersStr ? delimitersStr.split(',').map(d => d.trim()).filter(Boolean) : [];
    
    if (delims.length === 0) return text.split(/\n+/).map(t => t.trim()).filter(Boolean);
    
    const regexStr = delims.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(regexStr, 'g');
    return text.split(regex).map(t => t.trim()).filter(Boolean);
}

function generateItems(text, delims, container, templateId, isSub, editorInterface) {
    const items = parseText(text, delims);
    items.forEach(txt => {
        const el = createItem(templateId, txt, isSub, editorInterface);
        container.appendChild(el);
    });
    updateTitles();
}

function createItem(templateId, content, isSub, editorInterface) {
    const tmpl = document.getElementById(templateId);
    if (!tmpl) return null;
    
    const clone = tmpl.content.cloneNode(true).firstElementChild;
    const contentDiv = clone.querySelector(".section-content");
    contentDiv.innerHTML = content;
    
    contentDiv.addEventListener('focus', () => editorInterface.setActiveEditor(contentDiv));

    // Controls
    clone.querySelector(".toggle-toolbar-btn").onclick = () => 
        toggleContextualToolbar(contentDiv, clone.querySelector(".editor-toolbar-container"));
        
    clone.querySelector(".toggle-html-view-btn").onclick = () => 
        toggleEditorHtmlView(contentDiv);
        
    clone.querySelector(".upload-image-section-btn").onclick = () => 
        initImageUploadModal(contentDiv);
        
    clone.querySelector(".remove-section-btn").onclick = () => {
        clone.remove();
        updateTitles();
    };

    // Reordering
    clone.querySelector(".add-before-btn").onclick = () => {
        clone.before(createItem(templateId, "", isSub, editorInterface));
        updateTitles();
    };
    clone.querySelector(".add-after-btn").onclick = () => {
        clone.after(createItem(templateId, "", isSub, editorInterface));
        updateTitles();
    };

    // Sub-section handling (only for main sections)
    if (!isSub) {
        const subArea = clone.querySelector(".sub-sections-area");
        const subManager = clone.querySelector(".subsection-manager");
        
        subManager.querySelector(".generate-subsections-btn").onclick = () => {
            const txt = subManager.querySelector(".subsection-bulk-text").value;
            const del = subManager.querySelector(".subsection-delimiters").value;
            generateItems(txt, del, subArea, "subSectionTemplate", true, editorInterface);
        };
        
        subManager.querySelector(".add-subsection-btn").onclick = () => {
            subArea.appendChild(createItem("subSectionTemplate", "", true, editorInterface));
            updateTitles(clone);
        };
    }

    return clone;
}

function updateTitles(parentSection) {
    // Update main sections
    const secs = document.querySelectorAll("#sectionsArea > .section");
    secs.forEach((s, i) => {
        s.querySelector(".section-title-dynamic").textContent = `Section ${i + 1}`;
        // Update subs inside
        const subs = s.querySelectorAll(".sub-sections-area > .sub-section");
        subs.forEach((sub, j) => {
            sub.querySelector(".section-title-dynamic").textContent = `Sub-Section ${j + 1}`;
        });
    });
}

export function getAllSectionsData() {
    return Array.from(document.querySelectorAll("#sectionsArea > .section")).map(sec => {
        const main = getEditorContent(sec.querySelector(".section-content"));
        const subs = Array.from(sec.querySelectorAll(".sub-section")).map(sub => {
            const sc = getEditorContent(sub.querySelector(".section-content"));
            return { html: sc.html, images: sc.images };
        });
        
        return {
            html: main.html,
            images: main.images,
            subSections: subs.length ? subs : undefined
        };
    });
}
