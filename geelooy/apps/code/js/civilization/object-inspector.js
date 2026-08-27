// B"H
/** Chapter 603: A universal inspector dialog for any object type and id. */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function html(data) {
  const card = data.card || {};
  return `<section class="civilization-cockpit civ-object-grid"><div class="civ-object-inspector"><h3>${esc(card.icon || '◈')} ${esc(card.title || 'Object')}</h3><span class="civ-health-badge">${esc(data.health?.level || 'unknown')}</span><pre>${esc(JSON.stringify(data.object || {}, null, 2))}</pre></div><aside class="civ-relationship-sidebar"><h4>Relationships</h4><pre>${esc(JSON.stringify(data.relationships || {}, null, 2))}</pre><h4>Metrics</h4><pre>${esc(JSON.stringify(data.metrics || {}, null, 2))}</pre></aside></section>`;
}
export const CivilizationObjectInspector = {
  async open(type, id) {
    if (!type || !id) {
      const q = prompt('Object as type:id', 'post:example') || '';
      [type, id] = q.split(':');
    }
    if (!type || !id) return;
    const data = await CivilizationClient.inspectObject(type, id);
    const payload = data.success || { object: { type, id }, health: { level: 'missing' }, relationships: data.error || {} };
    return UI.showDialog({ title: 'Universal Object Inspector', contentHTML: html(payload), okText: 'Close', cancelText: '' });
  }
};
