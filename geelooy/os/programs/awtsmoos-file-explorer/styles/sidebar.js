// B"H
export default /*css*/`
.file-explorer-sidebar {
  width: var(--sidebar-width);
  min-width: 190px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 14px 10px 24px;
  border-right: 1px solid rgba(125,211,252,.18);
  background: linear-gradient(180deg, rgba(15,23,42,.62), rgba(2,6,23,.32));
  transition: width .16s ease, min-width .16s ease, padding .16s ease;
}
.file-explorer.sidebar-collapsed .file-explorer-sidebar {
  width: 0 !important;
  min-width: 0;
  padding: 0;
  border-right: 0;
  overflow: hidden;
}
.file-explorer-sidebar ul { list-style: none; margin: 0; padding-left: 16px; }
.file-explorer-sidebar > ul { padding-left: 0; }
.tree-node-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  margin: 0 0 5px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 14px;
  color: var(--awts-explorer-muted);
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
}
.tree-node-content::before {
  content: "";
  width: 3px;
  align-self: stretch;
  border-radius: 999px;
  background: rgba(125,211,252,.24);
}
.tree-node-content:hover {
  transform: translateX(2px);
  color: var(--awts-explorer-text);
  border-color: rgba(125,211,252,.22);
  background: rgba(125,211,252,.09);
}
.tree-node-content.selected {
  color: var(--awts-explorer-text);
  border-color: rgba(52,211,153,.54);
  background: linear-gradient(90deg, rgba(52,211,153,.2), rgba(125,211,252,.08));
  box-shadow: 0 0 0 3px rgba(52,211,153,.08);
}
.node-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 800; }
.toggle-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 8px; color: var(--awts-explorer-faint); }
.toggle-icon svg { width: 12px; height: 12px; }
.toggle-icon.expanded { transform: rotate(90deg); color: var(--awts-explorer-blue); }
.tree-children { position: relative; overflow: hidden; }
.tree-children::before { content: ""; position: absolute; left: 10px; top: 0; bottom: 0; width: 1px; background: rgba(125,211,252,.16); }
.tree-children.collapsed { display: none; }
`;

/** B"H: the sidebar becomes rails through mounted worlds. */
