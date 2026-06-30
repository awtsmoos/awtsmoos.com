// B"H
export default /*css*/`
.file-explorer-sidebar { width:var(--sidebar-width); min-width:190px; flex-shrink:0; overflow:auto; padding:12px 10px 22px; border-right:1px solid rgba(125,211,252,.22); background:linear-gradient(180deg, rgba(5,13,26,.92), rgba(8,18,32,.78)); }
.file-explorer.sidebar-collapsed .file-explorer-sidebar { width:0 !important; min-width:0; padding:0; border-right:0; overflow:hidden; }
.file-explorer-sidebar ul { list-style:none; margin:0; padding:0; }
.tree-node-content { width:100%; display:flex; align-items:center; gap:8px; min-height:38px; margin:0 0 7px; padding:8px 10px; border:1px solid rgba(125,211,252,.16); border-radius:13px; background:rgba(15,23,42,.72); color:var(--awts-explorer-text); cursor:pointer; text-align:left; }
.tree-node-content::before { content:""; width:3px; align-self:stretch; border-radius:999px; background:var(--awts-explorer-blue); }
.tree-node-content:hover { border-color:var(--awts-explorer-line-hot); background:rgba(14,55,78,.78); }
.tree-node-content.selected { border-color:var(--awts-explorer-green); background:rgba(6,78,59,.72); box-shadow:0 0 0 2px rgba(52,211,153,.14); }
.node-name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; font-weight:850; }
.toggle-icon { display:inline-grid; place-items:center; width:22px; height:22px; border-radius:8px; color:var(--awts-explorer-muted); }
.toggle-icon svg { width:12px; height:12px; }
.tree-node.mount-local .tree-node-content::before { background:var(--awts-explorer-green); }
.tree-node.mount-preview .tree-node-content::before { background:var(--awts-explorer-purple); }
.tree-node.mount-denied .tree-node-content::before { background:var(--awts-explorer-red); }
`;
/** B"H: sidebar pills are dark, readable, and no longer white-on-white. */
