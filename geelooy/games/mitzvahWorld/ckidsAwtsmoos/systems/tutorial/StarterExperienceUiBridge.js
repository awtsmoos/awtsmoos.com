// B"H
/**
 * StarterExperienceUiBridge
 * The Awtsmoos gives the first minutes a visible heartbeat in the same HUD
 * vessel as quests and village life, without touching the heavy index bridge.
 */
const scope = globalThis;
const EVENT = 'mitzvah-world:starter-experience';
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
function root() { return scope.document?.getElementById?.('mitzvahTopLeft') || null; }
function panel() {
  const parent = root(); if (!parent) return null;
  let el = scope.document.getElementById('uiStarterExperience');
  if (!el) { el = scope.document.createElement('section'); el.id = 'uiStarterExperience'; el.className = 'mitzvahPanel'; parent.appendChild(el); }
  return el;
}
function rows(detail) {
  const done = new Set(detail?.progress?.next ? (detail?.state?.completed || []) : (detail?.state?.completed || detail?.steps?.map(s => s.id) || []));
  return (detail?.steps || []).map(step => `<div class="${done.has(step.id) ? 'mitzvahDone' : ''}">${done.has(step.id) ? '✓' : '•'} ${esc(step.title)}<br><small>${esc(step.objective || step.hint)}</small></div>`).join('');
}
export function renderStarterExperience(detail = {}) {
  const el = panel(); if (!el) return false;
  const next = detail.progress?.next;
  const path = detail.state?.chosenPath?.title || 'Choose soon';
  el.innerHTML = `<div class="mitzvahPanelHead"><div class="mitzvahTitle">First Village Path</div></div><div class="mitzvahPanelBody"><small>${esc(detail.progress?.done || 0)}/${esc(detail.progress?.total || 0)} complete · ${esc(path)}</small>${next ? `<p><b>${esc(next.title)}</b><br>${esc(next.hint || next.objective)}</p>` : `<p class="mitzvahDone">Starter path complete. The village knows you.</p>`}${rows(detail)}</div>`;
  scope.__MITZVAH_LAST_STARTER_EXPERIENCE_UI__ = detail;
  return true;
}
if (scope.addEventListener) scope.addEventListener(EVENT, e => renderStarterExperience(e.detail || {}));
export default renderStarterExperience;
