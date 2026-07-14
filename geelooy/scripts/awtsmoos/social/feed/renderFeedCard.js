// B"H
/** Unified card renderer bridge with compact actions and cache-busted cooked viewer. */
import { FeedCard } from '/heichelos/social/components/FeedCard.js';
import { renderBlueprint } from '/heichelos/social/components/render.js';
import { normalizeFeedObject, FEED_TYPES } from './normalizeFeedObject.js';
import { reactionSummary, toggleReaction } from './reactionStore.js';
import { openOfficialPostViewer } from './postViewer.js?v=comments-001';
export function renderUnifiedFeedCard(input = {}, actions = {}, doc = document) {
  const object = normalizeFeedObject(input);
  const open = () => { actions.onInspect?.(object); openOfficialPostViewer(object); };
  const node = renderBlueprint(FeedCard(object, actionMap(object, actions, open)), doc);
  node.classList.add('home-post-card', 'universal-object-card', 'geelooy-feed-card');
  node.dataset.objectType = object.type;
  node.dataset.objectId = object.id;
  node.dataset.feedRenderer = 'unified-feed-card';
  node.tabIndex = 0;
  node.append(renderCompactActions(object, open, doc));
  node.addEventListener('click', event => { if (!event.target.closest('a,button')) open(); });
  node.querySelectorAll('[data-read-more], [data-preview-section]').forEach(el => el.addEventListener('click', event => { event.preventDefault(); open(); }));
  node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  return node;
}
export { normalizeFeedObject, FEED_TYPES };
function renderCompactActions(object, open, doc) {
  const wrap = doc.createElement('section');
  wrap.className = 'geelooy-reaction-bar geelooy-feed-compact-actions';
  wrap.setAttribute('aria-label', 'Post actions');
  const like = actionButton(doc, '👍 Like', () => { toggleReaction(object.id, 'like'); syncLike(like, object); updateSummary(summary, object); });
  const comment = actionButton(doc, '💬 Comment', open);
  const share = actionButton(doc, '↗ Share', open);
  const summary = doc.createElement('span');
  summary.className = 'geelooy-reaction-summary';
  wrap.append(like, comment, share, summary);
  syncLike(like, object);
  updateSummary(summary, object);
  return wrap;
}
function actionButton(doc, label, onClick) {
  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); onClick(); });
  return btn;
}
function syncLike(button, object) { button.classList.toggle('is-active', reactionSummary(object.id, object.counts).active.includes('like')); }
function updateSummary(el, object) { const info = reactionSummary(object.id, object.counts); el.textContent = info.total ? `${info.total} reactions` : ''; }
function actionMap(object, actions, open) { return { onReadMore:open, onComment:open, onSave:() => actions.onSave?.(object), onShare:open }; }
