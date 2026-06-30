// B"H
export default /*css*/`
.file-explorer-sidebar{width:var(--sidebar-width);min-width:190px;flex-shrink:0;overflow:auto;padding:8px 6px 16px}.file-explorer.sidebar-collapsed .file-explorer-sidebar{width:0!important;min-width:0;padding:0;border-right:0;overflow:hidden}.file-explorer-sidebar ul{list-style:none;margin:0;padding:0}.tree-node-content{width:100%;display:flex;align-items:center;gap:5px;margin:0;text-align:left}.node-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.toggle-icon{display:inline-grid;place-items:center;width:16px;height:16px}.toggle-icon svg{width:10px;height:10px}.tree-node.mount-local .node-name::after{content:" local";font-size:9px;color:#166534}.tree-node.mount-preview .node-name::after{content:" preview";font-size:9px;color:#6d28d9}.tree-node.mount-denied .node-name::after{content:" denied";font-size:9px;color:#b91c1c}
`;
/** B"H: sidebar keeps hierarchy while the XP pane module paints the blue left rail. */
