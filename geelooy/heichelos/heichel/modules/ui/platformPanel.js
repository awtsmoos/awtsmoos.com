//B"H
/**
 * @module platformPanel
 * @description Mobile/desktop operational surface for feed, search, live state and packed DB sharing health.
 */
import {
  getHeichelFeed,
  getFeedHome,
  searchSocial,
  setLivePresence,
  replayLiveEvents,
  getPackedStats,
  getPackedSnapshot,
  pullSync,
  materializeFeed,
  checkRateLimit
} from '../api/platform.js';
import { platformOps } from '../api/platformOps.js';

export function mountPlatformPanel({ root = document.body, aliasId = window.curAlias || '', heichelId = window.heichelId || window.currentHeichelId || '' } = {}) {
  if (!root || document.querySelector('.awtsmoos-platform-panel')) return null;
  const panel = document.createElement('aside');
  panel.className = 'awtsmoos-platform-panel';
  panel.innerHTML = `
    <button class="awtsmoos-platform-toggle" type="button" aria-expanded="false">Platform</button>
    <section class="awtsmoos-platform-body" hidden>
      <header><strong>Awtsmoos Platform</strong><small data-platform-status>ready</small></header>
      <form class="awtsmoos-platform-search"><input name="q" placeholder="Search posts, graph, comments" /><button type="submit">Search</button></form>
      <div class="awtsmoos-platform-actions">
        <button type="button" data-platform-action="feed">Feed</button>
        <button type="button" data-platform-action="presence">Presence</button>
        <button type="button" data-platform-action="db">DB</button>
        <button type="button" data-platform-action="sync">Sync</button>
        <button type="button" data-platform-action="ops">Ops</button>
      </div>
      <div class="awtsmoos-platform-output" data-platform-output></div>
    </section>`;
  root.appendChild(panel);
  const ctx = { panel, aliasId, heichelId, cursor: 0 };
  panel.querySelector('.awtsmoos-platform-toggle').onclick = () => togglePanel(ctx);
  panel.querySelector('.awtsmoos-platform-search').onsubmit = event => handleSearch(event, ctx);
  panel.querySelectorAll('[data-platform-action]').forEach(button => {
    button.onclick = () => runAction(button.dataset.platformAction, ctx);
  });
  runAction('db', ctx);
  return panel;
}

function togglePanel(ctx) {
  const body = ctx.panel.querySelector('.awtsmoos-platform-body');
  const toggle = ctx.panel.querySelector('.awtsmoos-platform-toggle');
  body.hidden = !body.hidden;
  toggle.setAttribute('aria-expanded', String(!body.hidden));
}

async function handleSearch(event, ctx) {
  event.preventDefault();
  const q = new FormData(event.currentTarget).get('q');
  const response = await searchSocial({ q, domain: 'post' });
  if (!response) {
    renderFailure(ctx, 'Search failed', 'Unable to load search results.');
    setStatus(ctx, 'search unavailable');
    return;
  }
  renderList(ctx, 'Search', response.success || []);
}

async function runAction(action, ctx) {
  setStatus(ctx, `loading ${action}`);
  try {
    if (action === 'feed') {
      const materialized = await materializeFeed({ heichelId: ctx.heichelId, aliasId: ctx.aliasId });
      if (!materialized) return failAction(ctx, 'Feed failed', 'Unable to materialize feed data.');
      const response = ctx.heichelId ? await getHeichelFeed({ heichelId: ctx.heichelId }) : await getFeedHome({ aliasId: ctx.aliasId });
      if (!response) return failAction(ctx, 'Feed failed', 'Unable to load feed results.');
      renderList(ctx, 'Feed', response.success?.items || []);
    }
    if (action === 'presence') {
      const presence = await setLivePresence({ aliasId: ctx.aliasId, channel: ctx.heichelId || 'global', status: 'online' });
      if (!presence) return failAction(ctx, 'Live failed', 'Unable to set live presence.');
      const rate = await checkRateLimit({ subject: ctx.aliasId || 'anonymous', bucket: 'ui.presence', limit: 120 });
      if (!rate) return failAction(ctx, 'Live failed', 'Unable to verify live rate limit.');
      const response = await replayLiveEvents({ channel: ctx.heichelId || 'global', since: ctx.cursor });
      if (!response) return failAction(ctx, 'Live failed', 'Unable to replay live events.');
      renderList(ctx, 'Live', response.success || []);
    }
    if (action === 'db') {
      const stats = await getPackedStats();
      const snapshot = await getPackedSnapshot();
      if (!stats || !snapshot) return failAction(ctx, 'DB failed', 'Unable to load packed DB sharing state.');
      renderDb(ctx, stats.success || [], snapshot.success || {});
    }
    if (action === 'sync') {
      const response = await pullSync({ aliasId: ctx.aliasId || 'anonymous', since: ctx.cursor });
      if (!response) return failAction(ctx, 'Sync failed', 'Unable to pull sync changes.');
      ctx.cursor = response.cursor || Date.now();
      renderList(ctx, 'Sync', response.success || []);
    }
    if (action === 'ops') {
      const queues = await platformOps.moderationQueues();
      const migration = await platformOps.migrationDryRun({ heichelId: ctx.heichelId, seriesId: 'root' });
      if (!queues || !migration) return failAction(ctx, 'Ops failed', 'Unable to load moderation and migration state.');
      renderOps(ctx, queues.success || queues, migration.success || migration);
    }
    setStatus(ctx, 'ready');
  } catch (error) {
    setStatus(ctx, error.message || 'error');
  }
}

function failAction(ctx, title, message) {
  renderFailure(ctx, title, message);
  setStatus(ctx, title.toLowerCase());
}

function renderFailure(ctx, title, message) {
  const output = ctx.panel.querySelector('[data-platform-output]');
  output.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = title;
  const body = document.createElement('p');
  body.className = 'awtsmoos-platform-error';
  body.textContent = message;
  output.appendChild(heading);
  output.appendChild(body);
}

function renderList(ctx, title, items) {
  const output = ctx.panel.querySelector('[data-platform-output]');
  output.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = `${title} (${items.length})`;
  output.appendChild(heading);
  const list = document.createElement('div');
  list.className = 'awtsmoos-platform-list';
  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Nothing to show yet.';
    list.appendChild(empty);
  }
  items.slice(0, 20).forEach(item => {
    const card = document.createElement('article');
    card.className = 'awtsmoos-platform-card';
    card.textContent = item.title || item.id || item.postId || item.type || JSON.stringify(item).slice(0, 160);
    list.appendChild(card);
  });
  output.appendChild(list);
}

function renderDb(ctx, stats, snapshot) {
  const items = stats.map(stat => ({ title: `${stat.shard}: ${stat.records} records / ${stat.logicalKeys} keys` }));
  items.push({ title: `manifests: ${snapshot.manifests || 0}` });
  items.push({ title: `migrations: ${snapshot.migrations || 0}` });
  renderList(ctx, 'DB sharing', items);
}

function renderOps(ctx, queues, migration) {
  const queueCount = Array.isArray(queues) ? queues.length : Object.keys(queues || {}).length;
  const found = migration?.found ?? migration?.total ?? migration?.items?.length ?? 0;
  renderList(ctx, 'Ops', [
    { title: `moderation queues: ${queueCount}` },
    { title: `migration dry-run candidates: ${found}` }
  ]);
}

function setStatus(ctx, text) {
  const status = ctx.panel.querySelector('[data-platform-status]');
  if (status) status.textContent = text;
}
