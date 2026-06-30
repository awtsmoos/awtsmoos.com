// B"H
export default /*css*/`
.file-explorer-body {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 20px;
  overflow: auto;
  scroll-behavior: smooth;
}
.file-explorer-body::before {
  content: "";
  position: sticky;
  top: 0;
  display: block;
  height: 1px;
  margin-bottom: -1px;
  background: linear-gradient(90deg, transparent, rgba(125,211,252,.28), transparent);
  z-index: 2;
}
.file-explorer-body.drag-over::after {
  content: "Drop to reveal in this vessel";
  position: absolute;
  inset: 16px;
  display: grid;
  place-items: center;
  border: 2px dashed rgba(52,211,153,.72);
  border-radius: 24px;
  background: rgba(6,78,59,.16);
  color: #bbf7d0;
  font-weight: 900;
  letter-spacing: .04em;
  pointer-events: none;
  z-index: 9;
}
.icons-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 16px;
  align-content: start;
  padding-bottom: 72px;
}
.file-item.icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 148px;
  padding: 16px 12px 12px;
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.045));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 18px 36px rgba(0,0,0,.16);
  cursor: pointer;
  isolation: isolate;
  transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
}
.file-item.icon::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(circle at 50% 0%, rgba(125,211,252,.16), transparent 58%); opacity: .72; z-index: -1; }
.file-item.icon:hover { transform: translateY(-5px); border-color: rgba(125,211,252,.6); background: var(--awts-explorer-card-hot); box-shadow: var(--awts-explorer-glow); }
.file-item.icon.selected { border-color: rgba(52,211,153,.72); background: rgba(6,78,59,.22); box-shadow: 0 0 0 3px rgba(52,211,153,.15), var(--awts-explorer-shadow); }
.file-item.icon.drag-over { border-color: rgba(52,211,153,.9); outline: 2px dashed rgba(52,211,153,.66); outline-offset: 3px; }
.file-item.icon .icon-img { display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 10px; filter: drop-shadow(0 14px 18px rgba(0,0,0,.24)); transition: transform .2s ease; }
.file-item.icon:hover .icon-img { transform: scale(1.08) rotate(1deg); }
.icon-img svg, .small-icon svg { display: block; width: 100% !important; height: 100% !important; overflow: visible; }
.file-name { width: 100%; color: var(--awts-explorer-text); font-size: 13px; font-weight: 850; line-height: 1.25; text-align: center; overflow-wrap: anywhere; }
.item-meta { margin-top: 6px; color: var(--awts-explorer-faint); font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.empty-folder-state, .remote-folder-state { grid-column: 1 / -1; display: grid; place-items: center; min-height: 46vh; padding: 28px; color: var(--awts-explorer-muted); text-align: center; }
.semantic-empty-state { border: 1px dashed rgba(125,211,252,.28); border-radius: 24px; background: rgba(2,6,23,.18); }
.empty-folder-state::before { content: "◇"; display: block; margin-bottom: 12px; color: var(--awts-explorer-blue); font-size: 54px; text-shadow: 0 0 32px rgba(56,189,248,.6); }
`;

/** B"H: file cards rise like graph-letters carved into glass. */
