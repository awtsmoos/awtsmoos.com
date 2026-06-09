// B"H
/** @file emeraldHudRenderer.js @description Chapter 421: Renders the screenshot-style Emerald HUD shell. */
import { areaStatsPanel } from './areaStatsPanel.js';
import { bottomIconBar } from './bottomIconBar.js';
import { currentNpcPanel } from './currentNpcPanel.js';
import { installEmeraldHudCss } from './emeraldHudCss.js';
import { playerVitalsPanel } from './playerVitalsPanel.js';
import { questPanel } from './questPanel.js';
import { titlePanel } from './titlePanel.js';
export function renderEmeraldEntryHud(entryScene = {}) {
  installEmeraldHudCss();
  document.getElementById('emerald-entry-hud')?.remove();
  const host = document.createElement('div');
  host.id = 'emerald-entry-hud';
  host.className = 'emerald-entry-hud';
  const hud = entryScene.hud || {}, scene = entryScene.manifest || {};
  host.innerHTML = [titlePanel(scene), areaStatsPanel(hud.areaStats), questPanel(scene.quest), playerVitalsPanel(hud.playerPanel), currentNpcPanel(hud.npcPanel), `<div class="ehud-talk">${scene.prompt || 'Press [E] to Talk'}</div>`, bottomIconBar(hud.bottomIcons || [])].join('');
  document.body.appendChild(host);
  return host;
}
