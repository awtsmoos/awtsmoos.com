// B"H
/**
 * @module Composer
 * @description
 * Chapter 59: The composer is no longer a blank mouth.
 * The Awtsmoos gives it sections, assets, heichel, series, visibility, and
 * publish intent, so every future post can be built as a living structure.
 */
import { h } from './render.js';
import { createDraft } from '../composer/composerDraft.js';

export function Composer(draftInput = {}) {
    const draft = createDraft(draftInput);
    return h('form', { class: 'awt-panel awt-composer', id: 'composer' }, [
        h('div', { class: 'awt-section-meta' }, [
            h('span', { class: 'awt-chip' }, [`Kind: ${draft.kind}`]),
            h('span', { class: 'awt-chip' }, [`Heichel: ${draft.heichelId || 'unassigned'}`]),
            h('span', { class: 'awt-chip' }, [`Series: ${draft.seriesId || 'none'}`]),
            h('span', { class: 'awt-chip' }, [`Visibility: ${draft.visibility}`])
        ]),
        h('input', { name: 'title', placeholder: 'Title of the revelation', value: draft.title }),
        ...draft.sections.map(section => sectionEditor(section, draft.assets)),
        h('button', { class: 'awt-btn primary', type: 'submit' }, ['Publish / Submit'])
    ]);
}

function sectionEditor(section, assets) {
    const sectionAssets = assets.filter(asset => asset.sectionId === section.sectionId);
    return h('section', { class: 'awt-composer-section', 'data-section-id': section.sectionId }, [
        h('div', { class: 'awt-section-meta' }, [
            h('span', { class: 'awt-chip' }, [`${section.sectionId}`]),
            h('span', { class: 'awt-chip' }, [`Order: ${section.order}`])
        ]),
        h('input', { name: `${section.sectionId}-title`, placeholder: 'Section title', value: section.title }),
        h('textarea', { name: `${section.sectionId}-body`, rows: '5', placeholder: 'Write this section...' }, [section.body]),
        assetLane(sectionAssets),
        h('div', { class: 'awt-dropzone' }, [`Attach image, audio, or file to ${section.sectionId}`])
    ]);
}

function assetLane(assets) {
    if (!assets.length) return h('div', { class: 'awt-asset-row' }, [h('span', { class: 'awt-asset-pill' }, ['No assets yet'])]);
    return h('div', { class: 'awt-asset-row' }, assets.map(asset => h('span', { class: 'awt-asset-pill' }, [`${asset.kind}: ${asset.label}`])));
}
