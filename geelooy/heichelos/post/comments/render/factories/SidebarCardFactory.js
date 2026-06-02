/**
 * B"H
 * @module SidebarCardFactory
 * @chapter The Assembly of the Insight-Tabernacle
 * @description
 * The sidebar is the repository of history and collective wisdom. This factory
 * creates the primary card through which seekers read, reply, locate, share,
 * copy, and jump to the profile behind a full transmission.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { handleMenuOption } from "../actions.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { expandPathToComment } from "../tree.js";

/**
 * B"H
 * @function makeHTMLFromComment
 * @description
 * Manifests a sidebar comment card from raw comment JSON, including the author
 * profile gate and the full comment-tree action strip.
 * @param {Object} comment - The comment record from old or new readers.
 * @returns {HTMLElement|Comment} The manifested card or silence.
 */
export function makeHTMLFromComment(comment) {
    if (!comment) return document.createComment("Silence");

    const blueprint = {
        tag: 'div',
        attr: { class: 'comment-content awtsmoos-card', 'data-cid': comment.id, id: `comment-${comment.id}` },
        children: [
            createMetaRow(comment),
            {
                tag: 'div',
                attr: { class: 'comment-text-root' },
                ref: 'textContainer'
            },
            {
                tag: 'div',
                attr: { class: 'comment-toolbar' },
                children: [
                    createLocateBtn(comment),
                    createActionStrip(comment),
                    createActionMenu(comment)
                ]
            }
        ]
    };

    const manifest = BlueprintManifestor.manifest(blueprint);
    const textTarget = manifest.querySelector('.comment-text-root');
    populateCommentElement(comment, textTarget);
    return manifest;
}

/**
 * B"H
 * @function createMetaRow
 * @description Creates the profile-facing identity row for the comment author.
 * @param {Object} comment - The comment record.
 * @returns {Object} Blueprint for the meta row.
 */
function createMetaRow(comment) {
    const alias = comment.author || comment.aliasId || "";
    return {
        tag: 'div',
        attr: { class: 'comment-meta-row' },
        children: [
            {
                tag: 'a',
                attr: { class: 'comment-author-link', href: alias ? `/@${encodeURIComponent(alias)}` : '/profile', target: '_blank' },
                children: [alias ? `@${alias}` : '@unknown']
            },
            {
                tag: 'button',
                attr: { class: 'comment-chip-action', type: 'button', title: 'Copy profile link' },
                children: ['Profile'],
                events: { click: async e => {
                    e.stopPropagation();
                    await copyText(`${location.origin}/@${encodeURIComponent(alias)}`);
                }}
            }
        ]
    };
}

/**
 * B"H
 * @function createActionStrip
 * @description Builds first-class reply/share/copy controls visible on every card.
 * @param {Object} comment - The comment record.
 * @returns {Object} Blueprint for the action strip.
 */
function createActionStrip(comment) {
    return {
        tag: 'div',
        attr: { class: 'comment-action-strip' },
        children: [
            makeChip('Reply', e => handleMenuOption('Reply', comment, e.target)),
            makeChip('Share', () => shareComment(comment)),
            makeChip('Copy', e => handleMenuOption('Copy', comment, e.target))
        ]
    };
}

function makeChip(label, action) {
    return {
        tag: 'button',
        attr: { class: 'comment-chip-action', type: 'button', title: label },
        children: [label],
        events: { click: async e => {
            e.stopPropagation();
            await action(e);
        }}
    };
}

async function shareComment(comment) {
    const link = `${location.origin}${location.pathname}${location.search}#comment-${encodeURIComponent(comment.id || '')}`;
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Awtsmoos insight', text: comment.content || '', url: link });
            return;
        } catch (_) {}
    }
    await copyText(link);
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    }
}

function createLocateBtn(comment) {
    if (!isAliasInline(comment.author)) return null;
    return {
        tag: 'button',
        attr: { class: 'btn small locate-trigger', style: 'text-transform: none !important;' },
        children: ['Locate'],
        events: { click: e => {
            e.stopPropagation();
            const inlineEl = document.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
            if (inlineEl) {
                expandPathToComment(inlineEl);
                inlineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inlineEl.classList.add('signal-active');
            }
        }}
    };
}

function createActionMenu(comment) {
    return {
        tag: 'div',
        attr: { class: 'menu-chariot awtsmoos-list-item' },
        children: [
            { tag: 'button', attr: { class: 'menu-btn btn', type: 'button', title: 'More actions' }, children: ['...'] },
            {
                tag: 'div',
                attr: { class: 'menu-dropdown hidden' },
                children: ['Reply', 'Copy', 'Delete'].map(opt => ({
                    tag: 'div',
                    attr: { class: 'menu-item awtsmoos-list-item', style: 'text-transform: none !important;' },
                    children: [opt],
                    events: { click: e => {
                        e.stopPropagation();
                        handleMenuOption(opt, comment, e.target);
                    }}
                }))
            }
        ],
        events: { click: e => {
            const drop = e.currentTarget.querySelector('.menu-dropdown');
            drop.classList.toggle('hidden');
        }}
    };
}
