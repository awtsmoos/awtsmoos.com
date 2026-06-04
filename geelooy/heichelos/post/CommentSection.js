// B"H
/**
 * @module CommentSection
 * @description
 * Chapter 179: A compact scribe altar can write at root or at the living place.
 * The class remains the public vessel, while scoped title/sections/media/submit
 * chambers keep the Awtsmoos flow modular and inspectable.
 */

import { createButtons, setSubmitText } from "./commentSection/actions.js";
import { clearEditor, getEditorHtml } from "./commentSection/editorValue.js";
import { createEditorInterface, createInitialButton } from "./commentSection/editorUi.js";
import { createImageUploadControls, updateGallery } from "./commentSection/media.js";
import { showSubmitError, submitComment } from "./commentSection/submit.js";

export class CommentSection {
    imgResults = [];

    /**
     * Creates a comment entry UI.
     * @param {HTMLElement} container Parent container.
     * @param {object} [options={}] Comment behavior options.
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.init();
    }

    /** Builds the comment entry surface. */
    init() {
        this.addCommentArea = document.createElement("div");
        this.addCommentArea.classList.add("awtsmoos-comment-entry-monolith");
        if (this.options.compact) this.addCommentArea.classList.add("is-compact-altar");
        this.container.appendChild(this.addCommentArea);
        createInitialButton(this);
        createEditorInterface(this);
        createImageUploadControls(this);
        createButtons(this);
        if (this.options.autoReveal && window.curAlias) this.revealEditor();
    }

    /** Enables submit when text, title, section, or image sparks exist. */
    syncSubmitState() {
        const hasText = this.commentBox.innerText.trim().length > 0;
        const hasTitle = !!this.titleInput?.value?.trim();
        const hasSections = Array.from(this.sectionList?.querySelectorAll("textarea") || []).some(area => area.value.trim());
        const hasImages = this.imgResults.length > 0;
        this.submitBtn.disabled = !(hasText || hasTitle || hasSections || hasImages);
    }

    /** Reveals the editor after alias validation. */
    revealEditor() {
        this.btn.style.display = "none";
        this.editorWrapper.style.display = "flex";
        this.buttonContainer.classList.add("revealed");
        this.titleInput?.focus?.();
    }

    /** Resets editor, gallery, buttons, and visible state. */
    resetForm() {
        clearEditor(this.commentBox);
        if (this.sourceArea) this.sourceArea.value = "";
        if (this.titleInput) this.titleInput.value = "";
        this.sectionList?.replaceChildren?.();
        this.imgResults = [];
        updateGallery(this);
        this.editorWrapper.style.display = "none";
        this.buttonContainer.classList.remove("revealed");
        this.btn.style.display = "flex";
        this.submitBtn.disabled = true;
    }

    /** Sends the current comment to the Heichel API. */
    async submitComment() {
        let content = getEditorHtml(this.commentBox);
        if (this.sourceArea && this.sourceArea.style.display !== "none") content = this.sourceArea.value;
        setSubmitText(this.submitBtn, "...Transmitting...");
        this.submitBtn.disabled = true;
        try {
            await submitComment(this, content);
            this.resetForm();
        } catch (error) {
            console.error("B\"H - Transmission failed:", error);
            await showSubmitError(error);
        } finally {
            setSubmitText(this.submitBtn, "Transmit");
            this.submitBtn.disabled = false;
        }
    }
}
