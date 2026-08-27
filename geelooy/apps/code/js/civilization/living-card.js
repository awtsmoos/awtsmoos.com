// B"H
/** Chapter 584: Any alias can become a hoverable living card vessel. */
import { UI } from '../ui.js';
import { CivilizationClient } from './client.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function block(title, value) { return `<div class="civ-card"><div class="civ-card-title">${esc(title)}</div><pre>${esc(JSON.stringify(value, null, 2))}</pre></div>`; }
export const CivilizationLivingCard = {
  async open(aliasId = CivilizationClient.alias()) {
    const data = await CivilizationClient.livingCard(aliasId);
    const card = data.success || { aliasId, note: 'No living card available yet.' };
    const html = `<section class="civilization-cockpit"><header><h3>B"H Living Card</h3><span class="civ-chip"><i class="civ-presence-orb"></i>${esc(aliasId || 'unknown')}</span></header>${block('presence', card.presence || {})}${block('reputation', card.reputation || {})}${block('knowledge links', card.knowledgeLinks || [])}${block('recent activity', card.recentActivity || [])}</section>`;
    return UI.showDialog({ title: 'Living Profile Card', contentHTML: html, okText: 'Close', cancelText: '' });
  }
};
