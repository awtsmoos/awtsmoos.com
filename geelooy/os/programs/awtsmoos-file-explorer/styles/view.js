// B"H
export default /*css*/`
.file-explorer-body { position:relative; flex:1 1 auto; min-width:0; min-height:0; height:100%; padding:18px; overflow:auto; background:linear-gradient(135deg, rgba(3,10,22,.42), rgba(8,20,36,.18)); }
.file-explorer-body.drag-over::after { content:"Drop here"; position:absolute; inset:16px; display:grid; place-items:center; border:2px dashed var(--awts-explorer-green); border-radius:22px; background:rgba(5,46,22,.18); color:#bbf7d0; font-weight:900; z-index:9; pointer-events:none; }
.icons-view { display:grid; grid-template-columns:repeat(auto-fill, minmax(136px, 1fr)); gap:16px; align-content:start; }
.file-item { position:relative; display:flex; flex-direction:column; align-items:center; min-height:142px; padding:15px 11px 12px; border:1px solid rgba(125,211,252,.18); border-radius:18px; background:var(--awts-explorer-card); color:var(--awts-explorer-text); cursor:pointer; isolation:isolate; box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 12px 30px rgba(0,0,0,.18); transition:transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease; }
.file-item:hover { transform:translateY(-3px); border-color:var(--awts-explorer-line-hot); background:var(--awts-explorer-card-hot); box-shadow:var(--awts-explorer-glow); }
.file-item.selected { border-color:var(--awts-explorer-green); box-shadow:0 0 0 3px rgba(52,211,153,.18), var(--awts-explorer-shadow); }
.file-item.drag-over { outline:2px dashed var(--awts-explorer-green); outline-offset:3px; }
.file-item:focus-visible { outline:2px solid #ecfeff; outline-offset:3px; }
.file-item .icon-img { display:grid; place-items:center; width:64px; height:64px; margin-bottom:10px; filter:drop-shadow(0 10px 16px rgba(0,0,0,.35)); }
.icon-img svg, .small-icon svg { display:block; width:100% !important; height:100% !important; overflow:visible; }
.file-name { width:100%; color:var(--awts-explorer-text); font-size:13px; font-weight:850; line-height:1.25; text-align:center; overflow-wrap:anywhere; }
.item-meta { margin-top:5px; color:var(--awts-explorer-faint); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
.empty-folder-state, .remote-folder-state, .semantic-empty-state, .semantic-error-state { grid-column:1 / -1; display:grid; place-items:center; min-height:42vh; padding:26px; color:var(--awts-explorer-muted); text-align:center; border:1px dashed rgba(125,211,252,.28); border-radius:20px; background:rgba(2,6,23,.2); }
.semantic-error-state { border-color:rgba(251,113,133,.42); color:#fecdd3; }
`;
/** B"H: cards are dark, clickable, focused, and empty states have semantic style hooks. */
