// B"H
/** Range cards reveal one embedded segment and its wider source-comment window. */
const clean = value => value == null ? '' : String(value);
const enc = encodeURIComponent;
const allowed = new Set(['SUP','SUB','BR','EM','STRONG','B','I','SMALL','MARK','SPAN']);
function percent(hit) {
  const n = Number(hit.percent ?? Number(hit.score || 0) * 100);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}
function safeFragment(html) {
  const doc = new DOMParser().parseFromString(`<div>${clean(html)}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  root.querySelectorAll('*').forEach(node => {
    if (!allowed.has(node.tagName)) return node.replaceWith(...node.childNodes);
    [...node.attributes].forEach(attr => {
      if (node.tagName !== 'SPAN' || !['class','data-footnote'].includes(attr.name)) node.removeAttribute(attr.name);
    });
  });
  const fragment = document.createDocumentFragment();
  fragment.append(...root.childNodes);
  return fragment;
}
function exactUrl(row, parent) {
  const heichel = clean(row.heichelId || parent.heichelId || 'ikar');
  const series = clean(row.seriesId || parent.seriesId || 'root');
  const post = clean(row.postId || parent.postId || '');
  if (!post || !row.id) return '';
  const q = new URLSearchParams({ commentId:row.id });
  if (row.verseSection !== '' && row.verseSection != null) q.set('verseSection', row.verseSection);
  return `/heichelos/${enc(heichel)}/series/${enc(series)}/post/${enc(post)}?${q}`;
}
function rangeLabel(row) {
  const start = row.verseStart ?? row.verseSection ?? '?';
  const end = row.verseEnd ?? start;
  return String(start) === String(end) ? `Verse ${start}` : `Verses ${start}–${end}`;
}
function commentRow(entry, parent) {
  const row = entry.row || entry.provenance || {};
  const link = document.createElement('a');
  link.className = 'rangeComment';
  link.href = exactUrl(row, parent) || '#';
  link.innerHTML = '<span class="commentCoord"></span><span class="commentText"></span><span class="commentArrow">↗</span>';
  link.querySelector('.commentCoord').textContent = `§ ${row.subsectionId || row.verseSection || ''}`;
  link.querySelector('.commentText').append(safeFragment(row.content || row.text || 'Comment'));
  return link;
}
function segmentMeta(row, shown) {
  const segment = Number(row.subChunkIndex ?? row.qIndex ?? 0) + 1;
  const total = Number(row.subChunkCount || 1);
  const parentCount = Number(row.commentIds?.length || row.commentCount || 0);
  const indexes = row.commentStart == null ? '' : ` · parent indexes ${row.commentStart}–${row.commentEnd}`;
  return `Embedded text segment ${segment} of ${total} · source window ${parentCount} comments${indexes} · ${row.vectorDimensions || row.dimensions || 384} dimensions · ${shown} source comments shown`;
}
export function rangeCard(hit, index) {
  const row = hit.row || {};
  const comments = (hit.comments || []).filter(entry => entry?.found || entry?.row || entry?.provenance);
  const pct = percent(hit);
  const card = document.createElement('article');
  card.className = 'result range-result';
  card.style.setProperty('--delay', `${Math.min(index, 12) * 45}ms`);
  card.style.setProperty('--relevance', `${pct}%`);
  card.innerHTML = `<header class="resultTop"><span class="rank"></span><div><p class="eyebrow"></p><h2></h2></div><strong class="score"></strong></header><div class="meter"><i></i></div><p class="rangePreview"></p><div class="rangeMeta"></div><details class="commentMenu"><summary><span class="openLabel"></span><span class="closeLabel">Collapse comments ↑</span></summary><div class="commentList"></div></details>`;
  card.querySelector('.rank').textContent = index + 1;
  card.querySelector('.eyebrow').textContent = `${clean(row.seriesId)} · ${rangeLabel(row)}`;
  card.querySelector('h2').textContent = clean(row.title || row.postId || 'Embedded segment');
  card.querySelector('.score').textContent = `${pct.toFixed(1)}% relevant`;
  card.querySelector('.rangePreview').append(safeFragment(row.text || row.previewEnglish || row.sampleContent || 'Matching embedded text segment'));
  card.querySelector('.rangeMeta').textContent = segmentMeta(row, comments.length);
  card.querySelector('.openLabel').textContent = `Browse source comments (${comments.length} shown)`;
  const list = card.querySelector('.commentList');
  comments.forEach(entry => list.append(commentRow(entry, row)));
  if (!comments.length) list.textContent = 'No source comments were hydrated for this parent window.';
  return card;
}
