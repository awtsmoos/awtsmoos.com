// B"H
/**
 * @module NormalizeFeedObject
 * @description One covenant for all feed objects, with ugly ids turned into
 * readable social titles before they ever reach the card.
 */
export function normalizeFeedObject(input = {}, fallback = {}) {
  const raw = input.raw || input;
  const type = normalizeType(input.type || raw.kind || raw.type || raw.objectType || fallback.type);
  const id = string(input.id || raw.id || raw.postId || raw.seriesId || raw.mediaId || raw.bookmarkId || raw.key || `${type}-${Date.now()}`);
  const heichelId = string(input.heichelId || raw.heichelId || raw.target?.heichelId || fallback.heichelId || '');
  const authorAlias = string(input.authorAlias || input.author || raw.authorAlias || raw.aliasId || raw.author || raw.actor?.id || 'Geelooy');
  const summary = readableSummary(input.summary || raw.summary || raw.description || raw.excerpt || raw.text || raw.content || raw.dayuh?.content || 'A vessel waits for words.');
  const rawTitle = string(input.title || raw.title || raw.name || raw.subject || '');
  const title = readableTitle(rawTitle, summary, authorAlias, id, type);
  return {
    id,
    type,
    contentId: string(input.contentId || raw.contentId || raw.postId || id),
    title,
    summary,
    authorAlias,
    heichelId: heichelId || 'global',
    seriesId: string(input.seriesId || raw.seriesId || 'root'),
    href: input.href || raw.href || hrefFor({ id, type, heichelId, seriesId: raw.seriesId }),
    assets: array(input.assets || raw.assets || raw.media || raw.attachments),
    sections: array(input.sections || raw.sections || raw.verses),
    counts: input.counts || raw.counts || countShape(raw),
    raw
  };
}
export const FEED_TYPES = ['post','question','announcement','collection','media','event','series','bookmark'];
function normalizeType(type = 'post') {
  const text = string(type).toLowerCase();
  if (text.includes('question')) return 'question';
  if (text.includes('announce')) return 'announcement';
  if (text.includes('collection')) return 'collection';
  if (text.includes('media') || text.includes('image') || text.includes('video')) return 'media';
  if (text.includes('event')) return 'event';
  if (text.includes('series')) return 'series';
  if (text.includes('bookmark')) return 'bookmark';
  return 'post';
}
function readableTitle(title, summary, alias, id, type) {
  const clean = stripHtml(title);
  if (clean && !looksGenerated(clean, alias, id)) return capitalize(clean.slice(0, 96));
  const fromSummary = firstPhrase(summary);
  return fromSummary ? capitalize(fromSummary) : labelFor(type);
}
function readableSummary(value) {
  const text = stripHtml(value).replace(/\s+/g, ' ').trim();
  return text || 'A vessel waits for words.';
}
function looksGenerated(title, alias, id) {
  const low = title.toLowerCase();
  return low === string(alias).toLowerCase()
    || low === string(id).toLowerCase()
    || /^afm[a-z0-9_]{6,}/i.test(title)
    || /^[a-z0-9_]{11,}$/i.test(title)
    || /^ikar-[0-9]+$/i.test(title);
}
function firstPhrase(text = '') {
  const clean = stripHtml(text).replace(/\s+/g, ' ').trim();
  return clean.split(/[.!?\n]/).find(Boolean)?.trim().slice(0, 88) || '';
}
function hrefFor(object) {
  if (object.type === 'series') return `/heichelos/${enc(object.heichelId || 'ikar')}/series/${enc(object.seriesId || object.id)}`;
  if (object.heichelId) return `/heichelos/${enc(object.heichelId)}/series/${enc(object.seriesId || 'root')}/${enc(object.id)}`;
  return '/heichelos';
}
function countShape(raw) { return { comments: raw.comments?.length || raw.commentCount || 0, reactions: raw.reactions?.length || raw.reactionCount || 0 }; }
function labelFor(type) { return capitalize(type.charAt(0).toUpperCase() + type.slice(1)); }
function capitalize(text = '') { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
function stripHtml(value = '') { const div = document.createElement('div'); div.innerHTML = String(value ?? ''); return (div.textContent || div.innerText || String(value ?? '')).trim(); }
function array(value) { return Array.isArray(value) ? value : value ? Object.values(value) : []; }
function string(value) { return String(value ?? '').trim(); }
function enc(value) { return encodeURIComponent(String(value)); }
