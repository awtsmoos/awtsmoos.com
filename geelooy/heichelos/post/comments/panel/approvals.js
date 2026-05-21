//B"H
/**
 * @file approvals.js
 * @description
 * A mobile-first approval queue for submitted comments. It speaks directly to
 * /api/social submittedComments routes and refreshes the living comment panels
 * after every approval or denial.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { normalizeCommentCoordinate } from "../state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "../state/eventBus.js";
import { normalizeCommentCoordinate } from "../state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "../state/eventBus.js";

function activeAlias() {
    const alias = window.curAlias || localStorage.getItem("lastAliasUsed") || "";
    if (alias) window.curAlias = alias;
    return alias;
}

async function fetchSubmissions() {
    const aliasId = activeAlias();
    if (!aliasId) return { error: "Choose an alias before reviewing approvals." };
    const url = `/api/social/heichelos/${window.post?.heichel?.id}/submittedComments?${new URLSearchParams({ aliasId })}`;
    const res = await fetch(url);
    return await res.json();
}

function normalizeSubmitted(payload) {
    const raw = payload?.comments || payload?.success || [];
    if (Array.isArray(raw)) return raw;
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw).map(([id, value]) => ({ id, ...(value || {}) }));
}

async function decide(comment, action) {
    const commentId = comment.id || comment.commentId;
    const aliasId = activeAlias();
    const coordinate = normalizeCommentCoordinate({
        ...comment,
        dayuh: comment.dayuh,
        heichelId: window.post?.heichel?.id,
        seriesId: window.post?.parentSeriesId,
        postId: window.post?.id
    });
    const url = `/api/social/heichelos/${window.post?.heichel?.id}/submittedComments/${action}`;
    const res = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({ aliasId, commentId })
    });
    const json = await res.json();
    if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment({ aliasId, coordinate });
    emitAwtsmoosEvent(action === "approve" ? "comment:approved" : "comment:denied", { aliasId, commentId, coordinate, response: json });
    return json;
}

function previewText(comment) {
    const html = comment?.content || comment?.dayuh?.content || "";
    const div = document.createElement("div");
    div.innerHTML = String(html);
    return (div.textContent || div.innerText || "Submitted insight").trim().slice(0, 240);
}

function coordinateText(comment) {
    const verse = comment?.dayuh?.verseSection ?? comment?.verseSection ?? "root";
    const sub = comment?.dayuh?.subSection;
    return sub === undefined || sub === null ? `Section ${verse}` : `Section ${verse}, paragraph ${Number(sub) + 1}`;
}

function renderCard(comment, reload) {
    const commentId = comment.id || comment.commentId;
    return {
        tag: "article",
        attr: { class: "approval-card awtsmoos-list-item", "data-comment-id": commentId || "" },
        children: [
            {
                tag: "div",
                attr: { class: "approval-card-top" },
                children: [
                    { tag: "div", attr: { class: "approval-author" }, text: `@${comment.aliasId || comment.author || "unknown"}` },
                    { tag: "div", attr: { class: "approval-coordinate" }, text: coordinateText(comment) }
                ]
            },
            { tag: "p", attr: { class: "approval-preview" }, text: previewText(comment) },
            {
                tag: "div",
                attr: { class: "approval-actions" },
                children: [
                    {
                        tag: "button",
                        attr: { class: "approval-deny", type: "button" },
                        text: "Deny",
                        events: { click: async () => { await decide(comment, "deny"); await reload(); } }
                    },
                    {
                        tag: "button",
                        attr: { class: "approval-approve", type: "button" },
                        text: "Approve",
                        events: { click: async () => { await decide(comment, "approve"); await reload(); } }
                    }
                ]
            }
        ]
    };
}

export async function renderApprovalsPanel(actualTab) {
    actualTab.innerHTML = "";
    actualTab.appendChild(GenesisEngine.manifest({
        tag: "div",
        attr: { class: "approval-loading" },
        text: "Gathering submitted sparks..."
    }));

    const payload = await fetchSubmissions();
    const submissions = normalizeSubmitted(payload);
    actualTab.innerHTML = "";

    if (payload?.error || !submissions.length) {
        actualTab.appendChild(GenesisEngine.manifest({
            tag: "div",
            attr: { class: "approval-empty" },
            children: [
                { tag: "div", attr: { class: "approval-empty-icon" }, text: "✓" },
                { tag: "h3", text: payload?.error?.message || payload?.error || "No submissions waiting." },
                { tag: "p", text: "When comments need approval, they will appear here instantly." }
            ]
        }));
        return;
    }

    actualTab.appendChild(GenesisEngine.manifest({
        tag: "section",
        attr: { class: "approval-queue" },
        children: [
            {
                tag: "header",
                attr: { class: "approval-hero" },
                children: [
                    { tag: "span", attr: { class: "approval-count" }, text: String(submissions.length) },
                    { tag: "div", children: [
                        { tag: "h2", text: "Approval Queue" },
                        { tag: "p", text: "Review submitted comments before they enter the living text." }
                    ] }
                ]
            },
            ...submissions.map(item => renderCard(item, () => renderApprovalsPanel(actualTab)))
        ]
    }));
}
