// B"H
export default /*css*/`
.drive-shelf { z-index:4; display:flex; gap:8px; align-items:center; min-height:44px; padding:7px 12px; overflow-x:auto; border-bottom:1px solid rgba(125,211,252,.22); background:linear-gradient(90deg, rgba(3,10,22,.92), rgba(10,36,52,.8)); }
.drive-shelf::before { content:"mounts"; flex:0 0 auto; color:var(--awts-explorer-muted); font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
.drive-chip { display:grid; grid-template-columns:auto minmax(70px, 1fr); gap:5px 7px; align-items:center; min-width:155px; max-width:250px; padding:7px 10px; border:1px solid rgba(125,211,252,.22); border-radius:999px; background:rgba(15,23,42,.78); color:var(--awts-explorer-text); cursor:pointer; }
.drive-chip:hover { border-color:var(--awts-explorer-line-hot); background:rgba(14,55,78,.82); }
.drive-chip-icon { grid-row:1 / span 2; display:grid; place-items:center; width:22px; height:22px; }
.drive-chip-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; font-weight:850; }
.drive-chip-meta { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--awts-explorer-muted); font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
.drive-chip.mount-tunnel, .drive-chip[data-locality="remote"] { border-color:rgba(56,189,248,.46); }
.drive-chip.mount-preview { border-color:rgba(192,132,252,.46); }
.drive-chip.mount-local { border-color:rgba(52,211,153,.38); }
.drive-chip[data-permission="read-only"] { color:#dbeafe; }
`;
/** B"H: mounted worlds fit on one line and stop fighting the header. */
