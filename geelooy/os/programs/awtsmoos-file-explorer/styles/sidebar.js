// B"H
export default /*css*/`
.file-explorer-sidebar {
    width: var(--sidebar-width);
    min-width: 180px;
    background: rgba(255, 255, 255, 0.4);
    overflow-y: auto;
    flex-shrink: 0;
    border-right: 1px solid var(--border-glass);
    padding: 10px 0 20px 0;
    transition: width 0.1s;
}
.file-explorer.sidebar-collapsed .file-explorer-sidebar { width: 0 !important; border-right: none; padding: 0; }
.sidebar-resizer {
    width: 6px; cursor: col-resize; background: transparent; z-index: 10; margin-left: -3px; 
}
.sidebar-resizer:hover { background: rgba(0, 122, 255, 0.2); }

.file-explorer-sidebar ul { list-style: none; padding-left: 16px; margin: 0; }
.file-explorer-sidebar > ul { padding-left: 12px; padding-right: 12px; }

.tree-node-content { 
    display: flex; align-items: center; 
    padding: 6px 10px; 
    cursor: pointer; 
    font-size: 13px; 
    color: var(--text-main); 
    border-radius: 8px; 
    margin-bottom: 2px;
    transition: background 0.15s ease, color 0.15s ease;
    border: 1px solid transparent;
}

.tree-node-content:hover { 
    background-color: rgba(0,0,0,0.04); 
}

.tree-node-content.selected { 
    background-color: rgba(0, 122, 255, 0.1); 
    color: var(--primary-color); 
    font-weight: 600;
}

.node-name { 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 8px; 
    flex-grow: 1;
}

.toggle-icon {
    width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
    color: var(--text-tertiary); 
    transition: transform 0.2s ease, color 0.2s; 
    flex-shrink: 0;
    border-radius: 4px;
}
.toggle-icon:hover { color: var(--text-main); background: rgba(0,0,0,0.05); }

.toggle-icon.expanded { transform: rotate(90deg); color: var(--text-main); }
.toggle-icon svg { width: 12px; height: 12px; stroke-width: 2.5px; }

.tree-children { overflow: hidden; position: relative; }
.tree-children::before {
    content: '';
    position: absolute; left: 6px; top: 0; bottom: 0;
    width: 1px; background: rgba(0,0,0,0.05);
}
.tree-children.collapsed { display: none; }
`;