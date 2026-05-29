// B"H
/**
 * @module CommentAiDraft
 * @description
 * Chapter 5: The AI draft is a servant, not a ruler. It gathers local context,
 * asks the oracle for words, and pours the answer through the one editor HTML
 * vessel instead of scattering sinks through the palace.
 */

import { markdownToHtml } from "/heichelos/post/parsing.js";
import { setEditorHtml, stripHtml } from "./editorValue.js";

function activeContextText() {
    const params = new URLSearchParams(location.search);
    const idx = params.get("idx");
    if (idx !== null && window.sectionDayuh?.[idx]) {
        const section = window.sectionDayuh[idx];
        return Array.isArray(section) ? section.flat(Infinity).join("\n") : section;
    }
    return document.getElementById("realPost")?.innerText.substring(0, 1000) || "";
}

/** @param {object} owner CommentSection instance. */
export async function openAiDraftModal(owner) {
    const userIntent = prompt("Describe what you want to say:");
    if (!userIntent) return;
    setEditorHtml(owner.commentBox, "<p><i>AI is weaving letters...</i></p>");
    const contextText = stripHtml(activeContextText()).substring(0, 500);
    const promptText = `B"H\nUser intent: "${userIntent}"\nContext: "${contextText}..."\nDraft a short, relevant comment in Markdown format.`;
    try {
        const draftMarkdown = await window.awtsmoosAi({ prompt: promptText });
        const draftHtml = markdownToHtml(draftMarkdown);
        setEditorHtml(owner.commentBox, draftHtml);
        if (owner.sourceArea) owner.sourceArea.value = draftHtml;
        owner.submitBtn.disabled = false;
    } catch (error) {
        alert("AI Error: " + error.message);
        owner.resetForm();
    }
}
