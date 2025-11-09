//B"H
export default /*css*/`
.file-explorer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #ffffff;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    color: #1e1e1e;
    overflow: hidden;
}

/* Header & Controls */
.file-explorer-header {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    background: #f3f3f3;
    border-bottom: 1px solid #e1e1e1;
    gap: 10px;
    flex-shrink: 0;
}

.menu-buttons, .view-controls {
    display: flex;
    gap: 6px;
}

.menu-buttons button, .view-controls button {
    background: #ffffff;
    color: #333;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.menu-buttons button:hover, .view-controls button:hover {
    background: #e9f5ff;
    border-color: #a0c7e4;
}

.menu-buttons button:active, .view-controls button:active {
    background: #d1e9ff;
    border-color: #7ab5e0;
}


/* Path Bar */
.path-bar {
    flex-grow: 1;
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 3px;
    height: 30px;
    padding: 0 4px;
    cursor: text;
    min-width: 0;
}
.path-bar:focus-within {
    border-color: #0078d7;
}
.path-bar-display {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
}
.path-segment {
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    flex-shrink: 0;
}
.path-segment:hover {
    background-color: #f0f0f0;
}
.path-separator {
    color: #666;
    margin: 0 4px;
    font-size: 16px;
}
.path-input {
    display: none;
    width: 100%;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    padding: 0 4px;
    background: transparent;
}

/* Main Content Area */
.file-explorer-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
}

/* Sidebar File Tree */
.file-explorer-sidebar {
    width: 240px;
    padding: 8px;
    background: #fcfcfc;
    border-right: 1px solid #e1e1e1;
    overflow-y: auto;
    flex-shrink: 0;
}
.file-explorer-sidebar ul {
    list-style: none;
    padding-left: 18px;
    margin: 0;
}
.tree-node {
    display: flex;
    align-items: center;
    padding: 4px 0;
    cursor: pointer;
}
.tree-node > span.node-name {
    padding: 3px 6px;
    border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.tree-node > span.node-name:hover {
    background-color: #f0f0f0;
}
.toggle {
    width: 20px;
    text-align: center;
    font-size: 12px;
    color: #606060;
    flex-shrink: 0;
}
.tree-children.collapsed {
    display: none;
}

/* File Display Body */
.file-explorer-body {
    flex-grow: 1;
    padding: 8px;
    overflow-y: auto;
}

/* Icon View */
.file-explorer-body.icon-view {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
}
.file-item.icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90px;
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
}
.file-item.icon:hover {
    background-color: #f0f0f0;
    border-color: #e0e0e0;
}
.file-item.icon span {
    font-size: 12px;
    line-height: 1.3;
    word-break: break-word;
    margin-top: 4px;
}
.file-icon, .folder-icon {
    width: 48px;
    height: 48px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
.folder-icon {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
}
.file-icon {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235f6368"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/></svg>');
}


/* Details View */
.file-explorer-body.details-view {
    display: flex;
    flex-direction: column;
}
.details-header, .details-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    border-bottom: 1px solid #eeeeee;
    padding: 8px 6px;
    align-items: center;
}
.details-header {
    font-weight: 600;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e1e1e1;
    user-select: none;
}
.details-header div {
    cursor: pointer;
}
.details-row {
    border-radius: 4px;
    cursor: pointer;
}
.details-row:hover {
    background-color: #f0f0f0;
}
.details-row div, .details-header div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 4px;
}
`;