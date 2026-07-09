// B"H
import { getCivilizationState, loadFeedMode } from './api.js';
import { emptyCard, metricCard, renderObjectCard, statusCard } from './cards.js';
import { inspectObject } from './inspector.js';
import { extractItems, normalizeItem } from './normalize.js';
import { labels, state } from './state.js';
import { syncFeedObjects, syncMetrics } from './graphBridge.js';
import { createInfiniteFeed } from '../../feed/infiniteFeed.js';
import { sampleCollegePage, seedCollegeFeed } from '../../feed/sampleCollegeFeed.js';
import { fetchIkarPosts } from '../../feed/ikarFeedApi.js';
let initialized = false;
let activeRun = 0;
export function initHomeLiveFeed() {
  if (initialized) return;
  initialized = true;
  bindTabs();
  bindSearch();
  hydrateMetrics({ sampleObjects: 0 });
  activate('forYou');
}
async function activate(mode, options = {}) {
  const run = ++activeRun;
  state.mode = mode;
  updateTabs(mode);
  const feed = feedRoot();
  if (!feed) return;
  const instantObjects = seedCollegeFeed(sampleCollegePage(0, 12), 14);
  commitFeed(feed, instantObjects, mode);
  if (instantObjects[0]) inspectObject(instantObjects[0]);
  hydrateMetrics({ sampleObjects: instantObjects.length, ikarObjects: 0 });
  const realObjects = await loadRealObjects(mode, options);
  if (run !== activeRun || !realObjects.length) return;
  const objects = seedCollegeFeed(realObjects, 14);
  commitFeed(feed, objects, mode);
  if (objects[0]) inspectObject(objects[0]);
  hydrateMetrics({ sampleObjects: objects.length, ikarObjects: realObjects.length });
}
function commitFeed(feed, objects, mode) {
  if (!objects.length) {
    feed.replaceChildren(emptyCard(mode, () => activate('search')));
    return;
  }
  state.objects = new Map(objects.map(object => [object.id, object]));
  syncFeedObjects(mode, objects);
  feed.replaceChildren(...objects.map(object => renderObjectCard(object, inspectObject)));
  const infinite = createInfiniteFeed({ initial: objects, pageSize: 8, render: next => appendCards(feed, next), onAppend: all => syncFeedObjects(mode, all) });
  infinite.attach(feed);
  feed.dataset.infiniteFeed = 'instant-sample-real-ikar';
}
function appendCards(feed, next) {
  const sentinel = feed.querySelector('[data-infinite-feed-sentinel]');
  const cards = next.map(object => renderObjectCard(object, inspectObject));
  sentinel ? sentinel.before(...cards) : feed.append(...cards);
}
async function loadRealObjects(mode, options) {
  const [response, realIkar] = await Promise.all([
    withTimeout(safeLoad(mode, options), 4500, { timeout: true }),
    mode === 'search' ? [] : withTimeout(safeIkar(), 4500, [])
  ]);
  const apiObjects = extractItems(response, mode).map(item => normalizeItem(item, mode));
  return [...realIkar, ...apiObjects];
}
async function safeIkar() {
  try { return await fetchIkarPosts({ limit: 18 }); }
  catch (error) { console.warn('B"H Ikar feed fallback', error); return []; }
}
async function safeLoad(mode, options) {
  try { return await loadFeedMode(mode, { query: state.lastQuery, ...options }); }
  catch (error) { console.error('B"H home feed load failed', error); return { ok: false, error: error.message }; }
}
function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);
}
async function hydrateMetrics(seed) {
  const root = document.querySelector('[data-civilization-metrics]');
  if (!root) return;
  const payload = payloadOf(seed) || payloadOf(await withTimeout(getCivilizationState(), 1800, {})) || {};
  const metrics = metricSet(payload);
  syncMetrics(metrics);
  root.replaceChildren(...Object.entries(metrics).map(([label, value]) => metricCard(label, value)));
}
function metricSet(payload = {}) {
  return { Objects: payload.ikarObjects ?? payload.objects ?? payload.sampleObjects ?? 0, Events: payload.events ?? payload.recentEvents ?? 6, Graph: payload.graphEdges ?? payload.edges ?? payload.subscriptions ?? 18 };
}
function payloadOf(response) { return response?.success ?? response?.data ?? response; }
function bindTabs() {
  document.querySelectorAll('[data-feed-mode]').forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.feedMode)));
}
function bindSearch() {
  const form = document.querySelector('[data-home-command], [data-home-search]');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    state.lastQuery = new FormData(form).get('q') || '';
    activate('search', { query: state.lastQuery });
  });
}
function updateTabs(mode) {
  document.querySelectorAll('[data-feed-mode]').forEach(tab => {
    const selected = tab.dataset.feedMode === mode;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });
}
function feedRoot() { return document.querySelector('[data-home-feed]'); }
