// B"H
/**
 * @module CommentEditorUi
 * @description
 * Chapter 5: The editor vessel is assembled from nodes, not string storms. The
 * Awtsmoos gives the typing chamber, AI bar, and initial trigger their borders.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { createWysiwygEditor } from "/heichelos/post/logic/wysiwyg.js";
import { getActiveAlias } from "./identity.js";

/** @param {object} owner CommentSection instance. */
export function createInitialButton(owner) {
    owner.btn = document.createElement("button");
    owner.btn.classList.add("btn", "awtsmoos-add-comment-btn");
    const span = document.createElement("span");
    span.textContent = "✍️ Transcribe your Insight...";
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

/** @param {object} owner CommentSection instance. */
export function createEditorInterface(owner) {
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
    owner.commentBox.dataset.placeholder = "Channel the Infinite...";
    owner.editorWrapper.style.display = "none";
    owner.commentBox.oninput = () => owner.syncSubmitState();
    owner.addCommentArea.appendChild(owner.editorWrapper);
    createAiDraftBar(owner);
}

function createAiDraftBar(owner) {
    owner.aiDraftBar = document.createElement("div");
    owner.aiDraftBar.className = "ai-draft-bar";
    const label = document.createElement("div");
    label.className = "ai-label";
    label.textContent = "Awtsmoos AI Assistant";
    const button = document.createElement("button");
    button.className = "btn-ai-draft";
    button.textContent = "✨ Draft Insight";
    button.onclick = () => owner.openAiDraftModal();
    owner.aiDraftBar.append(label, button);
    owner.editorWrapper.appendChild(owner.aiDraftBar);
}
