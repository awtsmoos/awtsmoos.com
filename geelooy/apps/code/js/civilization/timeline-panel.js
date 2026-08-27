// B"H
/** Chapter 605: Timelines become direct object projections. */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
export const CivilizationTimelinePanel = {
  async open(type, id) {
    const data = await CivilizationClient.objectTimeline(type, id);
    const html = `<section class="civ-timeline-panel"><h3>B"H Timeline ${esc(type)}:${esc(id)}</h3><pre>${esc(JSON.stringify(data.success || data.error || [], null, 2))}</pre></section>`;
    return UI.showDialog({ title: 'Object Timeline', contentHTML: html, okText: 'Close', cancelText: '' });
  }
};
