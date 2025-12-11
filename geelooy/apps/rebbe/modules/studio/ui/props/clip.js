//B"H
// modules/studio/ui/props/clip.js
import state from '../../../state.js';

export function renderClipProps(container) {
    if (!state.selectedClipId) {
        container.innerHTML += `
            <div style="padding:10px; color:#666; text-align:center;">NO CLIP SELECTED</div>
            <hr>
            <label>QUICK GLYPHS</label>
            <div style="display:flex; gap:5px; flex-wrap:wrap;">
                <button class="btn-tool" onclick="window.Studio.addGlyph('warning')">WARNING</button>
                <button class="btn-tool" onclick="window.Studio.addGlyph('crosshair')">TARGET</button>
                <button class="btn-tool" onclick="window.Studio.addGlyph('radar')">RADAR</button>
            </div>
        `;
        return;
    }

    const type = state.selectedType;
    let item;
    if (type === 'audio') {
        item = state.audioLayers.find(i => i.id === state.selectedClipId);
    } else {
        const list = type === 'media' ? state.mediaLayers : state.captions;
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
    } else if (type === 'media') {
        renderMediaProps(container, item);
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
        <div class="prop-group">
            <label>SOURCE OFFSET</label>
            <input type="number" step="0.1" class="cyber-input" value="${(item.offset||0).toFixed(2)}" onchange="window.Studio.updateClip('offset', parseFloat(this.value))">
        </div>
        <div style="padding:10px; font-size:12px; color:#666;">
            EDIT SOURCE OFFSET TO CHANGE WHICH PART OF THE FILE PLAYS.
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
                <option value="destination-in" ${item.blendMode==='destination-in'?'selected':''}>ALPHA MASK (IN)</option>
                <option value="destination-out" ${item.blendMode==='destination-out'?'selected':''}>PUNCH OUT (MASK)</option>
            </select>
        </div>
        <div class="prop-group">
            <label>OPACITY</label>
            <input type="range" min="0" max="1" step="0.05" value="${item.opacity||1}" oninput="window.Studio.updateClip('opacity', parseFloat(this.value))">
        </div>
        <div class="prop-group">
            <label>SCALE</label>
            <input type="range" min="0.1" max="5" step="0.1" value="${item.scale||1}" oninput="window.Studio.updateClip('scale', parseFloat(this.value))">
        </div>
        <hr>
        <label style="color:var(--c-cyan)">VISUAL FX</label>
        <div class="prop-group">
             <label><input type="checkbox" ${filter.hologram?'checked':''} onchange="let obj = window.state.mediaLayers.find(i=>i.id==window.state.selectedClipId); if(obj){ if(!obj.filter) obj.filter={}; obj.filter.hologram=this.checked; window.Studio.updateClip('filter', obj.filter); }"> HOLOGRAM MODE</label>
        </div>
        <div class="prop-group">
            <label>BRIGHTNESS (${filter.brightness}%)</label>
            <input type="range" min="0" max="200" value="${filter.brightness}" oninput="let obj = window.state.mediaLayers.find(i=>i.id==window.state.selectedClipId); if(obj){ if(!obj.filter) obj.filter={}; obj.filter.brightness=parseInt(this.value); window.Studio.updateClip('filter', obj.filter); }">
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
        <div class="prop-group">
            <label>TRANSLATION</label>
            <textarea class="cyber-input" rows="3" onchange="window.Studio.updateClip('translation', this.value)">${item.translation}</textarea>
        </div>
         <div class="prop-group">
             <label><input type="checkbox" ${style.glitch?'checked':''} onchange="window.Studio.updateClipStyle('glitch', this.checked)"> GLITCH FX</label>
        </div>
        <div class="prop-group">
            <label>FONT</label>
            <select class="cyber-input" onchange="window.Studio.updateClipStyle('font', this.value)">
                <option value="monospace" ${style.font==='monospace'?'selected':''}>MONOSPACE</option>
                <option value="Arial" ${style.font==='Arial'?'selected':''}>ARIAL</option>
                <option value="Impact" ${style.font==='Impact'?'selected':''}>IMPACT</option>
            </select>
        </div>
        <div class="prop-group">
            <label>SIZE</label>
            <input type="number" class="cyber-input" value="${style.fontSize||40}" onchange="window.Studio.updateClipStyle('fontSize', parseInt(this.value))">
        </div>
        <div class="prop-group">
            <label>COLOR</label>
            <input type="color" class="cyber-input" value="${style.color||'#ff0055'}" onchange="window.Studio.updateClipStyle('color', this.value)">
        </div>
        <div class="prop-group">
            <label>Y POSITION</label>
            <input type="range" min="0" max="1" step="0.05" value="${style.y||0.8}" oninput="window.Studio.updateClipStyle('y', parseFloat(this.value))">
        </div>
    `;
}