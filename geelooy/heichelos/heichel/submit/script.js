// B"H
/**
 * @module SubmitBoot
 * @description
 * Boots the Heichel submit composer after the DOM has manifested, checking the
 * button covenant before the editor begins to breathe.
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

document.addEventListener("DOMContentLoaded", () => {
    const missing = missingSubmitNodes(REQUIRED_IDS);
    if (missing.length) {
        setSubmitStatus(`Missing submit controls: ${missing.join(", ")}`, "error");
        console.error("B'H submit boot missing nodes", missing);
        return;
    }
    try {
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
