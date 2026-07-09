// B"H
import { renderUnifiedFeedCard } from '../../feed/renderFeedCard.js';
import { button, element, link, pill, textNode } from './dom.js';
export function renderObjectCard(object, onInspect) {
  const card = renderUnifiedFeedCard(object, { onInspect, onSave: onInspect, onShare: onInspect });
  const row = element('footer', 'object-action-row');
  row.append(link('Open', object.href), button('Inspect', () => onInspect(object)));
  card.append(row);
  return card;
}
export function statusCard(title, message, tone = '') {
  const card = element('article', `home-post-card geelooy-feed-card ${tone}`.trim());
  card.append(authorRow({ title, author:'Geelooy', type:'status' }), textNode(message));
  return card;
}
export function emptyCard(mode, onOpenSearch) {
  const card = statusCard('No posts yet', `The ${mode} stream is quiet. Search the archive or create something new.`);
  const row = element('footer', 'object-action-row');
  row.append(button('Search archive', onOpenSearch), link('Create post', '/heichelos/submit'));
  card.append(row);
  return card;
}
export function metricCard(label, value) {
  const card = element('article', 'civilization-metric-card');
  card.append(element('strong', '', compact(value)), element('small', '', label));
  return card;
}
function authorRow(object) {
  const row = element('div', 'post-author');
  row.append(element('span'), element('strong', '', object.title || 'Post'), element('small', '', object.author || 'Geelooy'));
  return row;
}
function compact(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return value ?? 0;
}
export function feedTypePill(type) { return pill(type || 'object'); }
/** B"H: the home renderer now bows to the universal feed card. */
