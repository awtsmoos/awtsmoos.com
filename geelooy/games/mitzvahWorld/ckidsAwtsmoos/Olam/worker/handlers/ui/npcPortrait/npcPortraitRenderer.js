// B"H
/** @file npcPortraitRenderer.js @description Chapter 440: Renders the right-side guide portrait panel. */
import { GUIDE_PORTRAIT } from './npcPortraitData.js';
import { PORTRAIT_CSS } from './npcPortraitCss.js';
export function renderNpcPortrait(data = GUIDE_PORTRAIT) {
  document.getElementById('emerald-npc-portrait-style')?.remove();
  const style = document.createElement('style'); style.id = 'emerald-npc-portrait-style'; style.textContent = PORTRAIT_CSS; document.head.appendChild(style);
  document.getElementById('emerald-npc-portrait')?.remove();
  const el = document.createElement('aside'); el.id = 'emerald-npc-portrait'; el.className = 'emerald-npc-portrait';
  const rows = Object.entries(data.stats || {}).map(([k, v]) => `<div class="emerald-npc-stat"><span>${k}</span><b>${v}</b></div>`).join('');
  el.innerHTML = `<h3>${data.name}</h3><small>${data.role}</small><div class="emerald-npc-face"></div>${rows}<p>${data.note || ''}</p>`;
  document.body.appendChild(el); return el;
}
