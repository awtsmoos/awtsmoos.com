// B"H
/** Chapter 604: Relationships can be opened directly as their own projection. */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
export const CivilizationRelationshipSidebar = {
  async open(type, id) {
    const data = await CivilizationClient.objectRelationships(type, id);
    const html = `<section class="civ-relationship-sidebar"><h3>B"H Relationships ${esc(type)}:${esc(id)}</h3><pre>${esc(JSON.stringify(data.success || data.error || {}, null, 2))}</pre></section>`;
    return UI.showDialog({ title: 'Object Relationships', contentHTML: html, okText: 'Close', cancelText: '' });
  }
};
