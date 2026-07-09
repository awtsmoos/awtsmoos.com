// B"H
/**
 * @module FeedCard
 * @description Facebook-style feed card vessel with previewed verses.
 */
import { h } from './render.js';
export function FeedCard(post = {}, actions = {}) {
  const media = (post.assets || []).map(assetLabel).filter(Boolean).slice(0, 4);
  const comments = post.counts?.comments || 0;
  const reactions = post.counts?.reactions || 0;
  return h('article', cardProps(post), [
    h('header', { class: 'awt-card-head geelooy-feed-card-head' }, [
      h('span', { class: 'geelooy-avatar geelooy-feed-avatar' }, [initials(post.authorAlias)]),
      h('div', { class: 'geelooy-feed-byline' }, [
        h('strong', {}, [`@${post.authorAlias || 'anonymous'}`]),
        h('small', {}, [`${post.heichelId || 'global'} · ${label(post.type || 'post')}`])
      ])
    ]),
    h('h3', { class: 'geelooy-feed-title' }, [titleLink(post)]),
    h('p', { class: 'geelooy-feed-summary' }, [post.summary || 'A vessel waits for words.']),
    h('section', { class: 'geelooy-section-preview', 'data-section-preview': 'true' }, previewSections(post)),
    h('div', { class: 'awt-media-row geelooy-feed-meta' }, metaPills(post, media)),
    h('footer', { class: 'awt-card-actions geelooy-feed-actions' }, [
      h('button', { class: 'awt-btn', type: 'button', 'data-read-more': post.id || '', onclick: () => actions.onReadMore?.(post) }, ['Read more']),
      h('button', { class: 'awt-btn', type: 'button', onclick: () => actions.onComment?.(post) }, [`Comment (${comments})`]),
      h('button', { class: 'awt-btn', type: 'button', onclick: () => actions.onSave?.(post) }, ['Save']),
      h('button', { class: 'awt-btn', type: 'button', onclick: () => actions.onShare?.(post) }, [`Share${reactions ? ` · ${reactions}` : ''}`])
    ])
  ]);
}
function cardProps(post) { return { class:'awt-card geelooy-feed-card-core', 'data-content-id':post.contentId || '', 'data-feed-type':post.type || 'post' }; }
function titleLink(post) { return post.href ? h('a', { href:post.href }, [post.title || 'Untitled revelation']) : post.title || 'Untitled revelation'; }
function previewSections(post) {
  const sections = (post.sections || []).slice(0, 2);
  if (!sections.length) return [h('button', { type:'button', 'data-read-more':post.id || '' }, ['Open verses'])];
  return sections.map((section, index) => h('button', { type:'button', 'data-read-more':post.id || '', 'data-preview-section':section.id || index }, [
    h('span', {}, [`Verse ${index + 1}`]), h('strong', {}, [section.label || section.title || `Section ${index + 1}`]), h('small', {}, [section.text || section.content || post.summary || 'Read more'])
  ]));
}
function metaPills(post, media) { return [post.seriesId ? `Series: ${post.seriesId}` : '', ...media].filter(Boolean).map(item => h('span', { class:'awt-media-pill' }, [item])); }
function assetLabel(asset) { return asset?.label || asset?.kind || asset?.name || asset?.type || String(asset || ''); }
function initials(name = 'G') { return String(name).trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'G'; }
function label(type) { return String(type).replace(/-/g, ' ').replace(/^./, letter => letter.toUpperCase()); }
