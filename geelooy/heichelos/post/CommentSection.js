// B"H
/**
 * @module CommentSection
 * @description
 * Chapter 206: The scribe altar learns concealment.
 * The button alone appears first. Only when the reader clicks does the form
 * open like a chamber: scope, title, editor, sections, imagery, and transmit.
 */

import { createButtons, setSubmitText } from "./commentSection/actions.js";
import { clearEditor, getEditorHtml } from "./commentSection/editorValue.js";
import { createEditorInterface, createInitialButton } from "./commentSection/editorUi.js";
import { createImageUploadControls, updateGallery } from "./commentSection/media.js";
import { showSubmitError, submitComment } from "./commentSection/submit.js";

export class CommentSection {
    imgResults = [];

    /** @param {HTMLElement} container @param {object} [options={}] */
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
        this.closeEditorSurface();
        if (this.options.autoReveal && window.curAlias) this.revealEditor();
    }

    /** Enables submit when text, title, section, or image sparks exist. */
    syncSubmitState() {
        const hasText = this.commentBox?.innerText?.trim?.().length > 0;
        const hasTitle = !!this.titleInput?.value?.trim();
        const hasSections = Array.from(this.sectionList?.querySelectorAll("textarea") || []).some(area => area.value.trim());
        const hasImages = this.imgResults.length > 0;
        if (this.submitBtn) this.submitBtn.disabled = !(hasText || hasTitle || hasSections || hasImages);
    }

    /** Hides all non-button fields before the user opens the altar. */
    closeEditorSurface() {
        this.addCommentArea.classList.remove("is-editor-open");
        [this.scopeRow, this.titleInput, this.editorWrapper, this.sectionList, this.addSectionBtn, this.mediaTrigger, this.galleryContainer, this.buttonContainer]
            .filter(Boolean)
            .forEach(node => { node.hidden = true; });
        if (this.btn) this.btn.hidden = false;
    }

    /** Reveals the editor after alias validation. */
    revealEditor() {
        this.addCommentArea.classList.add("is-editor-open");
        [this.scopeRow, this.titleInput, this.editorWrapper, this.sectionList, this.addSectionBtn, this.mediaTrigger, this.buttonContainer]
            .filter(Boolean)
            .forEach(node => { node.hidden = false; });
        if (this.galleryContainer) this.galleryContainer.hidden = this.imgResults.length === 0;
        if (this.btn) this.btn.hidden = true;
        if (this.editorWrapper) this.editorWrapper.style.display = "grid";
        this.buttonContainer?.classList.add("revealed");
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
        this.buttonContainer?.classList.remove("revealed");
        if (this.submitBtn) this.submitBtn.disabled = true;
        this.closeEditorSurface();
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
            this.syncSubmitState();
        }
    }
}
