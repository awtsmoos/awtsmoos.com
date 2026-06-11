// B"H
/**
 * @module CommentThreadApp
 * @description
 * Chapter 150: A browser vessel for unique comment URLs, recursive replies,
 * images, GIFs, audio notes, previews, and coordinate filtering by verse or
 * subsection.
 */

const params = new URLSearchParams(location.search);
const state = {
  heichelId: params.get('heichel') || 'ikar',
  postId: params.get('post') || 'post',
  aliasId: params.get('alias') || 'coby',
  verseSection: params.get('verse') || '',
  subsectionId: params.get('subsection') || '',
  comments: []
};

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
  Object.entries(options.on || {}).forEach(([key, value]) => node.addEventListener(key, value));
  children.forEach(child => node.append(child));
  return node;
}

function media(asset) {
  if ((asset.mime || '').startsWith('audio') || asset.type === 'audio') return el('audio', { attrs: { controls: 'controls', src: asset.publicPath } });
  return el('img', { attrs: { src: asset.publicPath, alt: asset.alt || asset.id, loading: 'lazy' } });
}

function preview(link) {
  return el('a', { className: 'comment-preview', attrs: { href: link.href || link.url || '#'} }, [el('b', { text: link.title || link.href }), el('span', { text: link.kind || 'link' })]);
}

function card(comment) {
  const deleted = comment.deleted ? ' comment-tombstone' : '';
  return el('article', { className: `comment-card${deleted}`, attrs: { id: comment.id } }, [
    el('a', { className: 'comment-anchor', text: '#', attrs: { href: `#${comment.id}` } }),
    el('div', { className: 'comment-meta', text: `@${comment.aliasId} · ${comment.verseSection || 'root'}${comment.subsectionId ? ' / ' + comment.subsectionId : ''}` }),
    el('div', { className: 'comment-content', text: comment.deleted ? 'This comment was gathered back into silence.' : comment.content || comment.audioNoteText || '' }),
    el('div', { className: 'comment-media' }, (comment.assets || []).map(media)),
    el('div', { className: 'comment-preview-grid' }, (comment.previews || []).map(preview)),
    el('div', { className: 'comment-tools' }, [el('a', { text: 'open unique URL', attrs: { href: comment.url || `#${comment.id}` } }), el('button', { text: 'reply', on: { click: () => showReply(comment.id) } })]),
    el('div', { className: 'comment-replies' }, (comment.replies || []).map(card))
  ]);
}

function composer(parentId = '') {
  return el('form', { className: 'geelooy-card comment-composer', on: { submit: event => submit(event, parentId) } }, [
    el('textarea', { attrs: { name: 'content', placeholder: parentId ? 'Reply with text...' : 'Write a comment...' } }),
    el('div', { className: 'comment-coordinate' }, [el('input', { attrs: { name: 'verseSection', placeholder: 'verse id', value: state.verseSection || 'root' } }), el('input', { attrs: { name: 'subsectionId', placeholder: 'subsection id', value: state.subsectionId } })]),
    el('input', { attrs: { name: 'assets', placeholder: 'JSON assets: image/gif/audio manifests' } }),
    el('input', { attrs: { name: 'links', placeholder: 'JSON links to posts/comments/URLs' } }),
    el('button', { className: 'gold-btn', text: parentId ? 'Send Reply' : 'Send Comment' })
  ]);
}

function showReply(parentId) {
  document.querySelector(`#${CSS.escape(parentId)}`).append(composer(parentId));
}

async function submit(event, parentId) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  data.aliasId = state.aliasId;
  const url = parentId ? `/api/social/heichelos/${state.heichelId}/posts/${state.postId}/comments/${parentId}/replies` : `/api/social/heichelos/${state.heichelId}/posts/${state.postId}/comment-tree`;
  const response = await fetch(url, { method: 'POST', body: new URLSearchParams(data) });
  const json = await response.json();
  if (!json.success) return alert(JSON.stringify(json));
  await load();
}

async function load() {
  const qs = new URLSearchParams({ ...(state.verseSection ? { verseSection: state.verseSection } : {}), ...(state.subsectionId ? { subsectionId: state.subsectionId } : {}) });
  const response = await fetch(`/api/social/heichelos/${state.heichelId}/posts/${state.postId}/comment-tree?${qs}`);
  const json = await response.json();
  state.comments = json.success || [];
  render();
}

function render() {
  document.querySelector('#comment-thread-root').replaceChildren(el('main', { className: 'comment-shell' }, [
    el('section', { className: 'editor-hero', html: `<p>B"H Comment Tree</p><h1>${state.postId}</h1><p>Every comment has a unique URL, previews, media, and replies.</p>` }),
    composer(),
    el('section', { className: 'comment-tree' }, state.comments.map(card))
  ]));
}

load().catch(error => { document.querySelector('#comment-thread-root').textContent = error.message; });
