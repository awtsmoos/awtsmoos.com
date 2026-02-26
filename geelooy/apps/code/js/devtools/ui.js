
// B"H
// FILE: js/devtools/ui.js

import { ConsolePanel } from './panels/console.js';
import { ElementsPanel } from './panels/elements.js';
import { NetworkPanel } from './panels/network.js';

export const DevToolsUI = {
    render(container, state) {
        this.loadStyles();

        // Overwrite container to guarantee pure expanse
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.width = '100%';

        container.innerHTML = `
            <div class="dt-main-wrapper">
                <div class="dt-header">
                    <button class="dt-tab-btn ${state.activePanel==='console'?'active':''}" data-panel="console">Console</button>
                    <button class="dt-tab-btn ${state.activePanel==='elements'?'active':''}" data-panel="elements">Elements</button>
                    <button class="dt-tab-btn ${state.activePanel==='network'?'active':''}" data-panel="network">Network</button>
                </div>
                <div class="dt-body">
                    <div id="dt-panel-console" class="dt-panel" style="display:${state.activePanel==='console'?'flex':'none'};"></div>
                    <div id="dt-panel-elements" class="dt-panel" style="display:${state.activePanel==='elements'?'flex':'none'};"></div>
                    <div id="dt-panel-network" class="dt-panel" style="display:${state.activePanel==='network'?'flex':'none'};"></div>
                </div>
            </div>
        `;

        container.querySelectorAll('.dt-tab-btn').forEach(b => {
            b.onclick = () => {
                state.activePanel = b.dataset.panel;
                this.render(container, state); 
            };
        });

        if (state.activePanel === 'console') ConsolePanel.init(container.querySelector('#dt-panel-console'), state);
        if (state.activePanel === 'elements') ElementsPanel.init(container.querySelector('#dt-panel-elements'), state);
        if (state.activePanel === 'network') NetworkPanel.init(container.querySelector('#dt-panel-network'), state);
    },

    loadStyles() {
        // B"H - Infusing the environment with specific CSS architectures
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
