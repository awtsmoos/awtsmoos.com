//B"H
export default /*css*/`
.file-explorer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #ffffff;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color: #1e1e1e;
    overflow: hidden;
}

/* Header & New Layout */
.file-explorer-header {
    display: flex;
    flex-direction: column;
    padding: 6px 10px;
    background: #f3f3f3;
    border-bottom: 1px solid #e1e1e1;
    gap: 8px;
    flex-shrink: 0;
}

.button-bar {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar-toggle-btn, .edit-path-btn {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
}
.sidebar-toggle-btn:hover, .edit-path-btn:hover {
    background: #e9f5ff;
    border-color: #a0c7e4;
}

.menu-buttons, .view-controls {
    display: flex;
    gap: 6px;
}
.view-controls {
    margin-left: auto; /* Pushes view controls to the right */
}

.menu-buttons button, .view-controls button {
    background: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
}

/* Path Bar - New Layout */
.path-bar-container {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 30px;
    border: 1px solid #cccccc;
    border-radius: 3px;
    background: #ffffff;
    padding: 0 4px;
}
.path-breadcrumbs {
    display: flex;
    flex-wrap: wrap; /* Allows wrapping */
    align-items: center;
    flex-grow: 1;
}
.path-segment {
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
}
.path-segment:hover { background-color: #f0f0f0; }
.path-separator { color: #666; margin: 0 4px; }

.path-input-container {
    display: none; /* Hidden by default */
    width: 100%;
}
.path-input-container input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
}
.edit-path-btn {
    margin-left: auto;
    padding: 2px 6px;
}

/* Content Area & Resizer */
.file-explorer-content { display: flex; flex-grow: 1; overflow: hidden; }
.file-explorer-sidebar { width: 240px; min-width: 150px; background: #fcfcfc; overflow-y: auto; flex-shrink: 0; transition: width 0.2s ease, padding 0.2s ease; border-right: 1px solid #e1e1e1; }
.file-explorer.sidebar-collapsed .file-explorer-sidebar { width: 0; min-width: 0; padding: 0; overflow: hidden; border-right: none; }
.sidebar-resizer { width: 8px; background: transparent; cursor: col-resize; flex-shrink: 0; transition: background-color 0.2s ease; margin: 0 -4px; z-index: 10; }
.sidebar-resizer:hover { background: #0078d7; }
.file-explorer.sidebar-collapsed .sidebar-resizer { display: none; }
.file-explorer-body { flex-grow: 1; padding: 8px; overflow-y: auto; }

/* Tree View */
.file-explorer-sidebar ul { list-style: none; padding-left: 16px; margin: 0; }
.tree-node-content { display: flex; align-items: center; padding: 3px; border-radius: 4px; cursor: pointer; }
.tree-node-content:hover { background-color: #f0f0f0; }
.node-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
.toggle { width: 20px; text-align: center; font-size: 12px; color: #606060; flex-shrink: 0; }
.tree-children.collapsed { display: none; }

/* Icon View & File-Specific Icons */
.file-explorer-body.icon-view { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px; }
.file-item.icon { display: flex; flex-direction: column; align-items: center; width: 90px; padding: 8px 4px; border: 1px solid transparent; border-radius: 5px; cursor: pointer; text-align: center; }
.file-item.icon:hover { background-color: #f0f0f0; border-color: #e0e0e0; }
.file-item.icon span { font-size: 12px; line-height: 1.3; word-break: break-word; margin-top: 4px; }
.file-icon, .folder-icon, .js-icon, .css-icon, .html-icon { width: 48px; height: 48px; background-size: contain; background-repeat: no-repeat; background-position: center; }
.folder-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'); }
.file-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235f6368"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/></svg>'); }
.js-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f7df1e"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.5v-9l6 4.5-6 4.5zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/></svg>'); }
.css-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231572b6"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>'); }
.html-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e34f26"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2.5 12.5h-2L15 15l-2.5 2.5-2.5-2.5-1.5-1.5h2l1.5 1.5 1.5-1.5-1.5-1.5h-2L10 12l2.5-2.5 2.5 2.5 1.5 1.5h-2l-1.5-1.5-1.5 1.5 1.5 1.5h2l1.5-1.5 2.5 2.5z"/></svg>'); }
`;