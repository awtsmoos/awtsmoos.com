
// B"H
/**
 * @file index.js (elements panel)
 */

import { HTML } from '../../../../html-generator.js';

export const ElementsPanel = {
    attach(container, tabId) {
        const root = HTML({
            style: { padding: '20px', color: '#ccc', fontFamily: 'monospace' },
            text: 'B"H - Elements Rendering Placeholder'
        });
        container.appendChild(root);
        return {
            update: (html) => { root.textContent = 'Updating: ' + html.substring(0, 20); }
        };
    }
};
