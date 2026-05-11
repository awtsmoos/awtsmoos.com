
// B"H
/**
 * @file dom-walker.js
 * @brief Translates raw HTML strings into the Living Tree of Elements.
 */

import { DOMTreeBuilder } from './tree/builder.js';
import { DevToolsBridge } from '../../bridge.js';

export const DOMWalker = {
    /**
     * B"H - Solidifies the HTML string into a DOM Tree within the container.
     */
    walk(container, state, onInteract) {
        if (!state.domString) {
            container.innerHTML = '<div style="padding:20px; color:gray; font-style:italic;">B"H - Recalling structural attributes...</div>';
            DevToolsBridge.requestDOM(state.previewTabId);
            return;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(state.domString, 'text/html');
            
            container.innerHTML = '';
            const tree = DOMTreeBuilder.buildNode(doc.documentElement, [], (el, path, e) => {
                onInteract(el, path, e);
            });

            if (tree) {
                container.appendChild(tree);
                this._restoreExpansions(container, state);
            }
        } catch (e) {
            console.error("B\"H - DOM Walker encountered a Shevirah:", e);
            container.innerHTML = `<div style="color:var(--color-accent-danger); padding:20px;">Structure Shattered: ${e.message}</div>`;
        }
    },

    _restoreExpansions(container, state) {
        if (!state.expandedPaths) return;
        state.expandedPaths.forEach(pathStr => {
            const node = container.querySelector(`.dt-el-node[data-path="${pathStr}"]`);
            if (node) node.open = true;
        });
    }
};
