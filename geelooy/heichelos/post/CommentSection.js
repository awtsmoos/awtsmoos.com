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
import { submitComment } from "./commentSection/submit.js";

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
        this.errorLine = document.createElement("div");
        this.errorLine.className = "awtsmoos-comment-error";
        this.errorLine.setAttribute("role", "alert");
        this.errorLine.hidden = true;
        this.addCommentArea.appendChild(this.errorLine);
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
        [this.scopeRow, this.titleInput, this.editorWrapper, this.sectionList, this.addSectionBtn, this.mediaTrigger, this.galleryContainer, this.buttonContainer, this.errorLine]
            .filter(Boolean)
            .forEach(node => { node.hidden = true; });
        // B"H social fix 11 (defect 1): the editor wrapper carries an
        // INLINE display:grid — set in createEditorInterface and again in
        // revealEditor() — and an inline display beats the UA [hidden]
        // rule, so hidden=true alone never hid the wrapper: its B/I/U/Link
        // toolbar stayed visible below the button both before opening and
        // after Cancel (only the toolbar shows — the content area is empty
        // and the source area is display:none). Clear the inline display
        // here; revealEditor() sets it back to "grid".
        if (this.editorWrapper) this.editorWrapper.style.display = "none";
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

    /** Shows an error inside the composer; the drafted text is never cleared on failure. */
    showError(message) {
        if (!this.errorLine) return;
        this.errorLine.textContent = String(message?.message || message || "Something went wrong.");
        this.errorLine.hidden = false;
    }

    /** Clears the inline composer error. */
    hideError() {
        if (!this.errorLine) return;
        this.errorLine.textContent = "";
        this.errorLine.hidden = true;
    }

    /** Sends the current comment to the Heichel API. */
    async submitComment() {
        if (this.isSubmitting) return;
        let content = getEditorHtml(this.commentBox);
        if (this.sourceArea && this.sourceArea.style.display !== "none") content = this.sourceArea.value;
        this.hideError();
        this.isSubmitting = true;
        setSubmitText(this.submitBtn, "...Transmitting...");
        this.submitBtn.disabled = true;
        try {
            await submitComment(this, content);
            this.resetForm();
        } catch (error) {
            console.error("B\"H - Transmission failed:", error);
            // The error surfaces in the composer itself. Awaiting a modal
            // prompt here used to be able to wedge the button in its
            // disabled "Transmitting" state indefinitely.
            this.showError(error);
        } finally {
            // Whatever happened, the button always comes back; the draft
            // text is preserved on failure so syncSubmitState re-enables it.
            this.isSubmitting = false;
            setSubmitText(this.submitBtn, "Transmit");
            if (this.submitBtn) this.submitBtn.disabled = false;
            this.syncSubmitState();
        }
    }
}
