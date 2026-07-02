// B"H
import { ensureSocialPanelStyles } from './styles.js';
import {
  card,
  currentAlias,
  inlineMessaging,
  json,
  status,
  thanksFallback
} from './localSocialWidgets.js';

/**
 * B"H
 * The mobile vessel once reached outside the OS for shared social modules,
 * but that river answered JSON instead of JavaScript. Now the OS imports
 * only local vessels, so the Awtsmoos-light flows without MIME fracture.
 */
const APPS = [
  ['mail', 'My Mail', '/email'],
  ['posts', 'My Posts', '/profile'],
  ['notifications', 'My Notifications', '/notifications'],
  ['heichelos', 'My Heichelos', '/heichelos'],
  ['aliases', 'My Aliases', '/profile'],
  ['drafts', 'Drafts', '/email?folder=drafts'],
  ['saved', 'Saved', '/profile'],
  ['recent', 'Recent Activity', '/notifications']
];

function panelShell() {
  const box = document.createElement('section');
  box.className = 'geelooy-os-social-panel';
  box.innerHTML = `<h2>Geelooy Social Command Center</h2>
    <p>Email is signal. Posts are memory. Heichelos are worlds. Notifications are graph pulses.</p>
    <div class="geelooy-os-social-panel__links"></div>
    <form class="geelooy-os-social-panel__search">
      <label>Search confirmed routes<input name="q" placeholder="Search mail and posts"></label>
      <button type="submit">Search</button>
    </form>
    <div class="geelooy-os-social-panel__grid"></div>`;
  return box;
}

function previewUrl(type, alias) {
  if (type === 'mail') {
    return `/api/social/communications/${encodeURIComponent(alias)}/overview`;
  }
  return '/api/social/feed/home?limit=5';
}

async function loadPreview(type, box) {
  const alias = currentAlias();
  if (!alias) {
    box.append(status('Choose an alias to load live previews.'));
    return;
  }
  box.append(status('Loading live preview…'));
  try {
    const data = await json(previewUrl(type, alias));
    box.lastChild.remove();
    box.append(status(data?.error ? 'Preview unavailable.' : 'Preview loaded.'));
  } catch (error) {
    box.lastChild.remove();
    box.append(status(error.message));
  }
}

function fillGrid(type, grid) {
  if (type === 'message') {
    const alias = currentAlias();
    grid.append(inlineMessaging({ aliases: [alias].filter(Boolean), defaultAlias: alias }));
    return;
  }
  if (type === 'thanks') {
    grid.append(thanksFallback({ href: '/heichelos' }));
    return;
  }
  loadPreview(type, grid);
}

function bindSearch(box) {
  box.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const q = event.currentTarget.q.value.trim();
    if (q) location.href = `/email?search=${encodeURIComponent(q)}`;
  });
}

export function socialPanel({ type = 'command' } = {}) {
  ensureSocialPanelStyles();
  const box = panelShell();
  box.querySelector('.geelooy-os-social-panel__links').replaceChildren(...APPS.map(card));
  fillGrid(type, box.querySelector('.geelooy-os-social-panel__grid'));
  bindSearch(box);
  return box;
}

export async function openSocialWindow(os, type = 'command') {
  const title = APPS.find(app => app[0] === type)?.[1] || 'Geelooy Command Center';
  return os.addWindow({ title, content: socialPanel({ type }), os });
}

export { APPS };
