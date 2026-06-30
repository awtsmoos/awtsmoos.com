// B"H
export default /*css*/`
.drive-shelf{z-index:4;display:flex;gap:4px;align-items:center;min-height:30px;padding:3px 5px;overflow-x:auto}.drive-shelf::before{content:"Mounts";flex:0 0 auto;color:#333;font-size:11px;font-weight:bold}.drive-chip{display:grid;grid-template-columns:auto minmax(70px,1fr);gap:1px 5px;align-items:center;min-width:138px;max-width:230px;padding:2px 6px;border:2px outset var(--awts-xp-cream);background:var(--awts-xp-panel);color:#111;cursor:default}.drive-chip:active{border-style:inset}.drive-chip-icon{grid-row:1/span 2;display:grid;place-items:center;width:18px;height:18px}.drive-chip-label,.drive-chip-meta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.drive-chip-label{font-weight:normal}.drive-chip-meta{color:#555;font-size:9px}.drive-chip[data-permission="read-only"]{color:#1e3a8a}
`;
/** B"H: mounted worlds become compact drive chips in a real Explorer shelf. */
