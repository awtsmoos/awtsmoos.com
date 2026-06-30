// B"H
export default /*css*/`
.file-explorer-header {
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px 13px;
  border-bottom: 1px solid rgba(125,211,252,.22);
  background: linear-gradient(180deg, rgba(8,16,29,.86), rgba(8,16,29,.62));
  box-shadow: 0 14px 34px rgba(0,0,0,.22);
  backdrop-filter: blur(18px) saturate(1.2);
}
.button-bar { display: flex; align-items: center; gap: 12px; width: 100%; }
.menu-buttons, .view-controls { display: flex; gap: 8px; align-items: center; }
.menu-buttons button, .view-controls button, .sidebar-toggle-btn, .nav-btn, .edit-path-btn {
  border: 1px solid rgba(125,211,252,.22);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,.11), rgba(255,255,255,.04));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 8px 18px rgba(0,0,0,.14);
  color: var(--awts-explorer-text);
  cursor: pointer;
  transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
}
.menu-buttons button, .view-controls button { padding: 8px 14px; font-size: 12px; font-weight: 800; letter-spacing: .02em; }
.sidebar-toggle-btn, .nav-btn, .edit-path-btn { min-width: 38px; min-height: 34px; display: inline-flex; align-items: center; justify-content: center; }
.menu-buttons button:hover, .view-controls button:hover, .sidebar-toggle-btn:hover, .nav-btn:hover, .edit-path-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(125,211,252,.72);
  background: linear-gradient(180deg, rgba(56,189,248,.22), rgba(255,255,255,.07));
  box-shadow: var(--awts-explorer-glow);
}
.path-bar-container {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 4px;
  border: 1px solid rgba(125,211,252,.24);
  border-radius: 16px;
  background: rgba(2,6,23,.42);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.path-bar-container:focus-within { border-color: rgba(52,211,153,.78); box-shadow: 0 0 0 3px rgba(52,211,153,.14); }
.path-breadcrumbs { display: flex; align-items: center; flex: 1; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.path-breadcrumbs::-webkit-scrollbar { display: none; }
.path-segment {
  padding: 7px 10px;
  border-radius: 999px;
  color: var(--awts-explorer-muted);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}
.path-segment:hover { color: var(--awts-explorer-text); background: rgba(125,211,252,.12); }
.path-separator { color: rgba(148,163,184,.5); }
.path-input-container { display: none; flex: 1; }
.path-input-container input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--awts-explorer-text); padding: 0 10px; }
`;

/** B"H: the navbar is now a gate of capsules, not a strip of plastic. */
