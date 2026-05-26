// B"H
/**
 * @module platformPanel
 * @description Mounts the visible platform console for feed, live state,
 * packed DB sharing, sync, moderation, media, graph, jobs, cache, and more.
 */
import { handleSearch, runAction } from './platformPanelActions.js';

const ACTIONS = [
  ['feed', 'Feed'],
  ['presence', 'Presence'],
  ['db', 'DB'],
  ['cache', 'Cache'],
  ['sync', 'Sync'],
  ['searchIndex', 'Index'],
  ['graph', 'Graph'],
  ['thread', 'Thread'],
  ['digest', 'Digest'],
  ['media', 'Media'],
  ['relationships', 'Follows'],
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
  panel.innerHTML = makePanelHtml();
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

function makePanelHtml() {
  return `
    <button class="awtsmoos-platform-toggle" type="button" aria-expanded="false">Platform</button>
    <section class="awtsmoos-platform-body" hidden>
      <header><strong>Awtsmoos Platform</strong><small data-platform-status>ready</small></header>
      <form class="awtsmoos-platform-search"><input name="q" placeholder="Search posts, graph, comments" /><button type="submit">Search</button></form>
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
