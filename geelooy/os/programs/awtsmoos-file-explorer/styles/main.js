// B"H
export default /*css*/`
.file-explorer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--awts-explorer-text);
  background:
    radial-gradient(circle at 12% 0%, rgba(56,189,248,.28), transparent 34%),
    radial-gradient(circle at 94% 12%, rgba(192,132,252,.22), transparent 30%),
    linear-gradient(145deg, #06101d, #0d1c31 48%, #08111f);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}
.file-explorer::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,.72), transparent 72%);
}
.file-explorer:focus { outline: none; }
.file-explorer:focus-visible { box-shadow: inset 0 0 0 3px rgba(125,211,252,.62); }
.file-explorer * { box-sizing: border-box; }
.file-explorer button { font: inherit; color: inherit; }
.file-explorer *::-webkit-scrollbar { width: 9px; height: 9px; }
.file-explorer *::-webkit-scrollbar-track { background: rgba(15,23,42,.28); }
.file-explorer *::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(125,211,252,.36);
  background-clip: padding-box;
}
.file-explorer-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(15,23,42,.4), rgba(15,23,42,.16));
}
.sidebar-resizer {
  z-index: 4;
  width: 8px;
  margin-left: -4px;
  cursor: col-resize;
  background: linear-gradient(180deg, transparent, rgba(125,211,252,.14), transparent);
}
.sidebar-resizer:hover { background: rgba(125,211,252,.25); }
`;

/** B"H: the root pane becomes a night sky where files remember they are stars. */
