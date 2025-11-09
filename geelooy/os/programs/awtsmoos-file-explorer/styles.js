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
}

.file-explorer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--background-white);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
    padding: 5px 8px;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    border-radius: 5px;
}

.menu-buttons button, .view-controls button {
    background: var(--background-white);
    border: 1px solid #ced4da;
    border-radius: 5px;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.sidebar-toggle-btn:hover,
.menu-buttons button:hover,
.view-controls button:hover {
    background-color: var(--accent-blue-light);
    border-color: var(--accent-blue-border);
}

/* Path Bar */
.path-bar-container {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 34px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    background: var(--background-white);
    padding: 0 5px;
}
.path-bar-container:focus-within {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 1px var(--accent-blue);
}
.path-breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-grow: 1;
    cursor: text;
}
.path-segment {
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.15s ease;
}
.path-segment:hover { background-color: #e9ecef; }
.path-segment:active { background-color: #dee2e6; }
.path-separator { color: var(--text-color-muted); margin: 0 5px; font-size: 16px; }

.path-input-container { display: none; width: 100%; }
.path-input-container input { width: 100%; border: none; outline: none; font-size: 14px; background: transparent; }
.edit-path-btn { background: none; border: none; cursor: pointer; color: #6c757d; font-size: 16px; padding: 0 8px; }
.edit-path-btn:hover { color: var(--accent-blue); }

/* Content Area, Sidebar, and Resizer */
.file-explorer-content { display: flex; flex-grow: 1; overflow: hidden; }
.file-explorer-sidebar {
    width: 250px;
    min-width: 150px;
    background: var(--background-light);
    overflow-y: auto;
    flex-shrink: 0;
    transition: all 0.2s ease;
    border-right: 1px solid var(--border-color);
}
.file-explorer.sidebar-collapsed .file-explorer-sidebar {
    width: 0px ! important;
    min-width: 0;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden !important;
    border-right-width: 0;
}
.sidebar-resizer {
    width: 10px;
    margin: 0 -5px;
    background: transparent;
    cursor: col-resize;
    flex-shrink: 0;
    z-index: 10;
    transition: background-color 0.2s ease;
}
.sidebar-resizer:hover, .sidebar-resizer:active { background: var(--accent-blue-border); }
.file-explorer.sidebar-collapsed .sidebar-resizer { display: none; }

/* Tree View */
.file-explorer-sidebar ul { list-style: none; padding-left: 12px; margin: 0; padding-top: 8px; }
.tree-node-content { display: flex; align-items: center; padding: 5px; border-radius: 5px; cursor: pointer; }
.tree-node-content:hover { background-color: #dee2e6; }
.node-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; padding-left: 4px; }
.toggle {
    width: 24px; /* Bigger target */
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px; /* Bigger arrow */
    color: var(--text-color-muted);
    flex-shrink: 0;
    transition: transform 0.15s ease;
}
.tree-children.collapsed { display: none; }

/* Main File Body */
.file-explorer-body { flex-grow: 1; padding: 12px; overflow-y: auto; }

/* Icon View */
.icon-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px; align-content: flex-start; }
.file-item.icon { display: flex; flex-direction: column; align-items: center; padding: 8px; border: 1px solid transparent; border-radius: 6px; cursor: pointer; text-align: center; }
.file-item.icon:hover { background-color: var(--accent-blue-light); border-color: var(--accent-blue-border); }
.file-item.icon span { font-size: 13px; line-height: 1.4; word-break: break-word; margin-top: 6px; }
.file-icon, .folder-icon, .js-icon, .css-icon, .html-icon { width: 56px; height: 56px; background-size: contain; background-repeat: no-repeat; background-position: center; }

/* Details View */
.details-view { display: flex; flex-direction: column; }
.details-header, .details-row { display: grid; grid-template-columns: 2fr 1fr 1fr; border-bottom: 1px solid #eeeeee; padding: 10px 8px; align-items: center; }
.details-header { font-weight: 600; background-color: var(--background-light); user-select: none; }
.details-header div { cursor: pointer; }
.details-row { border-radius: 5px; cursor: pointer; }
.details-row:hover { background-color: var(--accent-blue-light); }
.details-row div, .details-header div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }

/* SVG Icons */
.folder-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'); }
.file-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236c757d"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/></svg>'); }
.js-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23f7df1e"/><path d="M60.3 90.3h-9.4v-31h10.3c3.4 0 5.8 1.4 5.8 4.4 0 2-1.3 3.3-3.3 3.9l4.5 7.4-4.2 2.5-3.8-6.3h-2.9v8.1zm.9-22.9v-2.8c0-1.2-.7-1.7-2.4-1.7h-5v4.5h5c1.8 0 2.4-.6 2.4-1.7zm19.9 23.9c-5.1 0-8.5-3.1-8.5-7.4 0-4.4 3.4-7.5 8.5-7.5 3.3 0 5.6 1.4 6.9 3.3l-3.3 1.9c-.8-1.2-1.9-1.8-3.6-1.8-2.5 0-4.1 1.7-4.1 4.1s1.6 4.1 4.1 4.1c2.4 0 3.5-1 4-2.2l3.2 1.7c-1.4 2.8-4.3 4.6-7.8 4.6z"/></svg>'); }
.css-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231572b6"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438zM8.5 6.5l.25 2.5h6.5l-.25 2.5h-6.5l.25 2.5h6.5l-.25 2.5-2.5 1-2.5-1-.125-1.5h-2.25l.25 3 4.5 1.5 4.5-1.5.5-5.5.5-5.5.5-5.5h-13z"/></svg>'); }
.html-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e34f26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.234-2.719 8.375.002.234-2.717H4.937l.938 10.594h9.875l.938-10.875H8.531z"/></svg>'); }
`;