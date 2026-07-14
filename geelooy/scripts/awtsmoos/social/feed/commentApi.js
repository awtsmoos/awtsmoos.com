// B"H
/** Real comment API bridge preserving rich verse / section metadata with fast local fallback. */
import { addComment as addLocalComment, readComments as readLocalComments } from './commentStore.js';
const API_TIMEOUT = 1600;
export async function fetchCommentTree(object) {
  const url = `/api/social/heichelos/${enc(object.heichelId || 'ikar')}/posts/${enc(object.postId || object.id)}/comment-tree?seriesId=${enc(object.seriesId || 'root')}`;
  try { return normalizeTree(await readJson(url), object); }
  catch { return localTree(object); }
}
export async function createRootComment(object, text, { aliasId = currentAlias(), verseSection = 'root', subsectionId = '' } = {}) {
  const clean = String(text || '').trim();
  if (!clean) return { success:false, empty:true };
  const body = commentBody({ aliasId, text:clean, verseSection, subsectionId, seriesId:object.seriesId || 'root' });
  const url = `/api/social/heichelos/${enc(object.heichelId || 'ikar')}/posts/${enc(object.postId || object.id)}/comment-tree`;
  try { const result = await readJson(url, { method:'POST', body }); addLocalComment(object.id, clean, localStorage, { verseSection, subsectionId }); return result; }
  catch { return { success:addLocalComment(object.id, clean, localStorage, { verseSection, subsectionId }) }; }
}
export async function createReply(object, parentId, text, { aliasId = currentAlias(), sectionId = '', verseSection = 'root' } = {}) {
  const clean = String(text || '').trim();
  if (!clean) return { success:false, empty:true };
  const body = commentBody({ aliasId, text:clean, seriesId:object.seriesId || 'root', verseSection, parentSectionId:sectionId });
  const base = `/api/social/heichelos/${enc(object.heichelId || 'ikar')}/posts/${enc(object.postId || object.id)}/comments/${enc(parentId)}`;
  const url = sectionId ? `${base}/sections/${enc(sectionId)}/replies` : `${base}/replies`;
  try { const result = await readJson(url, { method:'POST', body }); addLocalComment(object.id, `↳ ${clean}`, localStorage, { verseSection, parentId, parentSectionId:sectionId }); return result; }
  catch { return { success:addLocalComment(object.id, `↳ ${clean}`, localStorage, { verseSection, parentId, parentSectionId:sectionId }) }; }
}
function normalizeTree(response, object) {
  const raw = response?.success ?? response?.tree ?? response?.data ?? response ?? [];
  const items = Array.isArray(raw) ? raw : Object.values(raw || {});
  if (!items.length) return localTree(object);
  return buildTree(items.map(normalizeNode));
}
function normalizeNode(item = {}) {
  return { id:item.commentId || item.id || `comment-${Date.now()}`, author:item.aliasId || item.author || 'commenter', text:item.content || item.text || item.dayuh?.content || '', created:item.createdAt ? new Date(item.createdAt).toLocaleString() : item.created || '', parentId:item.parentId || '', parentSectionId:item.parentSectionId || item.replyToSectionId || '', verseSection:item.verseSection || item.dayuh?.verseSection || 'root', subsectionId:item.subsectionId || item.dayuh?.subsectionId || '', sections:Array.isArray(item.sections) ? item.sections : [], assets:Array.isArray(item.assets) ? item.assets : [], links:Array.isArray(item.links) ? item.links : [], replies:[] };
}
function buildTree(nodes) {
  const map = new Map(nodes.map(node => [node.id, { ...node, replies:[] }]));
  const roots = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) map.get(node.parentId).replies.push(node);
    else roots.push(node);
  }
  return roots;
}
function localTree(object) {
  return readLocalComments(object.id).map(comment => ({ id:comment.id, author:comment.author, text:comment.text, created:comment.created, verseSection:comment.verseSection || 'root', subsectionId:comment.subsectionId || '', parentId:comment.parentId || '', parentSectionId:comment.parentSectionId || '', sections:[], assets:[], links:[], replies:[] }));
}
function commentBody({ aliasId, text, verseSection = 'root', subsectionId = '', parentSectionId = '', seriesId = 'root' }) {
  const body = new URLSearchParams();
  body.set('aliasId', aliasId);
  body.set('seriesId', seriesId);
  body.set('verseSection', verseSection);
  if (subsectionId) body.set('subsectionId', subsectionId);
  if (parentSectionId) body.set('parentSectionId', parentSectionId);
  body.set('content', text);
  body.set('text', text);
  body.set('dayuh', JSON.stringify({ content:text, text, verseSection, subsectionId, parentSectionId }));
  return body;
}
async function readJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(url, { credentials:'same-origin', ...options, signal:controller.signal });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}
function currentAlias() { return window.curAlias || window.currentAlias || document.body?.dataset?.aliasId || localStorage.getItem('lastAliasUsed') || localStorage.getItem('awtsmoos-alias') || 'anonymous'; }
function enc(value) { return encodeURIComponent(String(value)); }
