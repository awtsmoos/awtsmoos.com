// B"H
/** Chapter 606: Object health opens as its own tiny prophecy. */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
export const CivilizationObjectHealth = {
  async open(type, id) {
    const data = await CivilizationClient.inspectObject(type, id);
    const health = data.success?.health || data.error || {};
    const html = `<section class="civ-object-health"><h3>B"H Object Health ${esc(type)}:${esc(id)}</h3><span class="civ-health-badge">${esc(health.level || 'unknown')}</span><pre>${esc(JSON.stringify(health, null, 2))}</pre></section>`;
    return UI.showDialog({ title: 'Object Health', contentHTML: html, okText: 'Close', cancelText: '' });
  }
};
