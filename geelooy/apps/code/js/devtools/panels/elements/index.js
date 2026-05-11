
// B"H
/**
 * @file index.js (elements panel)
 * @brief Orchestrates the persistent Element Inspector.
 */

import { HTML } from '../../../../html-generator.js';
import { DOMWalker } from './dom-walker.js';
import { DevToolsBridge } from '../../bridge.js';

export const ElementsPanel = {
    /**
     * B"H - Initializes the Elements vision.
     */
    init(container, state) {
        if (container.querySelector('.dt-elements-content')) {
            // Already active, just re-request if empty
            if (!state.domString) DevToolsBridge.requestDOM(state.previewTabId);
            return;
        }

        container.innerHTML = '';
        const root = HTML({
            className: 'dt-elements-content',
            style: { flexGrow: '1', overflow: 'auto', background: 'var(--color-bg-deep)', width: '100%' }
        });
        container.appendChild(root);

        const performWalk = () => {
            DOMWalker.walk(root, state, (el, path, e) => {
                this._handleInteract(root, state, path, e);
            });
        };

        // Bind reactive hooks
        state.onDomUpdate = performWalk;
        
        // Manifest initial structure
        performWalk();
    },

    _handleInteract(root, state, path, e) {
        if (e.type === 'click') {
            this._selectNode(root, state, path);
        } else if (e.type === 'contextmenu') {
            e.preventDefault();
            // TODO: Context menu for elements
        }
    },

    _selectNode(root, state, path) {
        const pathStr = path.join(',');
        root.querySelectorAll('.dt-el-node').forEach(n => n.classList.remove('selected'));
        
        const target = root.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
        if (target) {
            target.classList.add('selected');
        }
        
        state.selectedPath = path;
        DevToolsBridge.setSelectedPath(state.previewTabId, path);
    }
};
