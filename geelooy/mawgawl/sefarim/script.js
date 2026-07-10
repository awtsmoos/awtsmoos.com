// B"H
/** Every result is a doorway: the vector finds the spark, the hydrated comment reveals its words, and the original post remains the living source. */
const $ = (q) => document.querySelector(q);
const form = $('#searchForm'), input = $('#query'), series = $('#series'), status = $('#status'), results = $('#results');
const clean = (v) => v == null ? '' : String(v);
const enc = encodeURIComponent;
function coords(hit) {
  const row = hit.row || hit, comment = hit.comments?.find((c) => c.found)?.row || {};
  return { heichel: clean(row.heichelId || comment.heichelId || 'ikar'), series: clean(row.seriesId || comment.seriesId || ''), post: clean(row.postId || comment.postId || ''), comment: clean(comment.id || ''), verse: clean(comment.verseSection || '') };
}
function postUrl(c) {
  if (!c.post) return '';
  const base = `/heichelos/${enc(c.heichel)}/series/${enc(c.series || 'root')}/post/${enc(c.post)}`;
  const q = new URLSearchParams();
  if (c.comment) q.set('commentId', c.comment);
  if (c.verse) q.set('verseSection', c.verse);
  return `${base}${q.size ? `?${q}` : ''}`;
}
function words(hit) {
  const row = hit.row || {};
  return clean(row.previewEnglish || row.sampleContent || row.content || row.text || row.title || 'A semantic match from the selected Torah corpus.');
}
function commentCard(entry, parent) {
  const row = entry.row || entry.provenance || {}, c = { ...parent, comment: clean(row.id || entry.id), verse: clean(row.verseSection) };
  const article = document.createElement('article');
  article.className = 'comment';
  const content = clean(row.content || (entry.found ? 'Comment found.' : 'Comment metadata found; full text is not in this shard.'));
  article.innerHTML = `<div><b>${clean(row.author || row.aliasId || 'Comment')}</b><span>${clean(row.subsectionId || row.verseSection || '')}</span></div><p></p>${postUrl(c) ? `<a href="${postUrl(c)}">Open this comment ↗</a>` : ''}`;
  article.querySelector('p').textContent = content;
  return article;
}
function resultCard(hit, index) {
  const c = coords(hit), card = document.createElement('article'), score = Number(hit.score || hit.similarity || 0);
  card.className = 'result'; card.style.setProperty('--delay', `${Math.min(index, 12) * 55}ms`);
  card.innerHTML = `<div class="resultTop"><span class="rank">${index + 1}</span><div><p>${clean(c.series || 'Torah corpus')}</p><h2>${clean((hit.row || {}).title || c.post || 'Matched passage')}</h2></div><strong>${score ? `${Math.round(score * 100)}%` : 'RAG'}</strong></div><p class="preview"></p><div class="actions"></div>`;
  card.querySelector('.preview').textContent = words(hit);
  const actions = card.querySelector('.actions');
  if (postUrl(c)) actions.innerHTML = `<a class="openPost" href="${postUrl(c)}">Read original post ↗</a>`;
  const comments = (hit.comments || []).filter((x) => x.found || x.provenance);
  if (comments.length) {
    const details = document.createElement('details'); details.innerHTML = `<summary>Read ${comments.length} matched comment${comments.length === 1 ? '' : 's'}</summary>`;
    const list = document.createElement('div'); list.className = 'comments'; comments.forEach((x) => list.append(commentCard(x, c))); details.append(list); actions.append(details);
  }
  return card;
}
function unpack(payload) { const v = payload?.success ?? payload; return v?.hits || v?.results || v?.items || []; }
async function loadSeries() {
  try { const p = await (await fetch('/api/social/search/rag/shards')).json(); (p.success || []).forEach((lane) => { const v = clean(lane.id || lane.lane || lane.shard || lane.name); if (!v || [...series.options].some((o) => o.value === v)) return; series.add(new Option(clean(lane.label || lane.title || v), v)); }); } catch {}
}
form.addEventListener('submit', async (e) => {
  e.preventDefault(); const q = input.value.trim(); if (!q) return;
  form.classList.add('searching'); status.textContent = 'Searching the hidden lanes…'; results.replaceChildren();
  const p = new URLSearchParams({ q, limit: '20', comments: 'true', maxCommentRows: '12' }); if (series.value) p.set('lane', series.value);
  try { const response = await fetch(`/api/social/search/rag/query?${p}`), payload = await response.json(); if (!response.ok || payload.error) throw new Error(payload?.error?.message || payload?.message || 'Search failed.'); const items = unpack(payload); items.forEach((item, i) => results.append(resultCard(item, i))); status.textContent = items.length ? `${items.length} sparks found` : 'No sparks found. Try broader words or another series.'; } catch (err) { status.textContent = err.message; results.innerHTML = '<div class="empty">The search lane could not open. The page itself is ready; verify that the RAG shards are mounted on this server.</div>'; } finally { form.classList.remove('searching'); }
});
loadSeries();
