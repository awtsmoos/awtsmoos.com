//B"H
/**
 * @file approvals.js
 * @description
 * Event-aware approval queue with optimistic moderation flows.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { emitAwtsmoosEvent } from "../state/eventBus.js";
import { approvalCoordinate, navigateApprovalCoordinate } from "./coordinateNavigator.js";
import { approvalFilterOptions, approvalPassesFilter } from "./approvalFilters.js";

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

function coordinateFor(comment) {
    return approvalCoordinate(comment);
}

async function decide(comment, action) {
    const commentId = comment.id || comment.commentId;
    const aliasId = activeAlias();
    const coordinate = coordinateFor(comment);
    const url = `/api/social/heichelos/${window.post?.heichel?.id}/submittedComments/${action}`;

    const res = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({ aliasId, commentId })
    });

    const json = await res.json();

    if (!json?.error && window.commentLogic?.handleNewComment && action === "approve") {
        await window.commentLogic.handleNewComment({ aliasId, coordinate });
    }

    emitAwtsmoosEvent(action === "approve" ? "comment:approved" : "comment:denied", {
        aliasId,
        commentId,
        coordinate,
        response: json
    });

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

function setCardLoading(card, loading, label = "") {
    card.dataset.loading = loading ? "true" : "false";
    card.querySelectorAll("button").forEach(button => {
        button.disabled = loading;
        if (loading && label) button.dataset.originalText = button.textContent;
        if (loading && button.classList.contains(`approval-${label}`)) {
            button.textContent = `${label}ing...`;
        } else if (!loading && button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    });
}

function navigateToCoordinate(comment) {
    navigateApprovalCoordinate(comment);
}

async function optimisticDecision({ comment, action, card, list }) {
    const nextSibling = card.nextSibling;
    const parent = card.parentNode;

    setCardLoading(card, true, action);
    card.remove();

    try {
        const result = await decide(comment, action);
        if (result?.error) throw new Error(result.error.message || result.error);
        emitAwtsmoosEvent("approval:queue:changed", { action, comment });
    } catch (error) {
        if (nextSibling) {
            parent.insertBefore(card, nextSibling);
        } else {
            parent.appendChild(card);
        }
        setCardLoading(card, false);
        console.error('B"H approval mutation failed', error);
        emitAwtsmoosEvent("approval:queue:error", { action, comment, error });
    }

    if (!list.children.length) {
        list.appendChild(GenesisEngine.manifest({
            tag: "div",
            attr: { class: "approval-empty-inline" },
            text: "All visible submissions resolved."
        }));
    }
}

function renderFilterControls(state, rerender) {
    return {
        tag: "div",
        attr: { class: "approval-filters", role: "group", "aria-label": "Approval filters" },
        children: approvalFilterOptions().map(option => ({
            tag: "button",
            attr: {
                type: "button",
                class: option.id === state.filter ? "approval-filter active" : "approval-filter",
                "data-filter": option.id
            },
            text: option.label,
            events: {
                click: () => {
                    state.filter = option.id;
                    rerender();
                }
            }
        }))
    };
}

function renderCard(comment, list) {
    const commentId = comment.id || comment.commentId;

    return {
        tag: "article",
        attr: {
            class: "approval-card awtsmoos-list-item",
            "data-comment-id": commentId || ""
        },
        events: {
            click: event => {
                if (event.target.closest("button")) return;
                navigateToCoordinate(comment);
            }
        },
        children: [
            {
                tag: "div",
                attr: { class: "approval-card-top" },
                children: [
                    {
                        tag: "div",
                        attr: { class: "approval-author" },
                        text: `@${comment.aliasId || comment.author || "unknown"}`
                    },
                    {
                        tag: "div",
                        attr: { class: "approval-coordinate" },
                        text: coordinateText(comment)
                    }
                ]
            },
            {
                tag: "p",
                attr: { class: "approval-preview" },
                text: previewText(comment)
            },
            {
                tag: "div",
                attr: { class: "approval-actions" },
                children: [
                    {
                        tag: "button",
                        attr: { class: "approval-deny", type: "button" },
                        text: "Deny",
                        events: {
                            click: async event => {
                                event.stopPropagation();
                                await optimisticDecision({
                                    comment,
                                    action: "deny",
                                    card: event.currentTarget.closest("article"),
                                    list
                                });
                            }
                        }
                    },
                    {
                        tag: "button",
                        attr: { class: "approval-approve", type: "button" },
                        text: "Approve",
                        events: {
                            click: async event => {
                                event.stopPropagation();
                                await optimisticDecision({
                                    comment,
                                    action: "approve",
                                    card: event.currentTarget.closest("article"),
                                    list
                                });
                            }
                        }
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

    const state = { filter: "all" };
    let list;

    const mountCards = () => {
        const cards = submissions.filter(item => approvalPassesFilter(item, state.filter, coordinateFor));
        list.querySelectorAll(".approval-card, .approval-empty-inline").forEach(node => node.remove());
        cards
            .map(item => GenesisEngine.manifest(renderCard(item, list)))
            .forEach(card => list.appendChild(card));

        if (!cards.length) {
            list.appendChild(GenesisEngine.manifest({
                tag: "div",
                attr: { class: "approval-empty-inline" },
                text: "No submissions match this filter."
            }));
        }
    };

    list = GenesisEngine.manifest({
        tag: "section",
        attr: { class: "approval-queue" },
        children: [
            {
                tag: "header",
                attr: { class: "approval-hero" },
                children: [
                    {
                        tag: "span",
                        attr: { class: "approval-count" },
                        text: String(submissions.length)
                    },
                    {
                        tag: "div",
                        children: [
                            { tag: "h2", text: "Approval Queue" },
                            { tag: "p", text: "Review submitted comments before they enter the living text." }
                        ]
                    }
                ]
            },
            renderFilterControls(state, mountCards)
        ]
    });

    mountCards();
    actualTab.appendChild(list);
}
