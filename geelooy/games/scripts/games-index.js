import { GAMES } from './games-list.js';

/**
 * B"H
 * Awtsmoos Games index renderer.
 *
 * Chapter 97: one clean renderer gathers all arcade doorways. Search filters,
 * tag chips, featured cards, and graceful empty states are generated from the
 * simple list, not hand-stitched into the page.
 */
const grid = document.getElementById('gamesGrid');
const search = document.getElementById('gameSearch');
const count = document.getElementById('gameCount');
const tags = document.getElementById('tagCloud');
let activeTag = 'All';

renderTags();
render();
search?.addEventListener('input', render);

function renderTags() {
  if (!tags) return;
  const allTags = ['All', ...new Set(GAMES.flatMap(game => game.tags))];
  tags.innerHTML = allTags.map(tag => `<button class="tag ${tag === activeTag ? 'active' : ''}" data-tag="${escapeAttr(tag)}">${escapeHtml(tag)}</button>`).join('');
  tags.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    activeTag = button.dataset.tag || 'All';
    renderTags();
    render();
  }));
}

function render() {
  if (!grid) return;
  const q = (search?.value || '').trim().toLowerCase();
  const filtered = GAMES.filter(game => matches(game, q, activeTag));
  count.textContent = `${filtered.length} doorway${filtered.length === 1 ? '' : 's'}`;
  grid.innerHTML = filtered.length ? filtered.map(card).join('') : `<p class="empty">No games found in this chamber.</p>`;
}

function matches(game, q, tag) {
  const tagOk = tag === 'All' || game.tags.includes(tag);
  const text = `${game.title} ${game.description} ${game.tags.join(' ')}`.toLowerCase();
  return tagOk && (!q || text.includes(q));
}

function card(game, index) {
  const featured = index === 0 ? ' featured' : '';
  return `<a class="gameCard${featured}" href="${escapeAttr(game.href)}" style="--h:${game.hue}">
    <span class="aura"></span>
    <span class="icon">${escapeHtml(game.icon)}</span>
    <strong>${escapeHtml(game.title)}</strong>
    <small>${escapeHtml(game.description)}</small>
    <span class="chips">${game.tags.map(tag => `<em>${escapeHtml(tag)}</em>`).join('')}</span>
  </a>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
