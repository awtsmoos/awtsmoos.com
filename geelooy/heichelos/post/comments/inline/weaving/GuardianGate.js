// B"H
/**
 * @module GuardianGate
 * @description
 * Chapter 302: The inline gate becomes quiet.
 *
 * The Awtsmoos asks for the comment to sit near the verse, not behind a parade
 * of repeated author names. This gate keeps one small toggle and a count; the
 * full light appears in the cards already present in the DOM.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

async function openSidebar(alias) {
    try {
        if (window.openCommentsPanelToAlias) return window.openCommentsPanelToAlias(alias, true, false);
        const { toggleSidebar } = await import("/heichelos/post/logic/listeners.js");
        toggleSidebar(true);
    } catch (error) {
        console.warn("B\"H - [GuardianGate] Sidebar opening failed; inline remains visible.", error);
    }
}

function cardsIn(gate) {
    return gate.querySelectorAll(".awtsmoos-inline-commentary-root, .inline-comment[data-cid]");
}

function countText(count) {
    if (count === 1) return "1 comment";
    return `${count} comments`;
}

function updateCount(gate) {
    const count = cardsIn(gate).length;
    const badge = gate.querySelector(".awtsmoos-inline-trigger-count");
    const sub = gate.querySelector(".awtsmoos-inline-trigger-subtitle");
    const button = gate.querySelector(".awtsmoos-inline-trigger");
    if (badge) badge.textContent = String(count);
    if (sub) sub.textContent = countText(count);
    if (button) button.setAttribute("aria-label", `Toggle ${countText(count)} for this verse`);
    return count;
}

function toggleInlineList(button, gate, list) {
    const isCollapsed = gate.classList.toggle("is-collapsed");
    button.setAttribute("aria-expanded", String(!isCollapsed));
    if (list) list.hidden = isCollapsed;
}

function previewBlueprint() {
    return {
        tag: "span",
        attr: { class: "awtsmoos-inline-trigger-copy" },
        children: [
            { tag: "strong", attr: { class: "awtsmoos-inline-trigger-title" }, children: ["Comments"] },
            { tag: "span", attr: { class: "awtsmoos-inline-trigger-subtitle" }, children: ["loading"] }
        ]
    };
}

export class GuardianGate {
    static build(alias, verseIdx, subIdx = null) {
        const gate = BlueprintManifestor.manifest({
            tag: "section",
            attr: {
                class: "commentator inline-holder awtsmoos-inline-shell",
                "data-alias": alias,
                "data-idx": verseIdx,
                ...(subIdx !== null && subIdx !== undefined ? { "data-sub": subIdx } : {}),
                role: "region",
                "aria-label": `Inline comments for this verse`
            },
            children: [
                {
                    tag: "button",
                    attr: {
                        class: "inline-summary-btn active awtsmoos-inline-trigger",
                        title: "Toggle inline comments",
                        type: "button",
                        "aria-expanded": "true"
                    },
                    children: [previewBlueprint(), { tag: "span", attr: { class: "awtsmoos-inline-trigger-count", "aria-label": "inline comment count" }, children: ["0"] }],
                    events: {
                        keydown: event => {
                            if (event.key !== "ArrowDown") return;
                            const firstCard = event.currentTarget.closest(".awtsmoos-inline-shell")?.querySelector(".awtsmoos-inline-commentary-root");
                            if (!firstCard) return;
                            event.preventDefault();
                            firstCard.setAttribute("tabindex", "-1");
                            firstCard.focus({ preventScroll: false });
                        },
                        click: event => {
                            event.stopPropagation();
                            const shell = event.currentTarget.closest(".awtsmoos-inline-shell");
                            const list = shell?.querySelector(".comments-holder-inline");
                            if (shell) toggleInlineList(event.currentTarget, shell, list);
                        },
                        dblclick: event => {
                            event.stopPropagation();
                            openSidebar(alias);
                        }
                    }
                },
                { tag: "div", attr: { class: "comments-holder-inline awtsmoos-inline-comments" } }
            ]
        });
        queueMicrotask(() => updateCount(gate));
        return gate;
    }

    static updateCount(gate) { return updateCount(gate); }
}
