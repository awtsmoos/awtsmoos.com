//B"H
/**
 * @module SubmitSections
 * @description
 * Splits a post into verses, segments, and nested chambers so the API receives
 * anchored material ready for reader-side navigation.
 */
import { toggleContextualToolbar, toggleEditorHtmlView, getEditorContent } from "./editor.js";
import { initImageUploadModal } from "./images.js";
import { parseSectionText } from "./text.js";
let sectionsArea;

export function setupSectionManager(editorInterface) {
    sectionsArea = document.getElementById("sectionsArea");
    bindGenerator("generateSectionsFromBulk", () => document.getElementById("bulkText")?.value || "", editorInterface);
    bindGenerator("generateSectionsFromMainEditor", () => getEditorContent(document.getElementById("mainContentEditor")).text, editorInterface);
    document.getElementById("addSection")?.addEventListener("click", () => {
        sectionsArea.appendChild(createItem("sectionTemplate", "", false, editorInterface));
        updateTitles();
    });
}

function bindGenerator(buttonId, textGetter, editorInterface) {
    document.getElementById(buttonId)?.addEventListener("click", () => {
        const delims = document.getElementById("mainSectionDelimiters")?.value || "";
        generateItems(textGetter().trim(), delims, sectionsArea, "sectionTemplate", false, editorInterface);
    });
}

function generateItems(text, delims, container, templateId, isSub, editorInterface) {
    parseSectionText(text, delims).forEach((txt, index) => {
        container.appendChild(createItem(templateId, txt, isSub, editorInterface, index));
    });
    updateTitles();
}

function setControlValue(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.value = value;
}

function wireEditorControls(clone, contentDiv, editorInterface) {
    contentDiv.addEventListener("focus", () => editorInterface.setActiveEditor(contentDiv));
    clone.querySelector(".toggle-toolbar-btn").onclick = () => toggleContextualToolbar(contentDiv, clone.querySelector(".editor-toolbar-container"));
    clone.querySelector(".toggle-html-view-btn").onclick = () => toggleEditorHtmlView(contentDiv);
    clone.querySelector(".upload-image-section-btn").onclick = () => initImageUploadModal(contentDiv);
    clone.querySelector(".remove-section-btn").onclick = () => {
        clone.remove();
        updateTitles();
    };
}

function wirePlacementControls(clone, templateId, isSub, editorInterface) {
    clone.querySelector(".add-before-btn").onclick = () => {
        clone.before(createItem(templateId, "", isSub, editorInterface));
        updateTitles();
    };
    clone.querySelector(".add-after-btn").onclick = () => {
        clone.after(createItem(templateId, "", isSub, editorInterface));
        updateTitles();
    };
}

function wireSubSections(clone, editorInterface) {
    const subArea = clone.querySelector(".sub-sections-area");
    const subManager = clone.querySelector(".subsection-manager");
    subManager.querySelector(".generate-subsections-btn").onclick = () => {
        generateItems(subManager.querySelector(".subsection-bulk-text").value, subManager.querySelector(".subsection-delimiters").value, subArea, "subSectionTemplate", true, editorInterface);
    };
    subManager.querySelector(".add-subsection-btn").onclick = () => {
        subArea.appendChild(createItem("subSectionTemplate", "", true, editorInterface));
        updateTitles();
    };
}

function createItem(templateId, content, isSub, editorInterface, index = 0) {
    const tmpl = document.getElementById(templateId);
    const clone = tmpl.content.cloneNode(true).firstElementChild;
    const contentDiv = clone.querySelector(".section-content");
    contentDiv.innerHTML = content;
    setControlValue(clone, ".section-verse-input", isSub ? `segment-${index + 1}` : `verse-${index + 1}`);
    setControlValue(clone, ".section-label-input", isSub ? `Segment ${index + 1}` : `Verse ${index + 1}`);
    setControlValue(clone, ".section-order-input", String(index + 1));
    wireEditorControls(clone, contentDiv, editorInterface);
    wirePlacementControls(clone, templateId, isSub, editorInterface);
    if (!isSub) wireSubSections(clone, editorInterface);
    return clone;
}

function updateTitles() {
    document.querySelectorAll("#sectionsArea > .section").forEach((section, index) => {
        section.querySelector(".section-title-dynamic").textContent = `Verse ${index + 1}`;
        if (!section.querySelector(".section-order-input")?.value) setControlValue(section, ".section-order-input", String(index + 1));
        section.querySelectorAll(".sub-sections-area > .sub-section").forEach((sub, subIndex) => {
            sub.querySelector(".section-title-dynamic").textContent = `Segment ${subIndex + 1}`;
            if (!sub.querySelector(".section-order-input")?.value) setControlValue(sub, ".section-order-input", String(subIndex + 1));
        });
    });
}

function sectionMeta(root, fallbackPrefix, index) {
    return {
        id: root.querySelector(".section-id-input")?.value || `${fallbackPrefix}_${index + 1}`,
        title: root.querySelector(".section-label-input")?.value || `${fallbackPrefix} ${index + 1}`,
        verseSection: root.querySelector(".section-verse-input")?.value || `${fallbackPrefix}-${index + 1}`,
        segmentType: root.querySelector(".section-type-select")?.value || fallbackPrefix,
        order: Number(root.querySelector(".section-order-input")?.value || index + 1)
    };
}

export function getAllSectionsData() {
    return Array.from(document.querySelectorAll("#sectionsArea > .section")).map((sec, index) => {
        const main = getEditorContent(sec.querySelector(".section-content"));
        const segments = Array.from(sec.querySelectorAll(".sub-section")).map((sub, subIndex) => {
            const sc = getEditorContent(sub.querySelector(".section-content"));
            return { ...sectionMeta(sub, "segment", subIndex), html: sc.html, content: sc.text, images: sc.images };
        });
        return { ...sectionMeta(sec, "verse", index), html: main.html, content: main.text, images: main.images, segments };
    });
}
