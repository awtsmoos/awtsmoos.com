
// B"H
// FILE: js/devtools/panels/elements.js

import { DevToolsBridge } from '../bridge.js';
import { DOMTreeBuilder } from './elements/dom-tree.js';
import { HTML } from '../../html-generator.js';

export const ElementsPanel = {
    init(container, state) {
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.height = '100%';
        container.style.width = '100%';

        const header = HTML({
            className: 'dt-elements-header',
            style: { background: 'var(--color-bg-secondary)', padding: '8px 12px', fontSize: '0.85em', color: 'var(--color-text-tertiary)', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', flexShrink: '0', width: '100%' },
            text: 'Interactive DOM Reality'
        });

        const rootContainer = HTML({
            style: { flexGrow: '1', overflow: 'auto', background: 'var(--color-bg-deep)', padding: '12px', width: '100%', boxSizing: 'border-box' }
        });

        container.appendChild(header);
        container.appendChild(rootContainer);
        
        const renderDOM = () => {
            rootContainer.innerHTML = '';
            
            if (!state.domString) {
                rootContainer.appendChild(HTML({ style: { color: 'gray', fontStyle: 'italic' }, text: 'Awaiting structural manifestation...' }));
                return;
            }

            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(state.domString, 'text/html');
                const builtTree = DOMTreeBuilder.buildNode(doc.documentElement);
                if (builtTree) {
                    rootContainer.appendChild(builtTree);
                }
            } catch(e) {
                rootContainer.appendChild(HTML({ style: { color: 'red' }, text: `Parsing Error: ${e.message}` }));
            }
        };

        renderDOM();
        state.onDomUpdate = renderDOM;

        DevToolsBridge.requestDOM(state.previewTabId);
    }
};
