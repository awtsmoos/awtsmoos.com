//B"H
// Heichelos Submit Page - Main Entry
// Refactored for Modular Intensity

import { AwtsmoosPrompt, makePost } from "/scripts/awtsmoos/api/utils.js";
import { initializeSubmitCore } from "./logic/core.js";
import { setupEditor } from "./logic/editor.js";
import { setupSectionManager } from "./logic/sections.js";
import { setupImageUploader } from "./logic/images.js";

window.AwtsmoosPrompt = AwtsmoosPrompt;

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("B\"H - Submit Page initializing...");
    
    // 1. Initialize Core State & Event Listeners (Back buttons, Aliases)
    const core = initializeSubmitCore();
    
    // 2. Setup the Main Content Editor (Toolbar, HTML view)
    const editor = setupEditor();
    
    // 3. Setup the Dynamic Section Manager (Generation, Addition, Reordering)
    const sectionManager = setupSectionManager(editor);
    
    // 4. Setup Image Upload Modal
    setupImageUploader(editor);
    
    console.log("B\"H - Submit Page Ready.");
});
