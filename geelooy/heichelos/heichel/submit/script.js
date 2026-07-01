// B"H
/**
 * @module SubmitBoot
 * @description
 * Boots the simple post sun: write first, verse when needed, advanced hidden.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { initializeSubmitCore } from "./logic/core.js";
import { setupEditor } from "./logic/editor.js";
import { setupSectionManager } from "./logic/sections.js";
import { setupImageUploader } from "./logic/images.js";
import { missingSubmitNodes, setSubmitStatus } from "./logic/status.js";

window.AwtsmoosPrompt = AwtsmoosPrompt;

const REQUIRED_IDS = [
    "backBtn", "title", "aliasId", "postId", "contentType", "mainContentEditor",
    "sectionsArea", "toolbarTemplate", "sectionTemplate", "subSectionTemplate",
    "imageUploadModal", "submitPost"
];

function setupKindPills() {
    const hiddenType = document.getElementById("contentType");
    document.querySelectorAll(".kind-pill").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".kind-pill").forEach(pill => pill.classList.remove("active"));
            button.classList.add("active");
            if (hiddenType) hiddenType.value = button.textContent.trim().toLowerCase() || "post";
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const missing = missingSubmitNodes(REQUIRED_IDS);
    if (missing.length) {
        setSubmitStatus(`Missing submit controls: ${missing.join(", ")}`, "error");
        console.error("B'H submit boot missing nodes", missing);
        return;
    }
    try {
        setupKindPills();
        const core = initializeSubmitCore();
        const editor = setupEditor();
        setupSectionManager(editor);
        setupImageUploader(editor);
        setSubmitStatus(`Ready for ${core.heichelId}.`, "success");
    } catch (error) {
        setSubmitStatus(error.message || "Submit console failed to initialize.", "error");
        console.error("B'H submit boot failed", error);
    }
});
