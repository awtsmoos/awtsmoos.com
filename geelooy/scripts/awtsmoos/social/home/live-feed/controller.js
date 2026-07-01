// B"H
import { getCivilizationState, loadFeedMode } from './api.js';
import { emptyCard, metricCard, renderObjectCard, statusCard } from './cards.js';
import { inspectObject } from './inspector.js';
import { extractItems, normalizeItem } from './normalize.js';
import { labels, state } from './state.js';
import { syncFeedObjects, syncMetrics } from './graphBridge.js';

let initialized = false;

export function initHomeLiveFeed() {
  if (initialized) return;
  initialized = true;
  bindTabs();
  bindSearch();
  hydrateMetrics();
  activate('forYou');
}

async function activate(mode, options = {}) {
  state.mode = mode;
  updateTabs(mode);
  const feed = feedRoot();
  if (!feed) return;
  feed.replaceChildren(statusCard(`Loading ${labels[mode] || mode}`, 'Opening the live social runtime...'));
  const response = await safeLoad(mode, options);
  const objects = extractItems(response, mode).map(item => normalizeItem(item, mode));
  state.objects = new Map(objects.map(object => [object.id, object]));
  syncFeedObjects(mode, objects);
  renderFeed(feed, objects, mode);
  if (objects[0]) inspectObject(objects[0]);
  hydrateMetrics(response);
}

function renderFeed(feed, objects, mode) {
  if (!objects.length) {
    feed.replaceChildren(emptyCard(mode, () => activate('search')));
    return;
  }
  feed.replaceChildren(...objects.map(object => renderObjectCard(object, inspectObject)));
}

async function safeLoad(mode, options) {
  try { return await loadFeedMode(mode, { query:state.lastQuery, ...options }); }
  catch (error) {
    console.error('B"H home feed load failed', error);
    return { ok:false, error:error.message };
  }
}

async function hydrateMetrics(seed) {
  const root = document.querySelector('[data-civilization-metrics]');
  if (!root) return;
  const payload = payloadOf(seed) || payloadOf(await getCivilizationState()) || {};
  const metrics = metricSet(payload);
  syncMetrics(metrics);
  root.replaceChildren(...Object.entries(metrics).map(([label, value]) => metricCard(label, value)));
}

function metricSet(payload = {}) {
  return {
    Objects: payload.objects ?? payload.items ?? payload.feed ?? payload.events ?? 0,
    Events: payload.events ?? payload.recentEvents ?? 0,
    Graph: payload.graphEdges ?? payload.edges ?? payload.subscriptions ?? 0
  };
}

function payloadOf(response) {
  return response?.success ?? response?.data ?? response;
}

function bindTabs() {
  document.querySelectorAll('[data-feed-mode]').forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.feedMode));
  });
}

function bindSearch() {
  const form = document.querySelector('[data-home-command]');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    state.lastQuery = new FormData(form).get('q') || '';
    activate('search', { query:state.lastQuery });
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

/** B"H: controller conducts API, cards, inspector, metrics, tabs, and graph bridge. */
