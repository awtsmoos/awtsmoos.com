// B"H
export default /*css*/`
.details-view { display:flex; flex-direction:column; gap:6px; min-width:520px; }
.details-view::before { content:"Name    Type    Mount"; position:sticky; top:0; z-index:4; padding:9px 14px; border:1px solid var(--awts-explorer-line); border-radius:12px; background:var(--awts-explorer-panel-strong); color:var(--awts-explorer-muted); font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
.details-view .file-item { display:grid; grid-template-columns:40px minmax(180px, 1fr) 86px minmax(150px, 220px); align-items:center; min-height:56px; padding:8px 12px; gap:12px; border-radius:14px; }
.details-view .file-item .icon-img { width:36px; height:36px; margin:0; }
.details-view .file-name { text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.details-view .item-meta { margin:0; }
.details-view .mount-badge { justify-self:end; margin:0; max-width:210px; }
.details-view .file-item:hover { transform:translateX(2px); }
.details-view .awts-kind-folder .file-name::after { content:" /"; color:var(--awts-explorer-gold); }
`;
/** B"H: details mode targets real file items and becomes a clean ledger. */
