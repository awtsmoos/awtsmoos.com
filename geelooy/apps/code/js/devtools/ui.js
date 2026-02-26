
// B"H
// FILE: js/devtools/ui.js

import { ConsolePanel } from './panels/console.js';
import { ElementsPanel } from './panels/elements.js';
import { NetworkPanel } from './panels/network.js';
import { HTML } from '../html-generator.js';

export const DevToolsUI = {
    render(container, state) {
        this.loadStyles();

        // B"H - PERSISTENCE RITUAL
        // If we already have the physical form, just re-attach to the new container.
        if (state.mainWrapper) {
            container.innerHTML = '';
            container.appendChild(state.mainWrapper);
            this._showActivePanel(state);
            return;
        }

        const mainWrapper = HTML({
            className: 'dt-main-wrapper',
            children: [
                {
                    className: 'dt-header',
                    children: [
                        this._tabBtn('Console', 'console', state),
                        this._tabBtn('Elements', 'elements', state),
                        this._tabBtn('Network', 'network', state)
                    ]
                },
                {
                    className: 'dt-body',
                    children: [
                        { id: 'dt-panel-console', className: 'dt-panel', style: { height: '100%', width: '100%', display: 'none' } },
                        { id: 'dt-panel-elements', className: 'dt-panel', style: { height: '100%', width: '100%', display: 'none' } },
                        { id: 'dt-panel-network', className: 'dt-panel', style: { height: '100%', width: '100%', display: 'none' } }
                    ]
                }
            ]
        });

        container.innerHTML = '';
        container.appendChild(mainWrapper);
        state.mainWrapper = mainWrapper; 

        this._showActivePanel(state);

        // B"H - Global tree toggle listener to remember expanded state across tab switches
        mainWrapper.addEventListener('toggle', (e) => {
            if (e.target.classList.contains('dt-el-node')) {
                const path = e.target.dataset.path;
                if (e.target.open) state.expandedPaths.add(path);
                else state.expandedPaths.delete(path);
            }
        }, true);
    },

    _tabBtn(label, id, state) {
        return {
            tag: 'button',
            className: `dt-tab-btn ${state.activePanel === id ? 'active' : ''}`,
            text: label,
            onClick: (e) => {
                state.activePanel = id;
                const btns = e.target.parentNode.querySelectorAll('.dt-tab-btn');
                btns.forEach(b => b.classList.toggle('active', b.textContent === label));
                this._showActivePanel(state);
            }
        };
    },

    /**
     * @function _showActivePanel
     * @description Switches the visible sub-panel and triggers its specific initialization ritual.
     */
    _showActivePanel(state) {
        const panels = state.mainWrapper.querySelectorAll('.dt-panel');
        panels.forEach(p => p.style.display = 'none');

        const activeId = `dt-panel-${state.activePanel}`;
        const activePanel = state.mainWrapper.querySelector(`#${activeId}`);
        
        if (activePanel) {
            activePanel.style.display = 'flex';
            
            // Trigger specific sub-panel init logic
            if (state.activePanel === 'console') {
                ConsolePanel.init(activePanel, state);
            } else if (state.activePanel === 'elements') {
                ElementsPanel.init(activePanel, state);
            } else if (state.activePanel === 'network') {
                NetworkPanel.init(activePanel, state);
            }
        }
    },

    loadStyles() {
        const styles = ['layout.css', 'console.css', 'object-viewer.css', 'elements.css'];
        styles.forEach(s => {
            const id = `dt-style-${s.split('.')[0]}`;
            if (!document.getElementById(id)) {
                const link = document.createElement('link');
                link.id = id;
                link.rel = 'stylesheet';
                link.href = `css/devtools/${s}`;
                document.head.appendChild(link);
            }
        });
    }
};
