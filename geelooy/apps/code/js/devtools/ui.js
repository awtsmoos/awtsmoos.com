
// B"H
/**
 * @file ui.js
 * @brief The Master Sculptor of the DevTools Vessel.
 */

import { ConsolePanel } from './panels/console.js';
import { ElementsPanel } from './panels/elements.js';
import { NetworkPanel } from './panels/network.js';
import { HTML } from '../html-generator.js';

export const DevToolsUI = {
    render(container, state) {
        if (!state) {
            console.error("%cB\"H [DevToolsUI] Render aborted: The State vessel is null.", "color: red; font-weight: bold;");
            container.innerHTML = `<div style="padding:20px;color:red;">State is void.</div>`;
            return;
        }

        // B"H - THE SHIELD OF DEFAULT VALUES
        // Prevent broken DOM IDs by ensuring pure state
        if (!state.activePanel) state.activePanel = 'console';
        if (!state.previewTabId || state.previewTabId === "undefined" || state.previewTabId === "null") {
            state.previewTabId = "default-vision-" + Date.now();
        }

        this.loadStyles();

        // Use the state's mainWrapper for persistence across re-renders
        if (state.mainWrapper && state.mainWrapper.parentElement === container) {
            console.log(`[DevToolsUI] Re-using existing DOM for Vision ${state.previewTabId}. Re-activating panel.`);
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
                        { id: `dt-panel-console-${state.previewTabId}`, className: 'dt-panel dt-panel-console' },
                        { id: `dt-panel-elements-${state.previewTabId}`, className: 'dt-panel dt-panel-elements' },
                        { id: `dt-panel-network-${state.previewTabId}`, className: 'dt-panel dt-panel-network' }
                    ]
                }
            ]
        });

        container.innerHTML = '';
        container.appendChild(mainWrapper);
        state.mainWrapper = mainWrapper; 

        this._showActivePanel(state);
    },

    _tabBtn(label, id, state) {
        return {
            tag: 'button',
            className: `dt-tab-btn ${state.activePanel === id ? 'active' : ''}`,
            text: label,
            onClick: (e) => {
                console.log(`[DevToolsUI] Switching to panel: ${id}`);
                state.activePanel = id;
                const btns = e.target.parentNode.querySelectorAll('.dt-tab-btn');
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this._showActivePanel(state);
            }
        };
    },

    _showActivePanel(state) {
        const panels = state.mainWrapper.querySelectorAll('.dt-panel');
        panels.forEach(p => { p.style.display = 'none'; });

        const activeId = `dt-panel-${state.activePanel}-${state.previewTabId}`;
        const activePanel = state.mainWrapper.querySelector(`#${activeId}`);
        
        if (activePanel) {
            activePanel.style.display = 'flex';
            
            console.log(`[DevToolsUI] Passing state to ${state.activePanel} panel for Vision ${state.previewTabId}. Has onLog hook?`, typeof state.onLog === 'function');

            if (state.activePanel === 'console') {
                ConsolePanel.init(activePanel, state);
            } else if (state.activePanel === 'elements') {
                ElementsPanel.init(activePanel, state);
            } else if (state.activePanel === 'network') {
                NetworkPanel.init(activePanel, state);
            }
        } else {
            console.error(`[DevToolsUI] Could not find active panel with ID: ${activeId}`);
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
