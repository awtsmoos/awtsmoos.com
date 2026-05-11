
// B"H
/**
 * @file elements.js
 * @brief The Eye of the Inspector.
 * 
 * POEM OF THE REVEALED STRUCTURE:
 * The house is built with many a beam,
 * Revealed now within the stream.
 * From tag to text, we see the light,
 * To make the hidden clear and bright.
 * We request the form from the sandbox deep,
 * For the promises of vision we must keep.
 */

import { DevToolsBridge } from '../bridge.js';
import { DOMTreeBuilder } from './elements/dom-tree.js';
import { HTML } from '../../html-generator.js';

export const ElementsPanel = {
    /**
     * B"H - Awakens the elements vision.
     * @param {HTMLElement} container - The panel vessel.
     * @param {Object} state - The persistent state soul.
     */
    init(container, state) {
        // If the physical content already exists, just handle pending requests
        if (container.querySelector('.dt-elements-content')) {
            this._handlePendingInspect(container, state);
            
            // If the state is empty, we must knock on the door of the sandbox again.
            if (!state.domString && state.previewTabId) {
                console.log(`[Elements] B"H - Memory is void for Vision [${state.previewTabId}]. Requesting emanation.`);
                DevToolsBridge.requestDOM(state.previewTabId);
            }
            return;
        }

        console.log(`[Elements] B"H - Manifesting Tree UI for Vision [${state.previewTabId}]`);

        container.innerHTML = '';
        const rootContainer = HTML({
            className: 'dt-elements-content',
            style: { flexGrow: '1', overflow: 'auto', background: 'var(--color-bg-deep)', width: '100%' }
        });

        container.appendChild(rootContainer);
        
        const renderDOM = () => {
            if (!state.domString) {
                rootContainer.innerHTML = '';
                rootContainer.appendChild(HTML({
                    style: { padding: '20px', color: 'gray', fontStyle: 'italic', fontSize: '13px' },
                    text: 'B"H - Seeking the structural blueprint from the preview...'
                }));
                if (state.previewTabId) {
                    DevToolsBridge.requestDOM(state.previewTabId);
                }
                return;
            }

            rootContainer.innerHTML = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(state.domString, 'text/html');
            
            // We use our modular Builder to manifest the physical tree from the parsed doc
            const tree = DOMTreeBuilder.buildNode(doc.documentElement, [], (el, path, e) => {
                if (e.type === 'click') this.selectNode(rootContainer, state, path);
            });

            if (tree) {
                rootContainer.appendChild(tree);
                this._restoreExpansions(rootContainer, state);
            }
            this._handlePendingInspect(rootContainer, state);
        };

        // We bind the reactive hooks so the UI updates when the sandbox speaks
        state.onDomUpdate = renderDOM;
        state.onInspectRequested = () => this._handlePendingInspect(rootContainer, state);
        
        // Initial rendering attempt
        renderDOM();
    },

    _handlePendingInspect(container, state) {
        if (state.inspectPath) {
            const path = [...state.inspectPath];
            state.inspectPath = null;
            requestAnimationFrame(() => {
                this.expandToPath(container, path, state);
                this.selectNode(container, state, path);
            });
        } else if (state.selectedPath) {
            this.selectNode(container, state, state.selectedPath);
        }
    },

    _restoreExpansions(container, state) {
        if (!state.expandedPaths) return;
        state.expandedPaths.forEach(pathStr => {
            const node = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
            if (node) node.open = true;
        });
    },

    selectNode(container, state, path) {
        if (!path) return;
        const pathStr = path.join(',');
        
        container.querySelectorAll('.dt-el-node').forEach(n => n.classList.remove('selected'));
        const target = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
        if (target) {
            target.classList.add('selected');
        }
        
        state.selectedPath = path;
        
        // Inform the sandbox of our selection for REPL $0 support
        if (state.previewTabId) {
            DevToolsBridge.sendEval(state.previewTabId, `window.$0 = resolvePath(${JSON.stringify(path)});`);
        }
        
        import('../../app.js').then(m => m.App.saveSessionDebounced());
    },

    expandToPath(container, path, state) {
        if (!path || !Array.isArray(path)) return;
        let current = [];
        path.forEach(idx => {
            current.push(idx);
            const pathStr = current.join(',');
            const node = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
            if (node) {
                node.open = true;
                if (state.expandedPaths) state.expandedPaths.add(pathStr);
            }
        });
        const finalNode = container.querySelector(`.dt-el-node[data-path="${path.join(',')}"]`);
        if (finalNode) {
            finalNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            finalNode.classList.add('inspect-highlight');
            setTimeout(() => finalNode.classList.remove('inspect-highlight'), 3000);
        }
    }
};
