// B"H
/**
 * @module platformPanel
 * @description Mounts the visible AwtsmoosDB civilization console for feed,
 * live state, storage health, graph, notifications, jobs, and projections.
 */
import { handleSearch, runAction } from './platformPanelActions.js';

const ACTIONS = [
  ['civilization', 'Civilization'],
  ['db', 'AwtsDB'],
  ['feed', 'Feed'],
  ['presence', 'Presence'],
  ['graph', 'Graph'],
  ['searchIndex', 'Index'],
  ['digest', 'Digest'],
  ['thread', 'Thread'],
  ['relationships', 'Follows'],
  ['media', 'Media'],
  ['cache', 'Cache'],
  ['sync', 'Sync'],
  ['jobs', 'Jobs'],
  ['permissions', 'Perms'],
  ['ops', 'Ops']
];

export function mountPlatformPanel({
  root = document.body,
  aliasId = window.curAlias || '',
  heichelId = window.heichelId || window.currentHeichelId || ''
} = {}) {
  if (!root || document.querySelector('.awtsmoos-platform-panel')) return null;

  const panel = document.createElement('aside');
  panel.className = 'awtsmoos-platform-panel';
  panel.innerHTML = makePanelHtml({ aliasId, heichelId });
  root.appendChild(panel);

  const ctx = { panel, aliasId, heichelId, cursor: 0 };
  panel.querySelector('.awtsmoos-platform-toggle').onclick = () => togglePanel(ctx);
  panel.querySelector('.awtsmoos-platform-search').onsubmit = event => handleSearch(event, ctx);
  panel.querySelectorAll('[data-platform-action]').forEach(button => {
    button.onclick = () => runAction(button.dataset.platformAction, ctx);
  });
  runAction('civilization', ctx);
  return panel;
}

function makePanelHtml({ aliasId, heichelId }) {
  return `
    <button class="awtsmoos-platform-toggle" type="button" aria-expanded="false">AwtsmoosDB</button>
    <section class="awtsmoos-platform-body" hidden>
      <header class="awtsmoos-platform-head">
        <span><strong>Awtsmoos Civilization</strong><small data-platform-status>awakening</small></span>
        <span class="awtsmoos-platform-engine">DosDB ⇢ AwtsmoosDB</span>
      </header>
      <p class="awtsmoos-platform-intro">One database. Objects, graph, events, feed, search, and projections flowing from the same root.</p>
      <div class="awtsmoos-platform-context">
        <span>alias: ${escapeHtml(aliasId || 'anonymous')}</span>
        <span>heichel: ${escapeHtml(heichelId || 'global')}</span>
      </div>
      <form class="awtsmoos-platform-search"><input name="q" placeholder="Search posts, graph, comments, civilization" /><button type="submit">Search</button></form>
      <div class="awtsmoos-platform-actions">
        ${ACTIONS.map(([action, label]) => `<button type="button" data-platform-action="${action}">${label}</button>`).join('')}
      </div>
      <div class="awtsmoos-platform-output" data-platform-output></div>
    </section>`;
}

function togglePanel(ctx) {
  const body = ctx.panel.querySelector('.awtsmoos-platform-body');
  const toggle = ctx.panel.querySelector('.awtsmoos-platform-toggle');
  body.hidden = !body.hidden;
  toggle.setAttribute('aria-expanded', String(!body.hidden));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
