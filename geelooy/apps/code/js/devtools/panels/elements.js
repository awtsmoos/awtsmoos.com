
// B"H
/**
 * @file elements.js
 * @brief Persistent Interactive Elements Inspector with $0 support.
 */

import { DevToolsBridge } from '../bridge.js';
import { DOMTreeBuilder } from './elements/dom-tree.js';
import { HTML } from '../../html-generator.js';
import { MenuUI } from '../../menus/ui.js';

export const ElementsPanel = {
    init(container, state) {
        if (container.querySelector('.dt-elements-content')) {
            this._handlePendingInspect(container, state);
            return;
        }

        container.innerHTML = '';
        const rootContainer = HTML({
            className: 'dt-elements-content',
            style: { flexGrow: '1', overflow: 'auto', background: 'var(--color-bg-deep)', width: '100%' }
        });

        container.appendChild(rootContainer);
        
        const renderDOM = () => {
            if (!state.domString) {
                rootContainer.innerHTML = '<div style="padding:20px; color:gray; font-style:italic;">Awaiting structure...</div>';
                return;
            }

            rootContainer.innerHTML = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(state.domString, 'text/html');
            
            const tree = DOMTreeBuilder.buildNode(doc.documentElement, [], (el, path, e) => {
                if (e.type === 'click') {
                    this.selectNode(rootContainer, state, path);
                } else if (e.type === 'contextmenu') {
                    this.showNodeMenu(state, path, e);
                }
            });

            if (tree) {
                rootContainer.appendChild(tree);
                this._restoreExpansions(rootContainer, state);
            }

            this._handlePendingInspect(rootContainer, state);
        };

        state.onDomUpdate = renderDOM;
        state.onInspectRequested = () => this._handlePendingInspect(rootContainer, state);
        
        renderDOM();
        DevToolsBridge.requestDOM(state.previewTabId);
    },

    _handlePendingInspect(container, state) {
        if (state.inspectPath) {
            const path = [...state.inspectPath];
            state.inspectPath = null;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.expandToPath(container, path, state);
                    this.selectNode(container, state, path);
                });
            });
        } else if (state.selectedPath) {
            // Re-sync $0 and visual selection on re-init
            this.selectNode(container, state, state.selectedPath);
        }
    },

    _restoreExpansions(container, state) {
        state.expandedPaths.forEach(pathStr => {
            const node = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
            if (node) node.open = true;
        });
    },

    selectNode(container, state, path) {
        if (!path) return;
        const pathStr = path.join(',');
        
        // 1. Visual Selection
        container.querySelectorAll('.dt-el-node').forEach(n => n.classList.remove('selected'));
        const target = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
        if (target) {
            target.classList.add('selected');
        }
        
        // 2. State & $0 Sync
        state.selectedPath = path;
        DevToolsBridge.setSelectedPath(state.previewTabId, path);
        
        // 3. Persist session
        import('../../app.js').then(m => m.App.saveSessionDebounced());
    },

    expandToPath(container, path, state) {
        if (!path) return;
        let current = [];
        path.forEach(idx => {
            current.push(idx);
            const pathStr = current.join(',');
            const node = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
            if (node) {
                node.open = true;
                state.expandedPaths.add(pathStr);
            }
        });

        const finalNode = container.querySelector(`.dt-el-node[data-path="${path.join(',')}"]`);
        if (finalNode) {
            finalNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            finalNode.classList.add('inspect-highlight');
            setTimeout(() => finalNode.classList.remove('inspect-highlight'), 3000);
        }
    },

    showNodeMenu(state, path, e) {
        e.preventDefault();
        const menuItems = [
            { label: "Copy OuterHTML", action: "el-copy-outer", icon: "copy" },
            { label: "Edit as HTML", action: "el-edit-html", icon: "code" }
        ];
        window._DT_ACTIVE_NODE = { state, path };
        import('../../menus/ui.js').then(m => m.MenuUI.renderMenu(document.getElementById('context-menu'), menuItems, e));
    }
};
