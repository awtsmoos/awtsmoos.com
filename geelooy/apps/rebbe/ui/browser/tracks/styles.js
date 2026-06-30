//B"H

/**
 * B"H
 * Track command stylesheet. The Awtsmoos stretches cramped buttons into clean
 * hit targets: bigger pills, readable labels, stable grids, and mobile dignity.
 * @returns {void}
 */
export function ensureTrackStyles() {
  if (document.getElementById('track-command-styles')) return;
  const style = document.createElement('style');
  style.id = 'track-command-styles';
  style.textContent = css();
  document.head.appendChild(style);
}

function css() {
  return `
.premium-event-toolbar{border:1px solid rgba(0,243,255,.42);border-radius:24px;background:radial-gradient(circle at top left,rgba(0,243,255,.20),transparent 46%),linear-gradient(135deg,rgba(0,0,0,.80),rgba(255,204,0,.06));padding:18px;margin-bottom:14px;display:grid;grid-template-columns:minmax(210px,1fr) auto;gap:18px;align-items:center;box-shadow:0 16px 45px rgba(0,0,0,.32)}
.event-toolbar-copy{min-width:0}.toolbar-kicker{display:block;color:var(--c-yellow);font-size:10px;letter-spacing:3px;text-transform:uppercase}.premium-event-toolbar strong{display:block;color:#fff;font-size:clamp(19px,2.5vw,26px);line-height:1.08;word-break:break-word}.toolbar-sub{color:#9cc;margin-top:7px}.event-toolbar-actions,.item-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.premium-track-item{grid-template-columns:auto minmax(0,1fr) auto!important;border:1px solid rgba(0,243,255,.16);border-radius:16px;margin:9px 0;background:linear-gradient(90deg,rgba(255,255,255,.03),rgba(0,243,255,.018));padding:12px!important}.track-picker input{width:22px;height:22px;accent-color:var(--c-yellow)}.track-main-button{background:transparent;border:0;color:white;text-align:left;display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer}.track-number{color:var(--c-yellow);font-weight:900}.t-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.t-dur{color:#dff;opacity:.86;align-self:center}.cached-dot{color:var(--c-cyan);font-weight:900;text-shadow:0 0 10px var(--c-cyan)}.command-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;min-height:40px;min-width:92px;border-radius:999px!important;padding:9px 13px!important;line-height:1!important;white-space:nowrap;box-shadow:inset 0 0 14px rgba(0,243,255,.06)}.command-btn:hover{transform:translateY(-1px)}.command-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}.cmd-icon{font-size:16px;color:var(--c-yellow)}.cmd-label{font-size:12px;letter-spacing:.9px}.mini-playlist-track,.mini-playlist-event,.mini-playlist-selected-tracks{border-color:rgba(255,204,0,.7)!important;color:var(--c-yellow)!important}.mini-download-event,.mini-download{border-color:rgba(0,243,255,.75)!important}@media(max-width:1100px){.premium-event-toolbar{grid-template-columns:1fr}.event-toolbar-actions{justify-content:stretch;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.command-btn{width:100%;min-width:0}}@media(max-width:720px){.premium-track-item{display:grid!important;grid-template-columns:auto 1fr!important}.item-actions{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-content:stretch}.event-toolbar-actions{grid-template-columns:1fr 1fr}.track-picker{align-self:center}.command-btn{width:100%;min-height:44px}}`;
}
