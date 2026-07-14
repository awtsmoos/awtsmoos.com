// B"H
import { normalizeFeedObject } from './normalizeFeedObject.js';
import { REACTIONS, reactionSummary, toggleReaction } from './reactionStore.js';
import { fetchCommentTree, createReply, createRootComment } from './commentApi.js?v=comments-001';
let activeObject = null;
export function openOfficialPostViewer(input) {
  activeObject = normalizeFeedObject(input);
  const viewer = ensureViewer();
  viewer.dataset.activeVerseId = 'root';
  viewer.querySelector('[data-viewer-title]').textContent = activeObject.title;
  viewer.querySelector('[data-viewer-meta]').textContent = `@${activeObject.authorAlias} · ${activeObject.heichelId} · ${activeObject.type}`;
  viewer.querySelector('[data-viewer-summary]').textContent = activeObject.summary;
  viewer.querySelector('[data-viewer-full]').href = activeObject.href || '#';
  renderVerses(viewer, activeObject);
  renderReactionDock(viewer, activeObject);
  loadComments(viewer, activeObject);
  document.body.dataset.geelooyPostViewerOpen = 'true';
  viewer.hidden = false;
  viewer.querySelector('[data-viewer-close]')?.focus();
}
export function closeOfficialPostViewer() {
  document.body.dataset.geelooyPostViewerOpen = 'false';
  const viewer = document.querySelector('.geelooy-post-viewer');
  if (viewer) viewer.hidden = true;
}
function ensureViewer() {
  let viewer = document.querySelector('.geelooy-post-viewer');
  if (viewer) return viewer;
  viewer = document.createElement('section');
  viewer.className = 'geelooy-post-viewer';
  viewer.hidden = true;
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-label', 'Official post viewer');
  viewer.innerHTML = markup();
  document.body.append(viewer);
  viewer.addEventListener('click', handleViewerClick);
  viewer.addEventListener('submit', handleCommentSubmit);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeOfficialPostViewer(); });
  return viewer;
}
function markup() {
  return `<div class="geelooy-post-viewer-backdrop" data-viewer-close></div><article class="geelooy-post-viewer-card"><header class="geelooy-post-viewer-head"><div><p class="g-kicker">Official post viewer</p><h2 data-viewer-title></h2><p data-viewer-meta></p></div><button type="button" data-viewer-close>Close</button></header><nav class="geelooy-viewer-tools"><a data-viewer-full href="#">Open full post viewer</a><button type="button" data-viewer-copy>Copy link</button><button type="button" data-viewer-save>Save</button><button type="button" data-viewer-share>Share</button></nav><p class="geelooy-post-viewer-summary" data-viewer-summary></p><nav class="geelooy-verse-tabs" data-viewer-verse-tabs></nav><section class="geelooy-verse-scroll" data-viewer-verses tabindex="0"></section><section class="geelooy-viewer-reactions" data-viewer-reactions></section><section class="geelooy-viewer-comments"><h3>Comments</h3><p class="geelooy-comment-hint">Whole-post comments attach to root. Verse forms attach to that exact Sicha section.</p><div data-viewer-comments>Loading comments...</div><form data-viewer-comment-form><input name="comment" placeholder="Comment on the whole post..." autocomplete="off"><button type="submit">Comment</button></form></section></article>`;
}
function handleViewerClick(event) {
  if (event.target.closest('[data-viewer-close]')) closeOfficialPostViewer();
  if (event.target.closest('[data-viewer-copy]')) copyLink();
  if (event.target.closest('[data-viewer-save]')) localAction('saved');
  if (event.target.closest('[data-viewer-share]')) localAction('shared');
  const verse = event.target.closest('[data-jump-verse]');
  if (verse) jumpToVerse(verse.dataset.jumpVerse);
  const reaction = event.target.closest('[data-viewer-reaction]');
  if (reaction && activeObject) { toggleReaction(activeObject.id, reaction.dataset.viewerReaction); renderReactionDock(ensureViewer(), activeObject); }
  const reply = event.target.closest('[data-reply-to]');
  if (reply) showReplyForm(reply.dataset.replyTo, reply.dataset.replyVerse || 'root', reply.dataset.replySection || '');
}
async function handleCommentSubmit(event) {
  if (!activeObject) return;
  if (event.target.matches('[data-viewer-comment-form]')) return submitRootComment(event);
  if (event.target.matches('[data-verse-comment-form]')) return submitVerseComment(event);
  if (event.target.matches('[data-viewer-reply-form]')) return submitReply(event);
}
async function submitRootComment(event) {
  event.preventDefault();
  const input = event.target.elements.comment;
  await createRootComment(activeObject, input.value, { verseSection:'root' });
  input.value = '';
  await loadComments(ensureViewer(), activeObject);
}
async function submitVerseComment(event) {
  event.preventDefault();
  const verse = event.target.closest('[data-viewer-verse-id]');
  const input = event.target.elements.comment;
  await createRootComment(activeObject, input.value, { verseSection:verse?.dataset.viewerVerseId || 'root' });
  input.value = '';
  await loadComments(ensureViewer(), activeObject);
}
async function submitReply(event) {
  event.preventDefault();
  const input = event.target.elements.reply;
  await createReply(activeObject, event.target.dataset.viewerReplyForm, input.value, { verseSection:event.target.dataset.replyVerse || 'root', sectionId:event.target.dataset.replySection || '' });
  input.value = '';
  await loadComments(ensureViewer(), activeObject);
}
function renderVerses(viewer, object) {
  const verses = normalizedVerses(object);
  const tabs = viewer.querySelector('[data-viewer-verse-tabs]');
  const body = viewer.querySelector('[data-viewer-verses]');
  tabs.replaceChildren(...verses.map((verse, index) => buttonForVerse(verse, index)));
  body.replaceChildren(...verses.map((verse, index) => articleForVerse(verse, index)));
}
function normalizedVerses(object) {
  const sections = object.sections?.length ? object.sections : [];
  if (sections.length) return sections.map((section, index) => ({ id:section.id || section.verseSection || `verse-${index + 1}`, title:section.label || section.title || `Verse ${index + 1}`, text:section.text || section.content || section.summary || object.summary }));
  return [object.summary, 'Tap reactions, leave comments, and open the full route when connected.', 'More verses will stream from the official post reader.'].map((text, index) => ({ id:`verse-${index + 1}`, title:`Verse ${index + 1}`, text }));
}
function buttonForVerse(verse, index) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.jumpVerse = `viewer-${verse.id}`;
  btn.textContent = `${index + 1}. ${verse.title}`;
  return btn;
}
function articleForVerse(verse, index) {
  const article = document.createElement('article');
  article.id = `viewer-${verse.id}`;
  article.className = 'geelooy-viewer-verse';
  article.dataset.viewerVerseId = verse.id;
  article.innerHTML = `<span>Verse ${index + 1}</span><h3></h3><p></p><form data-verse-comment-form><input name="comment" placeholder="Comment on this verse..."><button type="submit">Comment on verse</button></form>`;
  article.querySelector('h3').textContent = verse.title;
  article.querySelector('p').textContent = verse.text;
  return article;
}
function renderReactionDock(viewer, object) {
  const root = viewer.querySelector('[data-viewer-reactions]');
  const summary = reactionSummary(object.id, object.counts);
  root.replaceChildren(...REACTIONS.map(([name, icon, label]) => {
    const btn = document.createElement('button'); btn.type = 'button';
    btn.dataset.viewerReaction = name; btn.className = summary.active.includes(name) ? 'is-active' : '';
    btn.innerHTML = `<span>${icon}</span><strong>${label}</strong>`;
    return btn;
  }), reactionLabel(summary));
}
async function loadComments(viewer, object) {
  const list = viewer.querySelector('[data-viewer-comments]');
  list.textContent = 'Loading real comment tree...';
  const tree = await fetchCommentTree(object);
  list.replaceChildren(...tree.map(comment => renderCommentNode(comment)));
}
function renderCommentNode(comment) {
  const row = document.createElement('article');
  row.className = 'geelooy-viewer-comment';
  row.dataset.commentId = comment.id;
  row.dataset.commentVerse = comment.verseSection || 'root';
  row.innerHTML = `<header class="geelooy-comment-head"><strong></strong><span class="geelooy-comment-scope"></span></header><p></p><time></time><div class="geelooy-rich-comment-sections"></div><button type="button" data-reply-to="">Reply</button><div class="geelooy-reply-slot"></div><div class="geelooy-comment-replies"></div>`;
  row.querySelector('strong').textContent = comment.author;
  row.querySelector('.geelooy-comment-scope').textContent = commentScope(comment);
  row.querySelector('p').textContent = comment.text;
  row.querySelector('time').textContent = comment.created || '';
  row.querySelector('[data-reply-to]').dataset.replyTo = comment.id;
  row.querySelector('[data-reply-to]').dataset.replyVerse = comment.verseSection || 'root';
  row.querySelector('[data-reply-to]').dataset.replySection = comment.sections?.[0]?.id || '';
  row.querySelector('.geelooy-rich-comment-sections').replaceChildren(...(comment.sections || []).map(renderCommentSection));
  row.querySelector('.geelooy-comment-replies').replaceChildren(...(comment.replies || []).map(reply => renderCommentNode(reply)));
  return row;
}
function renderCommentSection(section) {
  const block = document.createElement('section');
  block.className = 'geelooy-rich-comment-section';
  block.dataset.commentSectionId = section.id || section.sectionId || '';
  block.innerHTML = `<strong></strong><p></p>`;
  block.querySelector('strong').textContent = section.title || section.label || 'Comment section';
  block.querySelector('p').textContent = section.content || section.text || section.html || '';
  return block;
}
function showReplyForm(parentId, verseSection = 'root', sectionId = '') {
  const host = document.querySelector(`[data-comment-id="${CSS.escape(parentId)}"] .geelooy-reply-slot`);
  if (!host) return;
  host.innerHTML = `<form data-viewer-reply-form="${parentId}" data-reply-verse="${verseSection}" data-reply-section="${sectionId}"><input name="reply" placeholder="Write a reply..."><button type="submit">Reply</button></form>`;
}
function jumpToVerse(id) {
  const viewer = ensureViewer();
  viewer.dataset.activeVerseId = id.replace(/^viewer-/, '');
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
}
function commentScope(comment) {
  const verse = comment.verseSection || 'root';
  const subsection = comment.subsectionId ? ` · subsection ${comment.subsectionId}` : '';
  const parentSection = comment.parentSectionId ? ` · replying to comment section ${comment.parentSectionId}` : '';
  return verse === 'root' ? `Whole post${subsection}${parentSection}` : `Verse ${verse}${subsection}${parentSection}`;
}
function copyLink() { navigator.clipboard?.writeText(activeObject?.href || location.href); localAction('copied'); }
function localAction(name) { ensureViewer().querySelector('[data-viewer-meta]').textContent = `${activeObject.authorAlias} · ${activeObject.heichelId} · ${name}`; }
function reactionLabel(summary) { const span = document.createElement('span'); span.className = 'geelooy-reaction-summary'; span.textContent = `${summary.total} likes and reactions`; return span; }
