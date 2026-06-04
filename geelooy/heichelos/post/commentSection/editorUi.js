// B"H
/**
 * @module CommentEditorUi
 * @description
 * Chapter 207: Every editor chamber exposes its handle to the parent class.
 * The CommentSection can now hide the scope row, add-section gate, imagery gate,
 * and action footer until the reader explicitly clicks the scribe button.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { createWysiwygEditor } from "/heichelos/post/logic/wysiwyg.js";
import { getActiveAlias } from "./identity.js";

function makeScopeButton(owner, mode, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "awtsmoos-comment-scope-btn";
    button.dataset.scope = mode;
    button.textContent = label;
    button.onclick = () => setScope(owner, mode);
    return button;
}

function setScope(owner, mode) {
    owner.scopeMode = mode;
    owner.scopeButtons?.forEach(button => button.classList.toggle("is-active", button.dataset.scope === mode));
    if (owner.scopeHint) owner.scopeHint.textContent = mode === "root" ? "Posting at scroll root" : "Posting at current verse / paragraph";
}

function createScopeControls(owner) {
    owner.scopeMode = owner.options.scope || "current";
    owner.scopeRow = document.createElement("div");
    owner.scopeRow.className = "awtsmoos-comment-scope-row";
    owner.scopeButtons = [makeScopeButton(owner, "current", "Current place"), makeScopeButton(owner, "root", "Root")];
    owner.scopeHint = document.createElement("span");
    owner.scopeHint.className = "awtsmoos-comment-scope-hint";
    owner.scopeRow.append(...owner.scopeButtons, owner.scopeHint);
    owner.addCommentArea.appendChild(owner.scopeRow);
    setScope(owner, owner.scopeMode);
}

function createTitleInput(owner) {
    owner.titleInput = document.createElement("input");
    owner.titleInput.className = "awtsmoos-comment-title-input";
    owner.titleInput.type = "text";
    owner.titleInput.placeholder = "Optional title / dibbur hamaschil…";
    owner.titleInput.autocomplete = "off";
    owner.titleInput.addEventListener("input", () => owner.syncSubmitState());
    owner.addCommentArea.appendChild(owner.titleInput);
}

function createSectionControls(owner) {
    owner.sectionList = document.createElement("div");
    owner.sectionList.className = "awtsmoos-comment-section-list";
    owner.addSectionBtn = document.createElement("button");
    owner.addSectionBtn.type = "button";
    owner.addSectionBtn.className = "awtsmoos-add-section-btn";
    owner.addSectionBtn.textContent = "+ Add section";
    owner.addSectionBtn.onclick = () => addSection(owner);
    owner.addCommentArea.append(owner.sectionList, owner.addSectionBtn);
}

function addSection(owner) {
    const section = document.createElement("section");
    section.className = "awtsmoos-comment-extra-section";
    const title = document.createElement("input");
    title.className = "awtsmoos-extra-section-title";
    title.placeholder = "Section title";
    const text = document.createElement("textarea");
    text.className = "awtsmoos-extra-section-text";
    text.placeholder = "Markdown or plain text for this section…";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "awtsmoos-remove-section-btn";
    remove.textContent = "Remove";
    remove.onclick = () => {
        section.remove();
        owner.syncSubmitState();
    };
    [title, text].forEach(input => input.addEventListener("input", () => owner.syncSubmitState()));
    section.append(title, text, remove);
    owner.sectionList.appendChild(section);
    owner.syncSubmitState();
}

export function createInitialButton(owner) {
    owner.btn = document.createElement("button");
    owner.btn.classList.add("btn", "awtsmoos-add-comment-btn");
    const span = document.createElement("span");
    span.textContent = owner.options.label || "✍️ Write your own insight";
    owner.btn.appendChild(span);
    owner.btn.onclick = async () => {
        if (!getActiveAlias()) {
            await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Choose an Alias", bodyTxt: "Pick an alias first." });
            return;
        }
        owner.revealEditor();
    };
    owner.addCommentArea.appendChild(owner.btn);
}

export function createEditorInterface(owner) {
    createScopeControls(owner);
    createTitleInput(owner);
    if (typeof createWysiwygEditor !== "function") {
        owner.commentBox = document.createElement("div");
        owner.editorWrapper = document.createElement("div");
        owner.editorWrapper.appendChild(owner.commentBox);
    } else {
        const { editorWrapper, contentArea, sourceArea } = createWysiwygEditor();
        owner.editorWrapper = editorWrapper;
        owner.commentBox = contentArea;
        owner.sourceArea = sourceArea;
    }
    owner.commentBox.dataset.placeholder = "Write rich text or markdown…";
    owner.editorWrapper.style.display = "grid";
    owner.commentBox.oninput = () => owner.syncSubmitState();
    owner.addCommentArea.appendChild(owner.editorWrapper);
    createSectionControls(owner);
}
