//B"H
/**
 * @module SubmitCore
 * @description
 * The submit console can be reached globally or from inside a Heichel, and it
 * still knows which palace receives the spark without inventing the writer.
 */

import { makePost, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { getEditorContent } from "./editor.js";
import { getAllSectionsData } from "./sections.js";
import { setSubmitStatus } from "./status.js";

export function initializeSubmitCore() {
    const aliasIdDiv = document.getElementById("aliasId");
    const backBtn = document.getElementById("backBtn");
    const url = new URL(location);
    const parentSeriesId = url.searchParams.get("parentSeriesId") || "root";
    const heichelId = getHeichelId(url);
    const returnURL = url.searchParams.get("returnURL");
    const editPostId = url.searchParams.get("editPostId") || "";
    const baseURL = `/heichelos/${heichelId}?${new URLSearchParams({ view: "posts", series: parentSeriesId })}`;
    if (backBtn) backBtn.href = returnURL || baseURL;
    window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
    if (aliasIdDiv) aliasIdDiv.value = window.curAlias;
    addEventListener("awtsmoosAliasChange", event => {
        window.curAlias = event?.detail?.id || "";
        if (aliasIdDiv) aliasIdDiv.value = window.curAlias;
    });
    document.getElementById("postId")?.setAttribute("value", editPostId);
    document.getElementById("submitPost")?.addEventListener("click", () => handleSubmit({ heichelId, parentSeriesId, editPostId }));
    return { heichelId, parentSeriesId, editPostId };
}

function getHeichelId(url) {
    const parts = location.pathname.split("/").filter(Boolean);
    const pathHeichel = parts.length >= 3 && parts.at(-1) === "submit" ? parts.at(-2) : "";
    return url.searchParams.get("heichel") || url.searchParams.get("heichelId") || pathHeichel || "ikar";
}

function getValue(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function buildPayload({ heichelId, parentSeriesId, editPostId }) {
    const sections = getAllSectionsData();
    const mainContent = getEditorContent(document.getElementById("mainContentEditor"));
    return {
        aliasId: getValue("aliasId"),
        heichelId,
        parentSeriesId,
        seriesId: parentSeriesId,
        postId: getValue("postId") || editPostId || `BH_post_${Date.now()}`,
        title: getValue("title"),
        contentType: getValue("contentType") || "post",
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
    if (!payload.title) return setSubmitStatus("Title is required.", "error");
    if (!payload.aliasId) return setSubmitStatus("Alias ID missing. Please choose or log in with an alias.", "error");
    try {
        setSubmitStatus("Launching post...", "info");
        const response = await submitThroughContentApi(payload).catch(() => makePost(payload));
        if (!response.success) throw new Error(response.error || "Unknown server error");
        setSubmitStatus("Post launched.", "success");
        await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "SUCCESS!", bodyTxt: "Your segment-aware post has been launched." });
        const backBtn = document.getElementById("backBtn");
        location.href = backBtn ? backBtn.href : `/heichelos/${context.heichelId}`;
    } catch (error) {
        setSubmitStatus(error.message || "Submission failed.", "error");
        AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Submission Failed", bodyTxt: error.message });
    }
}
