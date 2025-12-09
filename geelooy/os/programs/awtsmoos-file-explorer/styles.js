//B"H
export default /*css*/`
:root {
    --border-color: #dee2e6;
    --background-light: #f8f9fa;
    --background-white: #ffffff;
    --text-color: #212529;
    --text-color-muted: #6c757d;
    --accent-blue: #007bff;
    --accent-blue-light: #e7f3ff;
    --accent-blue-border: #b3d7ff;
    --hover-bg: #e9ecef;
}

.file-explorer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--background-white);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: var(--text-color);
    overflow: hidden;
}

/* Header & Button Bar */
.file-explorer-header {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    background: var(--background-light);
    border-bottom: 1px solid var(--border-color);
    gap: 8px;
    flex-shrink: 0;
}

.button-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.sidebar-toggle-btn {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-muted);
}
.sidebar-toggle-btn:hover { background-color: var(--hover-bg); color: var(--text-color); }

.menu-buttons button, .view-controls button {
    background: var(--background-white);
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 5px 12px;
    cursor: pointer;
    font-size: 13px;
    color: #495057;
    transition: all 0.15s ease;
}

.menu-buttons button:hover,
.view-controls button:hover {
    background-color: var(--background-light);
    border-color: #adb5bd;
    color: var(--text-color);
}

/* Path Bar */
.path-bar-container {
    display: flex;
    align-items: stretch;
    width: 100%;
    height: 30px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    background: var(--background-white);
    padding: 0 4px;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.path-bar-container:focus-within {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}
.path-breadcrumbs {
    display: flex;
    align-items: center;
    flex-grow: 1;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
}
.path-breadcrumbs::-webkit-scrollbar { display: none; }

.path-segment {
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 13px;
    color: #495057;
    white-space: nowrap;
}
.path-segment:hover { background-color: var(--hover-bg); color: var(--text-color); }

.path-separator { 
    color: #adb5bd; 
    margin: 0 2px; 
    font-size: 14px; 
    display: flex; 
    align-items: center;
}

.path-input-container { display: none; width: 100%; }
.path-input-container input { width: 100%; border: none; outline: none; font-size: 13px; background: transparent; padding: 0 4px; }
.edit-path-btn {
    background: none; border: none; cursor: pointer; color: #adb5bd; font-size: 14px; padding: 0 6px; display: flex; align-items: center;
}
.edit-path-btn:hover { color: var(--text-color); }
.nav-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 0 8px;
    color: #6c757d;
    border-right: 1px solid #dee2e6;
    margin-right: 4px;
    display: flex;
    align-items: center;
}
.nav-btn:hover { color: var(--accent-blue); background-color: rgba(0,0,0,0.03); }

/* Content Area */
.file-explorer-content { display: flex; flex-grow: 1; overflow: hidden; position: relative; }

/* Sidebar */
.file-explorer-sidebar {
    width: 220px;
    min-width: 150px;
    background: var(--background-light);
    overflow-y: auto;
    flex-shrink: 0;
    border-right: 1px solid var(--border-color);
    padding-bottom: 20px;
}
.file-explorer.sidebar-collapsed .file-explorer-sidebar {
    width: 0 !important; border-right: none;
}
.sidebar-resizer {
    width: 4px;
    cursor: col-resize;
    background: transparent;
    z-index: 10;
    margin-left: -2px;
    transition: background-color 0.2s;
}
.sidebar-resizer:hover, .sidebar-resizer:active { background: var(--accent-blue); }

/* Tree View */
.file-explorer-sidebar ul { list-style: none; padding-left: 10px; margin: 0; }
/* Root level padding */
.file-explorer-sidebar > ul { padding-left: 0; padding-top: 5px; }

.tree-node-content { 
    display: flex; 
    align-items: center; 
    padding: 4px 8px; 
    cursor: pointer; 
    font-size: 13px;
    color: #495057;
    border-radius: 0 4px 4px 0;
    margin-right: 8px;
}
.tree-node-content:hover { background-color: #e9ecef; color: #212529; }
.tree-node-content.selected { 
    background-color: #d0ebff; 
    color: #1971c2; 
    font-weight: 500;
}

.node-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 6px; }

/* Arrow Toggles */
.toggle-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #868e96;
    transition: transform 0.2s ease;
    flex-shrink: 0;
}
.toggle-icon.expanded {
    transform: rotate(90deg);
    color: #495057;
}
.toggle-icon svg {
    width: 10px;
    height: 10px;
    fill: currentColor;
}
.tree-children { overflow: hidden; }
.tree-children.collapsed { display: none; }

/* Main Body */
.file-explorer-body { 
    flex-grow: 1; 
    padding: 10px; 
    overflow-y: auto; 
    background: white;
    position: relative;
}
/* Drag Over State */
.file-explorer-body.drag-over, .tree-node-content.drag-over, .file-item.drag-over, .details-row.drag-over {
    background-color: rgba(0, 123, 255, 0.1) !important;
    outline: 2px dashed var(--accent-blue);
    outline-offset: -2px;
}

/* Icons View */
.icons-view { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); 
    gap: 8px; 
    padding-bottom: 20px;
}

.file-item.icon { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    padding: 10px 6px;
    border: 1px solid transparent; 
    border-radius: 6px; 
    cursor: pointer;
    transition: background-color 0.1s;
    height: 100px;
}
.file-item.icon:hover { background-color: var(--accent-blue-light); }
.file-item.icon.selected { 
    background-color: #cce8ff; 
    border-color: #99d1ff; 
}
.file-item.icon.cut-ghost { opacity: 0.5; filter: grayscale(1); }

.file-item.icon span { 
    font-size: 12px; 
    margin-top: 8px; 
    text-align: center; 
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
    color: #495057;
}

/* SVG Icon Placeholders */
.file-icon, .folder-icon, .js-icon, .css-icon, .html-icon { 
    width: 42px; 
    height: 42px; 
    background-size: contain; 
    background-repeat: no-repeat; 
    background-position: center; 
}
.folder-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffd43b"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>'); }
.file-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23adb5bd"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/></svg>'); }
.js-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23f7df1e" d="M0 0h24v24H0z"/><path d="M11.5 16.5h-2v-6h2c.8 0 1.5.5 1.5 1.2s-.7 1.3-1.5 1.3h-1v3.5zm5-4.5h-2v4.5h2c.8 0 1.5-.5 1.5-1.2s-.7-1.3-1.5-1.3h-1v-2h1c.8 0 1.5-.5 1.5-1.2S17.3 9.5 16.5 9.5h-2v2.5z"/></svg>'); } 
.css-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231572b6"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438zM8.5 6.5l.25 2.5h6.5l-.25 2.5h-6.5l.25 2.5h6.5l-.25 2.5-2.5 1-2.5-1-.125-1.5h-2.25l.25 3 4.5 1.5 4.5-1.5.5-5.5.5-5.5.5-5.5h-13z"/></svg>'); }
.html-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e34f26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.234-2.719 8.375.002.234-2.717H4.937l.938 10.594h9.875l.938-10.875H8.531z"/></svg>'); }


/* Details View */
.details-view { display: flex; flex-direction: column; width: 100%; min-width: 400px; }
.details-header {
    display: grid;
    grid-template-columns: var(--grid-cols);
    background-color: var(--background-light);
    border-bottom: 1px solid var(--border-color);
    position: sticky; top: 0; z-index: 5;
    font-size: 12px;
    font-weight: 600;
    color: #6c757d;
}
.header-cell {
    padding: 8px;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
}
.header-cell:hover { background-color: #e2e6ea; color: #212529; }
.col-resizer {
    position: absolute; right: 0; top: 0; bottom: 0; width: 4px;
    cursor: col-resize; z-index: 2;
}
.col-resizer:hover { background-color: rgba(0,0,0,0.1); }

.details-row {
    display: grid;
    grid-template-columns: var(--grid-cols);
    border-bottom: 1px solid #f1f3f5;
    cursor: default;
    font-size: 13px;
    color: #212529;
}
.details-row:hover { background-color: var(--accent-blue-light); }
.details-row.selected { background-color: #cce8ff; }
.row-cell { 
    padding: 6px 8px; 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
    display: flex; align-items: center;
}
.row-cell.name-cell { gap: 8px; }
.small-icon { width: 16px; height: 16px; background-size: contain; flex-shrink: 0; }

/* Empty State */
.empty-folder-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #adb5bd;
    font-style: italic;
    grid-column: 1 / -1;
    padding-top: 50px;
}
.empty-folder-state::before {
    content: '';
    display: block;
    width: 48px; height: 48px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dee2e6"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
    background-size: contain;
    margin-bottom: 10px;
}

/* Dialog */
.input-dialog-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
}
.input-dialog {
    background: white; padding: 20px; border-radius: 8px;
    width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    font-size: 14px;
}
.dialog-title { font-weight: 600; margin-bottom: 15px; font-size: 16px; }
.input-dialog input { width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; margin-bottom: 20px; box-sizing: border-box; }
.dialog-buttons { display: flex; justify-content: flex-end; gap: 10px; }
.dialog-buttons button { padding: 6px 12px; border-radius: 4px; border: 1px solid #ced4da; background: white; cursor: pointer; }
.dialog-buttons button:first-child { background: var(--accent-blue); color: white; border-color: var(--accent-blue); }

/* Selection Action Bar */
.selection-action-bar {
    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #343a40; color: white; padding: 8px 16px; border-radius: 50px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;
    font-size: 13px;
    animation: slideUp 0.2s ease-out;
}
.selection-action-bar button {
    background: rgba(255,255,255,0.1); border: none; color: white;
    padding: 4px 12px; border-radius: 12px; cursor: pointer;
    font-size: 12px; transition: background 0.2s;
}
.selection-action-bar button:hover { background: rgba(255,255,255,0.2); }
.selection-action-bar button.cancel-btn { background: #e03131; }
.selection-action-bar button.cancel-btn:hover { background: #c92a2a; }

@keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
`;