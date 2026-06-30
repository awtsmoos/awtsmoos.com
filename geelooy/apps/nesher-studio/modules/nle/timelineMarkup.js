/* B"H
 * Timeline markup: semantic HTML for ruler, playhead, markers, tracks, and clips.
 */
export function timelineHtml(view) {
  return `<div class="timeline-real" style="--zoom:${view.zoom}">${ruler(view)}${markerLane(view)}${tracks(view)}<i class="playhead" style="left:${view.playheadPct}%"></i></div>`;
}
function ruler(view) {
  return `<div class="timeline-ruler">${view.ticks.map(t => `<span style="left:${t.pct}%">${safe(t.label)}</span>`).join('')}</div>`;
}
function markerLane(view) {
  const body = view.markers.length ? view.markers.map(m => `<b class="marker" style="left:${m.left}%" title="${safe(m.label)} @ ${m.at}s">◆</b>`).join('') : '<em>No markers yet</em>';
  return `<div class="timeline-markers"><strong>Markers</strong><div class="timeline-lane">${body}</div></div>`;
}
function tracks(view) {
  return view.tracks.map(t => `<section class="timeline-track" data-track-id="${safe(t.id)}"><header><b>${safe(t.name)}</b><small>${safe(t.kind)} · ${t.count} clips</small></header><div class="timeline-lane">${clips(t.clips)}</div></section>`).join('');
}
function clips(items) {
  return items.map(c => `<button data-clip-id="${safe(c.id)}" class="clip ${classes(c)}" style="left:${c.left}%;width:${c.width}%" title="${safe(title(c))}"><span>${safe(c.name)}</span><small>${fmt(c.start)}-${fmt(c.end)}s</small></button>`).join('');
}
function classes(c) { return [c.active ? 'active' : '', c.muted ? 'muted' : '', c.disabled ? 'disabled' : '', c.fadeIn || c.fadeOut ? 'faded' : ''].join(' '); }
function title(c) { return `${c.name}: ${fmt(c.start)}-${fmt(c.end)}s fade ${c.fadeIn || 0}/${c.fadeOut || 0}`; }
function fmt(value) { return Number(value || 0).toFixed(1); }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
