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

/* Header & Button Bar */
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
    width: 100%;
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

.menu-buttons button, .view-controls button {
    background: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
}

/* Path Bar & Interactivity */
.path-bar-container {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 30px;
    border: 1px solid #cccccc;
    border-radius: 3px;
    background: #ffffff;
    padding: 0 4px;
    cursor: text;
}
.path-bar-container:focus-within {
    border-color: #0078d7;
}

.path-breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-grow: 1;
}
.path-segment {
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.15s ease;
}
.path-segment:hover {
    background-color: #e9f5ff;
}
.path-segment:active {
    background-color: #d1e9ff;
}
.path-separator { color: #666; margin: 0 4px; align-self: center; }

.path-input-container { display: none; width: 100%; }
.path-input-container input { width: 100%; border: none; outline: none; font-size: 14px; background: transparent; }
.edit-path-btn { margin-left: auto; align-self: center; }

/* Content Area & Mobile-Friendly Resizer */
.file-explorer-content { display: flex; flex-grow: 1; overflow: hidden; }
.file-explorer-sidebar { width: 240px; min-width: 100px; background: #fcfcfc; overflow-y: auto; flex-shrink: 0; transition: width 0.2s ease, padding 0.2s ease, min-width 0.2s ease; border-right: 1px solid #e1e1e1; }
.file-explorer.sidebar-collapsed .file-explorer-sidebar { width: 0; min-width: 0; padding: 0; overflow: hidden; border-right: none; }

.sidebar-resizer {
    width: 12px; /* Wider touch area */
    margin: 0 -6px; /* Center it over the border */
    background: transparent; /* Invisible */
    cursor: col-resize;
    flex-shrink: 0;
    z-index: 10;
}
.sidebar-resizer:hover {
    background: rgba(0, 120, 215, 0.5); /* Show on hover for desktop */
}
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
.js-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f7df1e"><rect fill="black" x="0" y="0" width="24" height="24"/><path fill="%23f7df1e" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,17H8V11.5C8,10.1 8.9,9.5 10,9.5V7.5C8,7.5 6,8.5 6,11.5V17H4V7H6V8.5C6.9,7.6 8.3,7 10,7C12,7 14,8 14,11V17H12V11C12,9.9 11.2,9 10,9V11.5C10,12.8 9.1,13.5 8,13.5V15H10V17M18,17H16V7H18V17Z"/></svg>'); }
.css-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231572b6"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438zM8.5 6.5l.25 2.5h6.5l-.25 2.5h-6.5l.25 2.5h6.5l-.25 2.5-2.5 1-2.5-1-.125-1.5h-2.25l.25 3 4.5 1.5 4.5-1.5.5-5.5.5-5.5.5-5.5h-13z"/></svg>'); }
.html-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e34f26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.234-2.719 8.375.002.234-2.717H4.937l.938 10.594h9.875l.938-10.875H8.531z"/></svg>'); }
`;