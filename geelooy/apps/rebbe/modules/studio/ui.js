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
    const p = el('studio-props');
    if(!p) return;
    
    const content = p.querySelector('.prop-content');
    content.innerHTML = '';

    const tabs = document.createElement('div');
    tabs.className = 'prop-tabs';
    tabs.innerHTML = `
        <button class="tab-btn ${state.activeTab==='global'?'active':''}" id="tab-global">GLOBAL</button>
        <button class="tab-btn ${state.activeTab==='clip'?'active':''}" id="tab-clip">CLIP</button>
        <button class="tab-btn ${state.activeTab==='fx'?'active':''}" id="tab-fx">FX</button>
    `;
    content.appendChild(tabs);
    
    el('tab-global').onclick = () => { state.activeTab='global'; updatePropertiesPanel(); };
    el('tab-clip').onclick = () => { state.activeTab='clip'; updatePropertiesPanel(); };
    el('tab-fx').onclick = () => { state.activeTab='fx'; updatePropertiesPanel(); };

    if (state.activeTab === 'global') renderGlobalProps(content);
    else if (state.activeTab === 'fx') renderFXProps(content);
    else renderClipProps(content);
}