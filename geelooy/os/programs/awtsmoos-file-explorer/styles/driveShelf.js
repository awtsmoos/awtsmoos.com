// B"H
export default `
.drive-shelf{display:flex;gap:8px;align-items:center;padding:10px;overflow:auto;background:linear-gradient(90deg,rgba(18,24,36,.92),rgba(30,38,58,.78));border-bottom:1px solid rgba(255,255,255,.1)}
.drive-chip{white-space:nowrap;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.08);color:inherit;padding:7px 12px;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease}
.drive-chip:hover{transform:translateY(-1px);background:rgba(255,255,255,.14)}
.drive-chip.remote{border-color:rgba(90,200,255,.55);box-shadow:0 0 0 1px rgba(90,200,255,.12) inset}
.drive-node .node-name{font-weight:700}.remote-folder-state,.empty-folder-state{padding:24px;opacity:.78;text-align:center}.file-item[data-path^="awtsmoos://"]{outline:1px solid rgba(90,200,255,.22)}
`;
