// B"H
/**
 * @module GuardianGate
 * @description
 * Chapter 86: The gateway stops shouting sideways.
 *
 * This is the visible inline commentary doorway. It deliberately emits no
 * inline styles. The Awtsmoos lets CSS own layout, so every inline insight is a
 * vertical readable chamber instead of a cramped horizontal artifact.
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

function updateCount(gate) {
    const count = cardsIn(gate).length;
    const badge = gate.querySelector(".awtsmoos-inline-trigger-count");
    if (badge) badge.textContent = String(count);
    const noun = count === 1 ? "insight" : "insights";
    const sub = gate.querySelector(".awtsmoos-inline-trigger-subtitle");
    if (sub) sub.textContent = `${count} inline ${noun}`;
    const button = gate.querySelector(".awtsmoos-inline-trigger");
    if (button) button.setAttribute("aria-label", `Toggle ${count} inline ${noun} for @${gate.dataset.alias || "commentator"}`);
    return count;
}

function toggleInlineList(button, gate, list) {
    const isCollapsed = gate.classList.toggle("is-collapsed");
    button.setAttribute("aria-expanded", String(!isCollapsed));
    if (list) list.hidden = isCollapsed;
}

function previewBlueprint(alias) {
    return {
        tag: "div",
        attr: { class: "awtsmoos-inline-trigger-copy" },
        children: [
            { tag: "span", attr: { class: "awtsmoos-inline-trigger-title" }, children: ["Inline Commentary"] },
            { tag: "span", attr: { class: "awtsmoos-inline-trigger-subtitle" }, children: [`@${alias}`] },
            { tag: "span", attr: { class: "awtsmoos-inline-trigger-preview" }, children: ["Tap to reveal insights below."] },
            { tag: "span", attr: { class: "awtsmoos-inline-trigger-meta" }, children: [`@${alias} · ready`] }
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
                "aria-label": `Inline commentary by ${alias}`
            },
            children: [
                {
                    tag: "button",
                    attr: {
                        class: "inline-summary-btn active awtsmoos-inline-trigger",
                        title: `Toggle inline insights for ${alias}`,
                        type: "button",
                        "aria-expanded": "true"
                    },
                    children: [
                        { tag: "span", attr: { class: "awtsmoos-inline-trigger-sigil" }, children: ["✦"] },
                        previewBlueprint(alias),
                        { tag: "span", attr: { class: "awtsmoos-inline-trigger-count", "aria-label": "inline comment count" }, children: ["0"] }
                    ],
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

    static updateCount(gate) {
        return updateCount(gate);
    }
}
