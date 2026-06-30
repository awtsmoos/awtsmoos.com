// B"H
export default /*css*/`
.file-explorer-header { z-index:3; display:flex; flex-direction:column; gap:10px; padding:12px 14px; border-bottom:1px solid rgba(125,211,252,.22); background:linear-gradient(180deg, rgba(4,12,24,.96), rgba(7,18,34,.88)); }
.button-bar { display:flex; align-items:center; gap:10px; width:100%; flex-wrap:wrap; }
.toolbar-spacer { flex:1 1 auto; }
.menu-buttons, .view-controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.menu-buttons button, .view-controls button, .sidebar-toggle-btn, .nav-btn, .edit-path-btn { border:1px solid rgba(125,211,252,.28); border-radius:999px; background:rgba(15,23,42,.8); color:var(--awts-explorer-text); cursor:pointer; }
.menu-buttons button, .view-controls button { padding:8px 14px; font-size:12px; font-weight:850; }
.view-controls button[data-active="true"] { border-color:var(--awts-explorer-green); background:rgba(6,78,59,.72); color:#dcfce7; }
.sidebar-toggle-btn, .nav-btn, .edit-path-btn { min-width:36px; min-height:34px; display:inline-flex; align-items:center; justify-content:center; }
.menu-buttons button:hover, .view-controls button:hover, .sidebar-toggle-btn:hover, .nav-btn:hover, .edit-path-btn:hover { border-color:var(--awts-explorer-line-hot); background:rgba(14,55,78,.82); }
.path-bar-container { display:flex; align-items:center; min-height:40px; padding:4px; border:1px solid rgba(125,211,252,.24); border-radius:14px; background:rgba(2,6,23,.58); }
.path-breadcrumbs { display:flex; align-items:center; flex:1; gap:4px; min-width:0; overflow-x:auto; scrollbar-width:none; }
.path-breadcrumbs::-webkit-scrollbar { display:none; }
.path-segment { border:0; padding:7px 10px; border-radius:999px; background:rgba(255,255,255,.04); color:var(--awts-explorer-text); font-size:12px; font-weight:850; white-space:nowrap; cursor:pointer; }
.path-segment:hover { background:rgba(56,189,248,.2); }
.path-separator { color:rgba(148,163,184,.6); }
.path-input-container { display:none; flex:1; }
.path-input-container input { width:100%; border:0; outline:0; background:transparent; color:var(--awts-explorer-text); padding:0 10px; }
`;
/** B"H: toolbar controls become dark readable capsules with visible active state. */
