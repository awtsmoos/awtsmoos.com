// B"H
/**
 * @module HomeCivilizationDashboard
 * @description
 * The home screen becomes a thin living client for the real platform API:
 * feed layers, civilization pulse, universal object cards, command search,
 * and object inspection without fake demo data.
 */
import {
  getFeedHome, getTrendingFeed, getDiscoverFeed, searchSocial,
  getCivilizationState, getCivilizationFeed, getCivilizationEntityState
} from '/heichelos/heichel/modules/api/platform.js';

const state = { mode: 'forYou', lastQuery: '', objects: new Map() };
const routes = {
  forYou: () => getFeedHome({ limit: 14 }),
  following: () => getDiscoverFeed({ limit: 14 }),
  trending: () => getTrendingFeed({ limit: 14 }),
  civilization: () => getCivilizationFeed({ aliasId: currentAlias(), limit: 18 }),
  search: () => searchSocial({ q: state.lastQuery || commandValue() || '', domain: '' })
};
const labels = { forYou: 'For You', following: 'Following', trending: 'Trending', civilization: 'Civilization', search: 'Search' };

initHomeLiveFeed();

function initHomeLiveFeed() {
  const list = document.querySelector('[data-home-feed]');
  const tabs = [...document.querySelectorAll('[data-feed-mode]')];
  const form = document.querySelector('[data-home-command]');
  if (!list || tabs.length === 0) return;
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.feedMode, list, tabs)));
  form?.addEventListener('submit', event => {
    event.preventDefault();
    state.lastQuery = commandValue();
    activate('search', list, tabs);
  });
  hydrateMetrics();
  activate('forYou', list, tabs);
}

async function activate(mode, list, tabs) {
  state.mode = mode;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.feedMode === mode));
  list.dataset.feedState = 'loading';
  list.replaceChildren(statusCard(`Loading ${labels[mode] || 'feed'} from the live AwtsmoosDB runtime...`));
  const response = await safeLoad(mode);
  const items = extractItems(response, mode);
  list.dataset.feedState = items.length ? 'ready' : 'empty';
  state.objects.clear();
  const cards = items.length ? items.map(item => renderObjectCard(normalizeItem(item, mode))) : [emptyCard(mode, response)];
  list.replaceChildren(...cards);
  cards.find(card => card.dataset?.objectKey)?.click?.();
  hydrateMetrics(response);
}

async function safeLoad(mode) {
  try { return await (routes[mode] || routes.forYou)(); }
  catch (error) { console.error('B"H home civilization layer failed', error); return null; }
}

async function hydrateMetrics(seed = null) {
  const node = document.querySelector('[data-civilization-metrics]');
  if (!node) return;
  const response = seed || await safeCivilizationState();
  const payload = response?.success || response || {};
  node.replaceChildren(
    metric('events', payload.eventCount ?? payload.events ?? 0),
    metric('subscriptions', payload.subscriptionCount ?? payload.subscriptions ?? 0),
    metric('layer', labels[state.mode] || state.mode)
  );
}

async function safeCivilizationState() {
  try { return await getCivilizationState(); }
  catch { return null; }
}

function extractItems(response, mode) {
  const raw = response?.success?.items || response?.success?.results || response?.success || response?.items || response?.results || response || [];
  const items = Array.isArray(raw) ? raw : Object.values(raw || {});
  return items.filter(Boolean).slice(0, mode === 'civilization' ? 18 : 14);
}

function normalizeItem(item, mode) {
  const id = item.id || item.postId || item.objectId || item.commentId || item.entityId || item.key || stableKey(item);
  const type = item.objectType || item.recordType || item.kind || item.type || (mode === 'civilization' ? 'event' : 'post');
  const title = item.title || item.name || item.subject || item.type || item.postId || id || 'Untitled object';
  const author = item.author || item.aliasId || item.actor?.id || item.actor || item.heichelId || 'Geelooy';
  const summary = item.description || item.excerpt || item.content || item.text || item.payload?.text || item.type || title;
  const href = hrefFor(item, type);
  const normalized = { id, type, title, author, summary, href, mode, raw: item };
  state.objects.set(`${type}:${id}`, normalized);
  return normalized;
}

function renderObjectCard(object) {
  const article = element('article', 'home-post-card is-live-post universal-object-card');
  article.tabIndex = 0;
  article.dataset.objectType = object.type;
  article.dataset.objectId = object.id;
  article.dataset.objectKey = `${object.type}:${object.id}`;
  article.append(authorRow(object.author, object.raw.timestamp || object.raw.createdAt || object.raw.updatedAt || object.mode));
  article.append(pillRow(object));
  article.append(element('h2', '', object.title));
  article.append(element('p', '', trim(object.summary, 190)));
  article.append(actionsRow(object));
  article.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    inspectObject(object);
  });
  article.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inspectObject(object); }
  });
  return article;
}

