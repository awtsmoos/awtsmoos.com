// B"H
/** Chapter 565: Desktop icons become doors into living civilization projections. */
import { CivilizationOSClient } from './client.js';
const icons = [
  ['Pulse', '⚡', 'state'], ['Inbox', '✉️', 'inbox'], ['Map', '🕸️', 'map'],
  ['Agents', '🤖', 'agents'], ['Memory', '🧠', 'memory'], ['Reputation', '✦', 'reputation']
];
function icon([label, glyph, mode], open) {
  const node = document.createElement('button');
  node.className = 'civ-os-icon';
  node.innerHTML = `<span class="civ-os-glyph">${glyph}</span><span>${label}</span>`;
  node.onclick = () => open(mode, label);
  return node;
}
async function content(mode, label) {
  const [state, feed, card] = await Promise.all([
    CivilizationOSClient.state().catch(() => ({})),
    CivilizationOSClient.feed().catch(() => ({})),
    CivilizationOSClient.livingCard().catch(() => ({}))
  ]);
  const box = document.createElement('div');
  box.style.cssText = 'padding:12px;color:#e8f7ff;background:#020611;min-height:100%;font-family:monospace;';
  box.innerHTML = `<h3>B"H ${label}</h3><pre>${JSON.stringify({ mode, state: state.success, feed: feed.success, livingCard: card.success }, null, 2)}</pre>`;
  return box;
}
export function initCivilizationDesktop({ os } = {}) {
  const desktop = document.getElementById('desktop');
  if (!desktop || desktop.dataset.civilizationDesktop) return;
  desktop.dataset.civilizationDesktop = 'yes';
  const open = async (mode, label) => os?.addWindow?.({ title: `Civilization ${label}`, content: await content(mode, label), os });
  for (const item of icons) desktop.appendChild(icon(item, open));
}
