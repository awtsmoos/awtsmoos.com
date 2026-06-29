// B"H
import { stableKey } from './dom.js';

export function extractItems(response, mode) {
  const root = response?.success ?? response ?? [];
  const raw = root.items ?? root.results ?? root.feed ?? root.events ?? root;
  const items = Array.isArray(raw) ? raw : Object.values(raw || {});
  const limit = mode === 'civilization' ? 18 : 14;
  return items.filter(Boolean).slice(0, limit);
}

export function normalizeItem(item, mode) {
  const raw = item || {};
  const id = raw.id || raw.postId || raw.objectId || raw.commentId || raw.entityId || raw.key || stableKey(raw);
  const type = cleanType(raw.objectType || raw.recordType || raw.kind || raw.type || fallbackType(mode));
  const title = raw.title || raw.name || raw.subject || raw.postId || raw.type || id || 'Untitled object';
  const author = raw.author || raw.aliasId || raw.actor?.id || raw.actor || raw.heichelId || 'Geelooy';
  const summary = raw.description || raw.excerpt || raw.content || raw.text || raw.payload?.text || raw.type || title;
  return { id:String(id), type, title:String(title), author:String(author), summary:String(summary), href:hrefFor(raw, type), mode, raw };
}

export function hrefFor(item, type) {
  if (item.href || item.url) return item.href || item.url;
  const postId = item.postId || (type === 'post' ? item.id : '');
  const heichelId = item.heichelId || item.target?.heichelId;
  const seriesId = item.seriesId || 'root';
  if (heichelId && postId) return `/heichelos/${enc(heichelId)}/series/${enc(seriesId)}/${enc(postId)}`;
  if (heichelId) return `/heichelos/${enc(heichelId)}`;
  if (type === 'alias' && item.id) return `/profile/${enc(item.id)}`;
  return '/heichelos';
}

function fallbackType(mode) {
  return mode === 'civilization' ? 'event' : 'post';
}

function cleanType(type) {
  const text = String(type || 'object').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (text.includes('heichel')) return 'heichel';
  if (text.includes('alias')) return 'alias';
  if (text.includes('comment')) return 'comment';
  if (text.includes('event')) return 'event';
  if (text.includes('post')) return 'post';
  return text || 'object';
}

function enc(value) { return encodeURIComponent(String(value)); }

/** B"H: every raw shape receives one living object garment. */
