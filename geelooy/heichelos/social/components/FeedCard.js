// B"H
/** Compact premium card with recovered animator-style character avatar. */
import { h } from './render.js';
import { FeedCharacter } from './FeedCharacter.js';
export function FeedCard(post = {}) {
  const name = displayName(post.authorAlias);
  const hasVerses = (post.sections || []).some(s => s?.text || s?.content || s?.summary);
  const body = shouldShowSummary(post) ? [h('p', { class:'geelooy-feed-summary' }, [post.summary])] : [];
  return h('article', cardProps(post), [
    h('header', { class:'awt-card-head geelooy-feed-card-head' }, [
      FeedCharacter({ name, seed:`${post.authorAlias || ''}:${post.id || ''}` }),
      h('div', { class:'geelooy-feed-byline' }, [h('strong', {}, [name]), h('small', {}, [displayContext(post)])])
    ]),
    h('h3', { class:'geelooy-feed-title' }, [titleLink(post)]),
    ...body,
    h('div', { class:'geelooy-feed-meta-line' }, metaItems(post, hasVerses))
  ]);
}
function cardProps(post) { return { class:'awt-card geelooy-feed-card-core', 'data-content-id':post.contentId || '', 'data-feed-type':post.type || 'post' }; }
function titleLink(post) { const title = clean(post.title) || 'Untitled post'; return post.href ? h('a', { href:post.href }, [title]) : title; }
function shouldShowSummary(post) { const t = clean(post.title).toLowerCase(); const s = clean(post.summary).toLowerCase(); return s && s !== t && s !== 'a vessel waits for words.'; }
function metaItems(post, hasVerses) {
  const items = [];
  if (hasVerses) items.push(h('button', { type:'button', class:'geelooy-verse-chip', 'data-read-more':post.id || '' }, ['Read verses']));
  if (post.counts?.comments) items.push(h('span', { class:'awt-media-pill' }, [`${post.counts.comments} comments`]));
  if (post.counts?.reactions) items.push(h('span', { class:'awt-media-pill' }, [`${post.counts.reactions} reactions`]));
  return items;
}
function displayName(value = '') { const v = clean(value); if (!v || uglyId(v)) return 'Geelooy User'; return v.replace(/^@/, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 38); }
function displayContext(post) { const hId = clean(post.heichelId || 'Ikar'); const room = uglyId(hId) ? 'Ikar' : titleCase(hId.replace(/[_-]+/g, ' ')); return `${room} · ${label(post.type || 'post')}`; }
function titleCase(text = '') { return String(text).replace(/\b\w/g, l => l.toUpperCase()); }
function uglyId(text = '') { return /^afm[a-z0-9_]{6,}/i.test(text) || /^[a-z0-9_]{14,}$/i.test(text) || text.includes('_own') || text.includes('_heich'); }
function label(type) { return String(type).replace(/-/g, ' ').replace(/^./, letter => letter.toUpperCase()); }
function clean(value = '') { return String(value).replace(/<[^>]*>/g, '').trim(); }