function pillRow(object) {
  const row = element('div', 'object-type-row');
  row.append(pill(object.type), pill(object.mode), pill(object.raw.heichelId || object.raw.target?.type || 'AwtsDB'));
  return row;
}

function inspectObject(object) {
  const root = document.querySelector('[data-object-inspector]');
  const body = document.querySelector('[data-object-inspector-body]');
  if (!root || !body) return;
  root.querySelector('h2').textContent = object.title;
  root.querySelector('p:not(.home-kicker)').textContent = `${object.type} • ${object.id}`;
  body.replaceChildren(
    section('Open route', linkNode('Open object', object.href)),
    section('Graph hints', textNode(graphHints(object))),
    section('Civilization state', civilizationProbe(object)),
    section('Raw metadata', preNode(object.raw))
  );
  root.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
}

function civilizationProbe(object) {
  const box = element('div');
  box.textContent = 'Loading entity state...';
  getCivilizationEntityState({ type: object.type, id: object.id })
    .then(response => { box.textContent = stringify(response?.success || response || {}, 420); })
    .catch(() => { box.textContent = 'No civilization entity state returned yet.'; });
  return box;
}

function graphHints(object) {
  const raw = object.raw || {};
  return [
    `type=${object.type}`,
    `id=${object.id}`,
    raw.heichelId ? `heichel=${raw.heichelId}` : '',
    raw.aliasId ? `alias=${raw.aliasId}` : '',
    raw.postId ? `post=${raw.postId}` : '',
    raw.target?.id ? `target=${raw.target.type || 'entity'}:${raw.target.id}` : ''
  ].filter(Boolean).join(' • ');
}

function hrefFor(item, type) {
  if (item.href || item.url) return item.href || item.url;
  const postId = item.postId || (type === 'post' ? item.id : '');
  const heichelId = item.heichelId || item.target?.heichelId;
  const seriesId = item.seriesId || 'root';
  if (heichelId && postId) return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/${encodeURIComponent(postId)}`;
  if (heichelId) return `/heichelos/${encodeURIComponent(heichelId)}`;
  if (type === 'alias' && item.id) return `/profile/${encodeURIComponent(item.id)}`;
  return '/heichelos';
}

function authorRow(author, time) {
  const row = element('div', 'post-author');
  row.append(element('span'), element('strong', '', String(author)), element('small', '', String(time)));
  return row;
}

function actionsRow(object) {
  const footer = element('footer', 'home-live-actions object-action-row');
  footer.append(link('Open', object.href), button('Inspect', () => inspectObject(object)), link('Create', '/heichelos/submit'));
  return footer;
}

function emptyCard(mode, response) {
  const message = response ? `No live ${labels[mode] || 'feed'} objects returned yet.` : 'The live layer could not be reached.';
  const article = element('article', 'home-post-card home-feed-empty');
  article.append(element('p', '', message), actionsRow({ href: '/heichelos', type: 'empty', id: mode, title: labels[mode], raw: {}, mode }));
  return article;
}

function statusCard(message) {
  const article = element('article', 'home-post-card home-feed-loading');
  article.append(element('p', '', message));
  return article;
}

function metric(label, value) {
  const card = element('article', 'civilization-metric-card');
  card.append(element('strong', '', String(value ?? 0)), element('small', '', label));
  return card;
}

function section(title, child) {
  const node = element('section', 'object-inspector-section');
  node.append(element('h3', '', title), child);
  return node;
}

function commandValue() { return document.querySelector('[data-home-command] input')?.value || ''; }
function currentAlias() { return window.curAlias || window.currentAlias || 'anonymous'; }
function element(tag, className = '', text = '') { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function link(text, href) { const a = element('a', '', text); a.href = href; return a; }
function linkNode(text, href) { return link(text, href); }
function textNode(text) { const p = element('p'); p.textContent = text; return p; }
function button(text, onClick) { const b = element('button', '', text); b.type = 'button'; b.addEventListener('click', onClick); return b; }
function pill(text) { return element('span', 'object-pill', String(text || 'object')); }
function preNode(value) { return element('pre', '', stringify(value, 1400)); }
function stringify(value, limit) { try { return JSON.stringify(value, null, 2).slice(0, limit); } catch { return String(value).slice(0, limit); } }
function stableKey(value) { return btoa(unescape(encodeURIComponent(stringify(value, 160)))).replace(/[^a-z0-9]/gi, '').slice(0, 18) || `${Date.now()}`; }
function trim(value, limit) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, limit - 1)}…` : text; }
