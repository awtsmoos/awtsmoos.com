//B"H
// modules/studio/ui.js
// AGGREGATOR MODULE

import { renderTimeline } from './ui/timeline.js';
import { bindStudioEvents } from './ui/binds.js';
import { renderGlobalProps, renderFXProps, renderClipProps } from './ui/props.js';
import state from '../state.js';

const el = (id) => document.getElementById(id);

export { renderTimeline, bindStudioEvents };

export function updatePropertiesPanel() {
    const container = el('studio-props'); // This is the .prop-content div in HTML
    if (!container) return; // FIX: Prevents crash if modal DOM isn't ready
    
    // Clear previous
    container.innerHTML = '';

    // MOBILE CLOSE BUTTON (Injected dynamically)
    if(window.innerWidth <= 768) {
        const btnClose = document.createElement('button');
        btnClose.className = 'btn-tool full-width';
        btnClose.textContent = 'CLOSE PANEL';
        btnClose.style.background = '#222';
        btnClose.style.borderBottom = '1px solid #000';
        btnClose.style.marginBottom = '0';
        btnClose.style.borderRadius = '0';
        btnClose.style.padding = '12px';
        btnClose.onclick = () => container.classList.remove('open');
        container.appendChild(btnClose);
    }

    // Render Tabs
    const tabs = document.createElement('div');
    tabs.className = 'prop-tabs';
    tabs.innerHTML = `
        <button class="tab-btn ${state.activeTab==='global'?'active':''}" id="tab-global">GLOBAL</button>
        <button class="tab-btn ${state.activeTab==='clip'?'active':''}" id="tab-clip">CLIP</button>
        <button class="tab-btn ${state.activeTab==='fx'?'active':''}" id="tab-fx">FX</button>
    `;
    container.appendChild(tabs);
    
    // Bind Tabs
    el('tab-global').onclick = () => { state.activeTab='global'; updatePropertiesPanel(); };
    el('tab-clip').onclick = () => { state.activeTab='clip'; updatePropertiesPanel(); };
    el('tab-fx').onclick = () => { state.activeTab='fx'; updatePropertiesPanel(); };

    // Render Content Area
    const content = document.createElement('div');
    content.className = 'prop-inner-content';
    container.appendChild(content);

    if (state.activeTab === 'global') renderGlobalProps(content);
    else if (state.activeTab === 'fx') renderFXProps(content);
    else renderClipProps(content);
}

// --- RESIZER LOGIC ---

export function initResizer() {
    const resizer = document.getElementById('studio-resizer');
    const topPanel = document.querySelector('.studio-top');
    const bottomPanel = document.querySelector('.studio-bottom');
    const container = document.getElementById('modal-studio');
    
    if(!resizer || !topPanel || !bottomPanel || !container) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    });
    
    // Touch support for mobile resizing
    resizer.addEventListener('touchstart', (e) => {
        isResizing = true;
        e.preventDefault();
    });

    const onMove = (e) => {
        if (!isResizing) return;
        
        let clientY = e.clientY;
        if(e.touches && e.touches.length > 0) clientY = e.touches[0].clientY;

        const rect = container.getBoundingClientRect();
        const offset = clientY - rect.top;
        const totalHeight = rect.height;
        
        // Constrain
        if (offset > 100 && offset < totalHeight - 100) {
            const pct = (offset / totalHeight) * 100;
            topPanel.style.flex = `0 0 ${pct}%`;
            bottomPanel.style.flex = `1 1 auto`; 
        }
    };

    const onUp = () => {
        if(isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
}