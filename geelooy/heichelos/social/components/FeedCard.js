// B"H
/**
 * @module FeedCard
 * @description One compact premium social card. The feed shows the post; the
 * viewer carries the full verse/comment depth.
 */
import { h } from './render.js';
export function FeedCard(post = {}) {
  const hasVerses = (post.sections || []).some(section => section?.text || section?.content || section?.summary);
  const body = shouldShowSummary(post) ? [h('p', { class: 'geelooy-feed-summary' }, [post.summary])] : [];
  return h('article', cardProps(post), [
    h('header', { class: 'awt-card-head geelooy-feed-card-head' }, [
      h('span', { class: 'geelooy-avatar geelooy-feed-avatar' }, [initials(displayName(post.authorAlias))]),
      h('div', { class: 'geelooy-feed-byline' }, [
        h('strong', {}, [displayName(post.authorAlias)]),
        h('small', {}, [displayContext(post)])
      ])
    ]),
    h('h3', { class: 'geelooy-feed-title' }, [titleLink(post)]),
    ...body,
    h('div', { class: 'geelooy-feed-meta-line' }, metaItems(post, hasVerses))
  ]);
}
function cardProps(post) { return { class:'awt-card geelooy-feed-card-core', 'data-content-id':post.contentId || '', 'data-feed-type':post.type || 'post' }; }
function titleLink(post) { return post.href ? h('a', { href:post.href }, [clean(post.title) || 'Untitled post']) : clean(post.title) || 'Untitled post'; }
function shouldShowSummary(post) {
  const title = clean(post.title).toLowerCase();
  const summary = clean(post.summary).toLowerCase();
  return summary && summary !== title && summary !== 'a vessel waits for words.';
}
function metaItems(post, hasVerses) {
  const items = [];
  if (hasVerses) items.push(h('button', { type:'button', class:'geelooy-verse-chip', 'data-read-more':post.id || '' }, ['Read verses']));
  if (post.counts?.comments) items.push(h('span', { class:'awt-media-pill' }, [`${post.counts.comments} comments`]));
  if (post.counts?.reactions) items.push(h('span', { class:'awt-media-pill' }, [`${post.counts.reactions} reactions`]));
  return items;
}
function displayName(value = '') {
  const cleanValue = clean(value);
  if (!cleanValue || uglyId(cleanValue)) return 'Geelooy User';
  return cleanValue.replace(/^@/, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 38);
}
function displayContext(post) {
  const heichel = clean(post.heichelId || 'Ikar');
  const room = uglyId(heichel) ? 'Ikar' : titleCase(heichel.replace(/[_-]+/g, ' '));
  return `${room} · ${label(post.type || 'post')}`;
}
function titleCase(text = '') { return String(text).replace(/\b\w/g, l => l.toUpperCase()); }
function uglyId(text = '') { return /^afm[a-z0-9_]{6,}/i.test(text) || /^[a-z0-9_]{14,}$/i.test(text) || text.includes('_own') || text.includes('_heich'); }
function initials(name = 'G') { return String(name).trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'G'; }
function label(type) { return String(type).replace(/-/g, ' ').replace(/^./, letter => letter.toUpperCase()); }
function clean(value = '') { return String(value).replace(/<[^>]*>/g, '').trim(); }
