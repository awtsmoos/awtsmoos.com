// B"H
/** Chapter 613: Universal search now searches actual Universal Objects first,
 * then blends civilization events and the living alias card.
 */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
import { CivilizationObjectInspector } from './object-inspector.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function objectRow(item) {
  return `<button class="civ-notification-object civ-semantic-${esc(item.semantic || 'knowledge')}" data-object="${esc(item.type)}:${esc(item.id)}"><b>${esc(item.icon || '◈')} ${esc(item.title || item.id)}</b><br><small>${esc(item.type)}:${esc(item.id)}</small></button>`;
}
function eventRow(item) {
  const target = item.target ? `${item.target.type || 'target'}:${item.target.id || ''}` : '';
  return `<div class="civ-notification-object civ-semantic-presence"><b>${esc(item.type || 'event')}</b><br><small>${esc(target || item.createdAt || '')}</small></div>`;
}
export const UniversalCivilizationSearch = {
  async open() {
    const q = prompt('Search objects, events, aliases, files, posts:', '') || '';
    const [objects, events, card] = await Promise.all([CivilizationClient.objects(q, 30), CivilizationClient.events(40), CivilizationClient.livingCard()]);
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const eventFound = (events.success || []).filter(item => !terms.length || terms.every(term => JSON.stringify(item).toLowerCase().includes(term))).slice(0, 12);
    const objectFound = (objects.success || []).slice(0, 30);
    const living = card.success ? `<div class="civ-living-card"><b>Living Alias</b><pre>${esc(JSON.stringify(card.success.universalObject || card.success.profile || {}, null, 2))}</pre></div>` : '';
    const html = `<section class="civilization-cockpit"><header><h3>B"H Universal Search</h3><span class="civ-chip">${objectFound.length} objects · ${eventFound.length} events</span></header><div class="civ-search-shell"><input readonly value="${esc(q)}"></div><div class="civ-object-toolbar">${objectFound.map(objectRow).join('') || '<p>No object results yet.</p>'}</div>${living}<h4>Events</h4>${eventFound.map(eventRow).join('') || '<p>No event results.</p>'}</section>`;
    const dialog = await UI.showDialog({ title: 'Universal Civilization Search', contentHTML: html, okText: 'Close', cancelText: '' });
    setTimeout(() => document.querySelectorAll('[data-object]').forEach(node => node.onclick = () => {
      const [type, id] = node.dataset.object.split(':');
      CivilizationObjectInspector.open(type, id);
    }), 0);
    return dialog;
  }
};
