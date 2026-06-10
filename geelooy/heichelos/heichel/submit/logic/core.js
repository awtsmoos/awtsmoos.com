//B"H
/**
 * @module SubmitCore
 * @description
 * Chapter 30: The Awtsmoos lets the editor choose between fresh creation and
 * segment-aware editing. Payloads now carry verses, ordered segments, post ids,
 * and content type, so browser writing and Node API tests share one covenant.
 */

import { makePost, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { getEditorContent } from "./editor.js";
import { getAllSectionsData } from "./sections.js";

export function initializeSubmitCore() {
    const aliasIdDiv = document.getElementById("aliasId");
    const backBtn = document.getElementById("backBtn");
    const url = new URL(location);
    const parentSeriesId = url.searchParams.get("parentSeriesId") || "root";
    const heichelId = url.searchParams.get("heichelId") || location.pathname.split("/").filter(Boolean).at(-3) || "";
    const returnURL = url.searchParams.get("returnURL");
    const editPostId = url.searchParams.get("editPostId") || "";
    const baseURL = `/heichelos/${heichelId}?${new URLSearchParams({ view: "posts", series: parentSeriesId })}`;
    if (backBtn) backBtn.href = returnURL || baseURL;
    window.curAlias = window.curAlias || "";
    if (aliasIdDiv) aliasIdDiv.value = window.curAlias;
    addEventListener("awtsmoosAliasChange", event => {
        window.curAlias = event.detail.id;
        if (aliasIdDiv) aliasIdDiv.value = window.curAlias;
    });
    document.getElementById("postId")?.setAttribute("value", editPostId);
    document.getElementById("submitPost")?.addEventListener("click", () => handleSubmit({ heichelId, parentSeriesId, editPostId }));
    return { heichelId, parentSeriesId, editPostId };
}

function getValue(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function buildPayload({ heichelId, parentSeriesId, editPostId }) {
    const title = getValue("title");
    const aliasId = getValue("aliasId");
    const postId = getValue("postId") || editPostId || `BH_post_${Date.now()}`;
    const contentType = getValue("contentType") || "post";
    const mainContent = getEditorContent(document.getElementById("mainContentEditor"));
    const sections = getAllSectionsData();
    return {
        aliasId,
        heichelId,
        parentSeriesId,
        seriesId: parentSeriesId,
        postId,
        title,
        contentType,
        content: mainContent.text,
        mainContent: { html: mainContent.html, images: mainContent.images },
        sections,
        dayuh: { sections, verseMap: Object.fromEntries(sections.map(section => [section.verseSection, section.id])) }
    };
}

async function submitThroughContentApi(payload) {
    const endpoint = payload.contentType === "question"
        ? `/api/social/content/heichelos/${encodeURIComponent(payload.heichelId)}/questions`
        : `/api/social/content/heichelos/${encodeURIComponent(payload.heichelId)}/posts`;
    const response = await fetch(endpoint, {
        method: "POST",
        body: new URLSearchParams({
            aliasId: payload.aliasId,
            postId: payload.postId,
            title: payload.title,
            content: payload.content,
            seriesId: payload.seriesId,
            parentSeriesId: payload.parentSeriesId,
            sections: JSON.stringify(payload.sections)
        })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || "Content API failed.");
    return data;
}

async function handleSubmit(context) {
    const payload = buildPayload(context);
    if (!payload.title) return alert("Title is required!");
    if (!payload.aliasId) return alert("Alias ID missing. Please log in.");
    try {
        const response = await submitThroughContentApi(payload).catch(() => makePost(payload));
        if (!response.success) throw new Error(response.error || "Unknown server error");
        await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "SUCCESS!", bodyTxt: "Your segment-aware post has been launched." });
        const backBtn = document.getElementById("backBtn");
        location.href = backBtn ? backBtn.href : `/heichelos/${context.heichelId}`;
    } catch (error) {
        AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Submission Failed", bodyTxt: error.message });
    }
}
