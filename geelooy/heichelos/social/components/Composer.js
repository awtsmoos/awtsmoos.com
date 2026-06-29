// B"H
/**
 * @module Composer
 * @description Chapter 182: the simple home box hides an orchestra: choose your
 * profile Heichel by default, find others quickly, then unfold verses, images,
 * subsections, and comment targets when the soul asks for depth.
 */
import { h } from './render.js';
import { createDraft } from '../composer/composerDraft.js';
export function Composer(draftInput = {}) {
  const draft = createDraft(draftInput);
  const verses = draft.verses.map(verse => ({
    ...verse,
    assets: [
      ...verse.assets,
      ...draft.assets.filter(asset => asset.verseSection === verse.verseSection || asset.sectionId === verse.verseSection)
    ]
  }));
  return h('form', { class: 'awt-panel awt-composer', id: 'composer', onsubmit: draftInput.onSubmit }, [
    h('div', { class: 'awt-section-meta' }, [h('span', { class: 'awt-chip' }, [`Posting as: ${draft.aliasId || 'alias'}`]), h('span', { class: 'awt-chip' }, [`Default: ${draft.heichelId || 'profile Heichel'}`]), h('span', { class: 'awt-chip' }, [`Series: ${draft.seriesId}`])]),
    h('input', { name: 'title', placeholder: 'What are you revealing?', value: draft.title }),
    targetPicker(draft),
    h('textarea', { name: 'root', rows: '3', placeholder: 'Root thought. Add verses below when needed.' }, [draft.verses[0]?.body || '']),
    h('details', { class: 'awt-hidden-drums' }, [h('summary', {}, ['Verses, images, subsections, comments']), ...verses.map(verseEditor), h('div', { class: 'awt-comment-map' }, ['Comments supported at root, per verse, and per subsection.'])]),
    h('div', { class: 'awt-composer-actions' }, [
      h('button', { class: 'awt-btn primary', type: 'submit' }, ['Submit for review / publish']),
      h('button', { class: 'awt-btn', type: 'button', onclick: draftInput.onAddSection }, ['Add section']),
      h('button', { class: 'awt-btn', type: 'button', onclick: draftInput.onRefresh }, ['Refresh feed'])
    ]),
    draftInput.status ? h('p', { class: `awt-status ${draftInput.statusKind || ''}`, role: 'status' }, [draftInput.status]) : ''
  ]);
}
function targetPicker(draft) { return h('section', { class: 'awt-target-picker' }, [h('label', {}, ['Share to Heichelos']), h('input', { name: 'heichelSearch', placeholder: 'Find a Heichel to share into...' }), h('div', { class: 'awt-target-list' }, draft.targets.map(t => h('label', { class: 'awt-chip' }, [h('input', { type: 'checkbox', name: 'targetHeichelIds', value: t.heichelId, checked: 'checked' }), ` ${t.label || t.heichelId}`]))) ]); }
function verseEditor(verse) { return h('section', { class: 'awt-composer-section', 'data-verse-section': verse.verseSection }, [h('div', { class: 'awt-section-meta' }, [h('span', { class: 'awt-chip' }, [`Verse ${verse.verseSection}`]), h('span', { class: 'awt-chip' }, [`${verse.subsections.length} subsections`])]), h('input', { name: `${verse.verseSection}-title`, placeholder: 'Verse title', value: verse.title }), h('textarea', { name: `${verse.verseSection}-body`, rows: '4', placeholder: 'Verse text...' }, [verse.body]), assetLane(verse.assets), h('div', { class: 'awt-dropzone' }, [`Attach image, audio, or file to ${verse.verseSection}`]), ...verse.subsections.map(sub => h('div', { class: 'awt-subsection', 'data-subsection-id': sub.id }, [h('input', { value: sub.title, placeholder: 'Subsection title' }), h('textarea', { rows: '3' }, [sub.content]), assetLane(sub.assets)]))]); }
function assetLane(assets) { if (!assets.length) return h('div', { class: 'awt-asset-row' }, [h('span', { class: 'awt-asset-pill' }, ['No assets yet'])]); return h('div', { class: 'awt-asset-row' }, assets.map(asset => h('span', { class: 'awt-asset-pill' }, [`${asset.kind}: ${asset.label}`]))); }
