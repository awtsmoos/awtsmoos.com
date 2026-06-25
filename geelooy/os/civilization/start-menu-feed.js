// B"H
/** Chapter 566: The start menu receives a second bloodstream of recent sparks. */
import { CivilizationOSClient } from './client.js';
function label(event) { return `${event?.type || 'event'} → ${event?.target?.type || ''}:${event?.target?.id || ''}`; }
export async function renderCivilizationStartFeed(menu) {
  if (!menu) return;
  let feed = menu.querySelector('.civ-start-feed');
  if (!feed) {
    feed = document.createElement('div');
    feed.className = 'civ-start-feed';
    menu.appendChild(feed);
  }
  const data = await CivilizationOSClient.feed().catch(() => ({ success: [] }));
  const items = (data.success || []).slice(0, 5);
  feed.innerHTML = `<strong>B"H Civilization Pulse</strong>${items.map(item => `<div>${label(item)}</div>`).join('') || '<div>No sparks yet.</div>'}`;
}
