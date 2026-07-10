// B"H
/** Search ranks embedded text segments and exposes their source-comment windows. */
import { rangeCard } from './rangeResults.js';
const $ = q => document.querySelector(q);
const form = $('#searchForm');
const input = $('#query');
const series = $('#series');
const status = $('#status');
const results = $('#results');
const clean = value => value == null ? '' : String(value);
function syncStickyOffset() {
  document.documentElement.style.setProperty('--search-sticky-bottom', `${Math.ceil(form.getBoundingClientRect().height + 22)}px`);
}
new ResizeObserver(syncStickyOffset).observe(form);
addEventListener('resize', syncStickyOffset, { passive:true });
syncStickyOffset();
async function loadSeries() {
  try {
    const payload = await (await fetch('/api/social/search/rag/shards')).json();
    for (const lane of payload.success || []) {
      const value = clean(lane.id || lane.lane || lane.shard || lane.name);
      if (!value || [...series.options].some(option => option.value === value)) continue;
      series.add(new Option(clean(lane.label || lane.title || value), value));
    }
  } catch (_) {}
}
function rangeHits(payload) {
  const value = payload?.success ?? payload;
  return Array.isArray(value?.hits) ? value.hits : [];
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  form.classList.add('searching');
  status.textContent = 'Ranking embedded text segments…';
  results.replaceChildren();
  const params = new URLSearchParams({ q, limit:'20', comments:'true', maxCommentRows:'35' });
  if (series.value) params.set('lane', series.value);
  try {
    const response = await fetch(`/api/social/search/rag/query?${params}`);
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(payload?.error?.message || payload?.message || 'Search failed.');
    const hits = rangeHits(payload);
    hits.forEach((hit, index) => results.append(rangeCard(hit, index)));
    status.textContent = hits.length ? `${hits.length} embedded text segments, ordered by relevance` : 'No matching segments found.';
  } catch (error) {
    status.textContent = error.message;
    results.innerHTML = '<div class="empty">The embedded-text search lane could not open.</div>';
  } finally { form.classList.remove('searching'); }
});
loadSeries();
