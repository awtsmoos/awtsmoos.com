// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceCss.js
 * @description Localizes responsive acting controls, recording evidence, take cards, filters, and touch overlay.
 * The Awtsmoos clothes function without hiding truth; Awtsmoos.com keeps every panel,
 * filter, button, safe inset, status, and mobile gesture readable without horizontal overflow in rhyme.
 */

export const MOVIE_STUDIO_PERFORMANCE_CSS = `
.Awtsmoos-movie-studio .performance-panel{display:grid;gap:10px;min-width:0;padding:10px;border-top:1px solid #344055;background:#111722}
.Awtsmoos-movie-studio .performance-panel h3,.Awtsmoos-movie-studio .performance-panel h4{margin:0;color:#f4d4a2}
.Awtsmoos-movie-studio .performance-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.Awtsmoos-movie-studio .performance-grid label{display:grid;gap:3px;min-width:0;font-size:11px;color:#bfc9d9}
.Awtsmoos-movie-studio .performance-grid input,.Awtsmoos-movie-studio .performance-grid select{width:100%;min-width:0;box-sizing:border-box}
.Awtsmoos-movie-studio .performance-options,.Awtsmoos-movie-studio .performance-buttons,.Awtsmoos-movie-studio .performance-take-filters{display:flex;flex-wrap:wrap;gap:7px;align-items:center;min-width:0}
.Awtsmoos-movie-studio .performance-take-filters label{display:flex;gap:5px;align-items:center;min-width:0}
.Awtsmoos-movie-studio .performance-status{padding:8px;border-radius:6px;background:#1b2535;color:#dce6f5;overflow-wrap:anywhere}
.Awtsmoos-movie-studio .performance-panel[data-recording=true] .performance-status{background:#541923;color:#fff0f1;box-shadow:0 0 0 1px #f05463 inset}
.Awtsmoos-movie-studio .performance-actions{display:flex;flex-wrap:wrap;gap:6px;max-height:150px;overflow:auto}
.Awtsmoos-movie-studio .performance-takes{display:grid;gap:6px;min-width:0}
.Awtsmoos-movie-studio .performance-take-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;padding:7px;border:1px solid #39465c;border-radius:6px;margin-top:6px}
.Awtsmoos-movie-studio .performance-take-card small{grid-column:1/-1;color:#9eabc0}
.Awtsmoos-movie-studio .performance-touch{position:absolute;inset:0;z-index:16;pointer-events:none;touch-action:none;user-select:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
.Awtsmoos-movie-studio .performance-touch button{pointer-events:auto;min-width:52px;min-height:52px;border-radius:50%;touch-action:none}
.Awtsmoos-movie-studio .performance-touch-status{position:absolute;top:calc(10px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);padding:7px 12px;border-radius:999px;background:#671622;color:white}
.Awtsmoos-movie-studio .performance-dpad{position:absolute;left:calc(14px + env(safe-area-inset-left));bottom:calc(14px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(3,54px);grid-template-areas:". up ." "left down right";gap:4px}
.Awtsmoos-movie-studio [data-performance-direction=forward]{grid-area:up}.Awtsmoos-movie-studio [data-performance-direction=left]{grid-area:left}.Awtsmoos-movie-studio [data-performance-direction=backward]{grid-area:down}.Awtsmoos-movie-studio [data-performance-direction=right]{grid-area:right}
.Awtsmoos-movie-studio .performance-touch-actions{position:absolute;right:calc(14px + env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px;max-width:190px}
@media(max-width:760px){.Awtsmoos-movie-studio .performance-grid{grid-template-columns:1fr}.Awtsmoos-movie-studio .performance-panel{font-size:13px}.Awtsmoos-movie-studio .performance-touch:not([hidden]){display:block}}
`;
