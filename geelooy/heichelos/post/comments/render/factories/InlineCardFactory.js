/**
 * B"H
 * @module InlineCardFactory
 * @chapter The Secret Note in the Margin
 * @description
 * A premium inline comment card: readable, focused, labeled, and action-ready.
 * The margin should feel like a revealed chamber, not a raw debug dump.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { expandPathToComment } from "../tree.js";

function getAlias(comment) {
    return comment?.author || comment?.aliasId || comment?.owner || "commentator";
}

function getTitle(comment) {
    return comment?.dayuh?.title || comment?.content?.title || comment?.title || "Inline insight";
}

function getCoordinateLabel(comment) {
    const dayuh = comment?.dayuh || {};
    const verse = dayuh.verseSection ?? comment?.verseSection;
    const sub = dayuh.subSection ?? comment?.subSection ?? comment?.sub;
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`Verse ${Number(verse) + 1}`);
    if (sub !== undefined && sub !== null && sub !== "main") parts.push(`Paragraph ${Number(sub) + 1}`);
    return parts.length ? parts.join(" · ") : "Post-wide insight";
}

function cardStyle() {
    return [
        "position:relative",
        "overflow:hidden",
        "border-radius:22px",
        "border:1px solid rgba(148,163,184,.24)",
        "background:linear-gradient(135deg, rgba(255,255,255,.98), rgba(248,250,252,.94))",
        "box-shadow:0 16px 45px rgba(15,23,42,.14)",
        "color:#0f172a",
        "padding:0",
        "isolation:isolate"
    ].join(";");
}

function headerStyle() {
    return [
        "display:flex",
        "align-items:center",
        "gap:12px",
        "padding:14px 16px",
        "background:linear-gradient(135deg, rgba(99,102,241,.12), rgba(14,165,233,.10))",
        "border-bottom:1px solid rgba(148,163,184,.20)"
    ].join(";");
}

function avatarStyle() {
    return [
        "width:38px",
        "height:38px",
        "border-radius:999px",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "background:linear-gradient(135deg,#7c3aed,#06b6d4)",
        "color:white",
        "font-weight:900",
        "box-shadow:0 8px 18px rgba(124,58,237,.28)",
        "flex:0 0 auto"
    ].join(";");
}

function focusButtonStyle() {
    return [
        "border:0",
        "border-radius:999px",
        "padding:8px 11px",
        "background:#0f172a",
        "color:white",
        "font-weight:800",
        "cursor:pointer",
        "box-shadow:0 8px 18px rgba(15,23,42,.22)",
        "transition:transform .18s ease, box-shadow .18s ease"
    ].join(";");
}

export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");
    const alias = getAlias(comment);
    const title = getTitle(comment);
    const coordinate = getCoordinateLabel(comment);

    const blueprint = {
        tag: 'article',
        attr: {
            class: 'inline-comment intense-marginalia awtsmoos-inline-commentary-root awtsmoos-inline-card-v2',
            'data-cid': comment.id,
            'data-alias': alias,
            style: cardStyle()
        },
        children: [
            {
                tag: 'div',
                attr: { class: 'awtsmoos-inline-card-aura', 'aria-hidden': 'true', style: 'position:absolute;inset:-40%;background:radial-gradient(circle at top right, rgba(14,165,233,.18), transparent 36%);z-index:-1;' }
            },
            {
                tag: 'header',
                attr: { class: 'awtsmoos-inline-card-header', style: headerStyle() },
                children: [
                    { tag: 'div', attr: { class: 'awtsmoos-inline-avatar', style: avatarStyle() }, children: [String(alias).charAt(0).toUpperCase()] },
                    {
                        tag: 'div',
                        attr: { style: 'display:flex;flex-direction:column;min-width:0;flex:1;' },
                        children: [
                            { tag: 'strong', attr: { style: 'font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' }, children: [title] },
                            { tag: 'span', attr: { style: 'font-size:12px;color:#475569;font-weight:700;margin-top:3px;' }, children: [`@${alias} · ${coordinate}`] }
                        ]
                    },
                    {
                        tag: 'button',
                        attr: { class: 'focus-trigger awtsmoos-inline-focus', title: 'Open this comment in the sidebar', style: focusButtonStyle() },
                        children: ['↗'],
                        events: {
                            mouseenter: e => e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)',
                            mouseleave: e => e.currentTarget.style.transform = 'translateY(0) scale(1)',
                            click: e => handleMarginalFocus(e, comment)
                        }
                    }
                ]
            },
            {
                tag: 'div',
                attr: { class: 'comment-body-vessel awtsmoos-inline-body', style: 'padding:16px 18px;font-size:15px;line-height:1.68;' },
                ref: 'body'
            }
        ]
    };

    const manifest = BlueprintManifestor.manifest(blueprint);
    const body = manifest.querySelector('.comment-body-vessel');
    populateCommentElement(comment, body);
    return manifest;
}

async function handleMarginalFocus(e, comment) {
    e.stopPropagation();
    if (!window.openCommentsPanelToAlias) return;
    const alias = getAlias(comment);
    const container = await window.openCommentsPanelToAlias(alias);
    if (container) {
        setTimeout(() => {
            const safeId = String(comment.id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const target = container.querySelector(`.comment-content[data-cid="${safeId}"]`);
            if (!target) return;
            expandPathToComment(target);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('pulse-of-light');
            setTimeout(() => target.classList.remove('pulse-of-light'), 2000);
        }, 400);
    }
}
