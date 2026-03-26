
// B"H
/**
 * @file ManifestTree.js
 * @brief Constructs a visually consolidated, interactive hierarchy from flat paths.
 */

export const ManifestTree = {
    /**
     * @function buildHTML
     * @description Builds the nested HTML string from a list of changes.
     */
    buildHTML(changes) {
        const root = { name: '/', path: '', children: new Map(), files: [] };
        
        // 1. Build the logical tree
        changes.forEach((c, idx) => {
            c.originalIndex = idx;
            const parts = c.path.split('/').filter(Boolean);
            const fileName = parts.pop();
            
            let current = root;
            let currentPath = '';
            
            for (const part of parts) {
                currentPath += '/' + part;
                if (!current.children.has(part)) {
                    current.children.set(part, { name: part, path: currentPath, children: new Map(), files: [] });
                }
                current = current.children.get(part);
            }
            current.files.push(c);
        });

        // 2. Consolidate empty parent directories
        this._consolidate(root);

        // 3. Render to HTML
        return this._renderNode(root, 0);
    },

    _consolidate(node) {
        for (const child of node.children.values()) {
            this._consolidate(child);
        }
        
        if (node.path !== '' && node.children.size === 1 && node.files.length === 0) {
            const onlyChildKey = Array.from(node.children.keys())[0];
            const onlyChild = node.children.get(onlyChildKey);
            
            node.name = node.name + '/' + onlyChild.name;
            node.children = onlyChild.children;
            node.files = onlyChild.files;
            node.path = onlyChild.path; 
        }
    },

    _renderNode(node, depth) {
        let html = '';
        
        if (node.path !== '') {
            html += `
            <div style="margin-left: ${depth === 1 ? 0 : 15}px; border-left: ${depth === 1 ? 'none' : '1px solid rgba(255,255,255,0.1)'}; padding-left: ${depth === 1 ? 0 : 10}px; margin-top: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,246,255,0.05); padding: 6px 10px; border-radius: 4px; margin-bottom: 5px;">
                    <div style="display:flex; align-items:center; gap: 8px;">
                        <button class="em-collapse-btn icon-button" style="width:20px; height:20px; padding:0; font-size:12px; display:flex; align-items:center; justify-content:center; color: var(--neon-cyan);">▼</button>
                        <input type="checkbox" class="em-folder-toggle" checked style="width:14px; height:14px; accent-color: var(--neon-cyan); cursor:pointer;">
                        <span style="font-family: var(--font-code); font-size: 0.9em; font-weight: bold; color: var(--neon-cyan);">
                            <svg class="svg-icon" style="width:14px; height:14px; margin-right:5px; vertical-align:middle;"><use href="#icon-folder"></use></svg>
                            ${node.name}
                        </span>
                    </div>
                </div>
                <div class="em-tree-children">
            `;
        } else {
            html += `<div class="em-tree-children" style="display:flex; flex-direction:column; gap:8px;">`;
        }

        const sortedChildren = Array.from(node.children.keys()).sort();
        for (const childKey of sortedChildren) {
            html += this._renderNode(node.children.get(childKey), depth + 1);
        }

        if (node.files.length > 0) {
            html += `<div style="display:flex; flex-direction:column; gap:6px; margin-left: ${depth === 0 ? 0 : 15}px; margin-top: 5px;">`;
            node.files.forEach(f => {
                html += this._getCardHTML(f);
            });
            html += `</div>`;
        }

        html += `</div>`; 
        if (node.path !== '') html += `</div>`; 

        return html;
    },

    _getCardHTML(c) {
        const isDel = c.operation === 'delete';
        const color = isDel ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
        const isEnabled = c.isEnabled !== false;
        
        // B"H - The Tikkun: Force extraction of the pure filename, ignoring AI fileLabels that contain paths.
        const pureFileName = c.path.split('/').pop();
        
        return `
        <div class="vibe-manifest-card interactive-card" data-index="${c.originalIndex}" data-path="${c.path}" style="cursor: pointer; border-left: 3px solid ${isEnabled ? color : '#444'}; opacity: ${isEnabled ? '1' : '0.5'}; padding: 10px; margin-bottom: 0; background: rgba(0,0,0,0.3); transition: all 0.2s ease;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; pointer-events: none;">
                <div style="display:flex; align-items:center; gap:8px; width:100%; overflow:hidden;">
                    <input type="checkbox" ${isEnabled ? 'checked' : ''} style="width:14px; height:14px; accent-color: var(--neon-cyan); pointer-events: auto;">
                    <span style="font-family:var(--font-code); font-size:0.9em; font-weight:bold; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.path}">
                        ${pureFileName}
                    </span>
                </div>
                <span style="font-size:9px; font-weight:bold; text-transform:uppercase; color:${color}; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:10px; flex-shrink:0;">
                    ${c.operation}
                </span>
            </div>
            ${c.description ? `<div style="font-size:0.8em; color:#bbb; padding-left:22px; line-height:1.4; white-space:pre-wrap; pointer-events: none;">${c.description}</div>` : ''}
        </div>`;
    }
};
