//B"H
// modules/studio/ui/props/clip.js
import state from '../../../state.js';

export function renderClipProps(container) {
    if (!state.selectedClipId) {
        container.innerHTML += `
            <div style="padding:10px; color:#666; text-align:center;">NO LAYER SELECTED</div>
            <hr>
            <label>ADD LAYER</label>
            <div style="display:flex; gap:5px; flex-wrap:wrap; flex-direction:column;">
                <button class="btn-tool" onclick="window.Studio.addEffectLayer('particles')">+ PARTICLE LAYER</button>
                <button class="btn-tool" onclick="window.Studio.addGlyph('warning')">+ GLYPH: WARNING</button>
                <button class="btn-tool" onclick="window.Studio.addGlyph('radar')">+ GLYPH: RADAR</button>
            </div>
        `;
        return;
    }

    const type = state.selectedType;
    let item;
    if (type === 'audio') {
        item = state.audioLayers.find(i => i.id === state.selectedClipId);
    } else {
        const list = (type === 'media' || type === 'effect' || type === 'glyph') ? state.mediaLayers : state.captions;
        item = list.find(i => i.id === state.selectedClipId);
    }
    
    if (!item) return;

    container.innerHTML += `
        <div class="prop-group">
            <label>START TIME</label>
            <input type="number" step="0.1" class="cyber-input" value="${item.start.toFixed(2)}" onchange="window.Studio.updateClip('start', parseFloat(this.value))">
        </div>
        <div class="prop-group">
            <label>DURATION</label>
            <input type="number" step="0.1" class="cyber-input" value="${(item.end - item.start).toFixed(2)}" onchange="window.Studio.updateClipDuration(parseFloat(this.value))">
        </div>
        
        <div style="display:flex; gap:5px; margin-top:5px;">
            <button class="btn-tool full-width" onclick="window.Studio.duplicateSelected()">DUPLICATE</button>
            <button class="btn-danger full-width" onclick="window.Studio.deleteSelected()">DELETE</button>
        </div>
        <hr>
    `;

    if (type === 'audio') {
        renderAudioProps(container, item);
    } else if (type === 'media' || type === 'glyph') {
        renderMediaProps(container, item);
    } else if (type === 'effect') {
        renderEffectProps(container, item);
    } else if (type === 'caption') {
        renderCaptionProps(container, item);
    }
}

function renderAudioProps(container, item) {
    container.innerHTML += `
        <div class="prop-group">
            <label>VOLUME</label>
            <input type="range" min="0" max="1" step="0.1" value="${item.vol || 1.0}" oninput="window.Studio.updateClip('vol', parseFloat(this.value))">
        </div>
    `;
}

function renderMediaProps(container, item) {
    const filter = item.filter || { brightness: 100, blur: 0 };
    container.innerHTML += `
        <div style="display:flex; gap:5px; margin-bottom:10px;">
            <button class="btn-tool" onclick="window.Studio.moveLayer('up')">LAYER UP ▲</button>
            <button class="btn-tool" onclick="window.Studio.moveLayer('down')">LAYER DOWN ▼</button>
        </div>
        <div class="prop-group">
            <label>BLEND MODE</label>
            <select class="cyber-input" onchange="window.Studio.updateClip('blendMode', this.value)">
                <option value="source-over" ${item.blendMode==='source-over'?'selected':''}>NORMAL</option>
                <option value="screen" ${item.blendMode==='screen'?'selected':''}>SCREEN (ADD)</option>
                <option value="overlay" ${item.blendMode==='overlay'?'selected':''}>OVERLAY</option>
                <option value="multiply" ${item.blendMode==='multiply'?'selected':''}>MULTIPLY</option>
            </select>
        </div>
        <div class="prop-group">
            <label>OPACITY</label>
            <input type="range" min="0" max="1" step="0.05" value="${item.opacity!==undefined?item.opacity:1}" oninput="window.Studio.updateClip('opacity', parseFloat(this.value))">
        </div>
        <div class="prop-group">
            <label>SCALE</label>
            <input type="range" min="0.1" max="5" step="0.1" value="${item.scale||1}" oninput="window.Studio.updateClip('scale', parseFloat(this.value))">
        </div>
    `;
}

function renderEffectProps(container, item) {
    const c = item.config || {};
    // Function to update nested config
    const up = (k, v) => {
        let l = window.state.mediaLayers.find(i=>i.id==window.state.selectedClipId);
        if(l) { 
            if(!l.config) l.config={}; 
            l.config[k]=v; 
            window.Studio.renderTimeline(); // Re-render to show update
        }
    };
    
    // Attach helper to window for HTML events
    window.Studio.upEff = up;

    container.innerHTML += `
        <div style="display:flex; gap:5px; margin-bottom:10px;">
            <button class="btn-tool" onclick="window.Studio.moveLayer('up')">LAYER UP ▲</button>
            <button class="btn-tool" onclick="window.Studio.moveLayer('down')">LAYER DOWN ▼</button>
        </div>
        <label style="color:var(--c-magenta)">PARTICLE SETTINGS</label>
        <div class="prop-group">
            <label>MODE</label>
            <select class="cyber-input" onchange="window.Studio.upEff('mode', this.value)">
                <option value="float" ${c.mode==='float'?'selected':''}>FLOAT</option>
                <option value="circle" ${c.mode==='circle'?'selected':''}>CIRCLE</option>
                <option value="random" ${c.mode==='random'?'selected':''}>CHAOS</option>
            </select>
        </div>
        <div class="prop-group">
            <label>COLOR</label>
            <select class="cyber-input" onchange="window.Studio.upEff('colorMode', this.value)">
                <option value="rainbow" ${c.colorMode==='rainbow'?'selected':''}>RAINBOW</option>
                <option value="solid" ${c.colorMode==='solid'?'selected':''}>SOLID</option>
            </select>
        </div>
        ${c.colorMode==='solid' ? `<input type="color" value="${c.color||'#ffffff'}" onchange="window.Studio.upEff('color', this.value)">` : ''}
        <div class="prop-group">
            <label>COUNT</label>
            <input type="range" min="10" max="1000" value="${c.count||200}" onchange="window.Studio.upEff('count', parseInt(this.value))">
        </div>
        <div class="prop-group">
            <label>SIZE</label>
            <input type="range" min="5" max="100" value="${c.sizeBase||20}" onchange="window.Studio.upEff('sizeBase', parseInt(this.value))">
        </div>
    `;
}

function renderCaptionProps(container, item) {
    const style = item.style || {};
    container.innerHTML += `
        <div class="prop-group">
            <label>TEXT CONTENT</label>
            <textarea class="cyber-input" rows="3" onchange="window.Studio.updateClip('text', this.value)">${item.text}</textarea>
        </div>
    `;
}