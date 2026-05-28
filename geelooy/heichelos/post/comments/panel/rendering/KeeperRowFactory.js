/**
 * B"H
 * @module KeeperRowFactory
 * @chapter Forging the Seats of the Council
 * @description
 * A clear inline-comment control: no mystery checkbox, no silent state. The row
 * announces loading, empty, shown, and hidden based on the mutator result.
 */

import { BlueprintManifestor } from "../../../logic/manifestation/BlueprintManifestor.js";
import { isAliasInline } from "../../state.js";
import { toggleInlineForComments } from "../../inline.js";

export function createKeeperRow(alias, triggerAliasTab) {
    const isInline = isAliasInline(alias);
    const validAlias = alias || "guest";
    const initial = validAlias.charAt(0).toUpperCase();

    const blueprint = {
        tag: 'div',
        attr: { class: 'keeper-row awtsmoos-list-item', 'data-alias': validAlias },
        children:[
            {
                tag: 'button',
                attr: { class: 'keeper-portal-trigger', title: `Read sidebar insights of @${validAlias}`, type: 'button' },
                children:[
                    { tag: 'div', attr: { class: 'commentator-avatar' }, children:[initial] },
                    { tag: 'span', attr: { class: 'commentator-name' }, children: [`@${validAlias}`] }
                ],
                events: {
                    click: (e) => {
                        e.stopPropagation();
                        triggerAliasTab(validAlias);
                    }
                }
            },
            {
                tag: 'div',
                attr: { class: 'keeper-controls' },
                children:[
                    createInlineToggle(validAlias, isInline),
                    { tag: 'span', attr: { class: 'keeper-arrow' }, children: ['→'] }
                ]
            }
        ]
    };

    return BlueprintManifestor.manifest(blueprint);
}

function labelFor(result, fallbackVisible = false) {
    if (result?.hidden) return 'Show inline';
    if (result?.error) return 'Inline error';
    if (result?.empty) return 'No inline yet';
    if (result?.visible) return `Shown inline${result.inserted ? ` (${result.inserted})` : ''}`;
    return fallbackVisible ? 'Hide inline' : 'Show inline';
}

function setButtonState(button, result, fallbackVisible = false) {
    const visible = result?.visible ?? fallbackVisible;
    button.classList.remove('is-working', 'is-empty', 'is-error');
    button.classList.toggle('is-inline', !!visible && !result?.empty && !result?.error);
    button.classList.toggle('is-empty', !!result?.empty);
    button.classList.toggle('is-error', !!result?.error);
    button.setAttribute('aria-pressed', String(!!visible));
    const text = button.querySelector('.inline-toggle-text');
    if (text) text.textContent = labelFor(result, fallbackVisible);
    const detail = button.querySelector('.inline-toggle-detail');
    if (detail) {
        detail.textContent = result?.error
            ? 'Could not load'
            : result?.empty
                ? 'Nothing found on page'
                : result?.visible
                    ? 'Inserted into text'
                    : 'Sidebar only';
    }
}

function createInlineToggle(alias, isInline) {
    const labelText = isInline ? 'Hide inline' : 'Show inline';

    return {
        tag: 'button',
        attr: {
            class: `inline-toggle-altar ${isInline ? 'is-inline' : ''}`,
            title: `${labelText} comments for @${alias}`,
            type: 'button',
            'aria-pressed': String(isInline)
        },
        children:[
            {
                tag: 'span',
                attr: { class: 'inline-toggle-switch', 'aria-hidden': 'true' },
                children: [{ tag: 'span', attr: { class: 'inline-toggle-knob' } }]
            },
            {
                tag: 'span',
                attr: { class: 'inline-toggle-copy' },
                children: [
                    { tag: 'span', attr: { class: 'inline-toggle-text' }, children: [labelText] },
                    { tag: 'span', attr: { class: 'inline-toggle-detail' }, children: [isInline ? 'Inserted into text' : 'Sidebar only'] }
                ]
            }
        ],
        events: {
            click: async (e) => {
                e.stopPropagation();
                const button = e.currentTarget;
                button.classList.add('is-working');
                const text = button.querySelector('.inline-toggle-text');
                const detail = button.querySelector('.inline-toggle-detail');
                if (text) text.textContent = 'Loading…';
                if (detail) detail.textContent = 'Finding anchors';
                const result = await toggleInlineForComments([], alias);
                setButtonState(button, result);
            }
        }
    };
}
