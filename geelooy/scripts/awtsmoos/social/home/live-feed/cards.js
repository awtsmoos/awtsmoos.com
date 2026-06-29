// B"H
import { button, element, link, pill, textNode, trim } from './dom.js';

export function renderObjectCard(object, onInspect) {
  const card = element('article', 'home-post-card universal-object-card');
  card.tabIndex = 0;
  card.dataset.objectType = object.type;
  card.dataset.objectId = object.id;
  card.append(authorRow(object), typeRow(object), textNode(trim(object.summary, 260)), actionRow(object, onInspect));
  card.addEventListener('click', event => { if (!event.target.closest('a,button')) onInspect(object); });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onInspect(object); }
  });
  return card;
}

export function statusCard(title, message, tone = '') {
  const card = element('article', `home-post-card ${tone}`.trim());
  card.append(authorRow({ title, author:'AwtsmoosDB', type:'status' }), textNode(message));
  return card;
}

export function emptyCard(mode, onOpenSearch) {
  const card = statusCard('No visible objects yet', `The ${mode} stream answered, but no cards were returned.`);
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
  row.append(element('span'), element('strong', '', object.title || 'Object'), element('small', '', object.author || 'Geelooy'));
  return row;
}

function typeRow(object) {
  const row = element('div', 'object-type-row');
  row.append(pill(object.type), pill(object.mode || 'live'), pill(object.id));
  return row;
}

function actionRow(object, onInspect) {
  const row = element('footer', 'object-action-row');
  row.append(link('Open route', object.href), button('Inspect graph', () => onInspect(object)));
  return row;
}

function compact(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return value ?? 0;
}

/** B"H: every card is a clickable object, not a decorative shadow. */
