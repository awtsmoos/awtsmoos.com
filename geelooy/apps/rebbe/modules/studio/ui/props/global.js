//B"H
// modules/studio/ui/props/global.js
import state from '../../../state.js';

export function renderGlobalProps(container) {
    container.innerHTML += `
        <div class="prop-group">
            <label>ZOOM LEVEL</label>
            <input type="range" min="10" max="300" value="${state.studioZoom}" oninput="window.Studio.setZoom(this.value)">
        </div>
        <div class="prop-group">
            <label>BACKGROUND COLOR</label>
            <input type="color" value="${state.studioGlobal.bg}" onchange="window.Studio.updateGlobal('bg', this.value)">
        </div>
        <div class="prop-group">
            <label>BG PATTERN</label>
            <select class="cyber-input" onchange="window.Studio.updateGlobal('bgPattern', this.value)">
                <option value="none" ${state.studioGlobal.bgPattern==='none'?'selected':''}>NONE</option>
                <option value="grid" ${state.studioGlobal.bgPattern==='grid'?'selected':''}>2D GRID</option>
                <option value="dots" ${state.studioGlobal.bgPattern==='dots'?'selected':''}>DOTS</option>
                <option value="noise" ${state.studioGlobal.bgPattern==='noise'?'selected':''}>STATIC</option>
            </select>
        </div>
        <hr>
        <div class="prop-group">
            <label style="color:var(--c-magenta)">PARTICLES</label>
            <label>MODE</label>
            <select class="cyber-input" onchange="window.Studio.updateParticle('mode', this.value)">
                <option value="float" ${state.studioParticleSettings.mode==='float'?'selected':''}>FLOAT (VIDEO DEFAULT)</option>
                <option value="circle" ${state.studioParticleSettings.mode==='circle'?'selected':''}>PULSE CIRCLE</option>
                <option value="spiral" ${state.studioParticleSettings.mode==='spiral'?'selected':''}>SPIRAL</option>
                <option value="random" ${state.studioParticleSettings.mode==='random'?'selected':''}>CHAOS</option>
            </select>
        </div>
        <div class="prop-group">
            <label>COLOR MODE</label>
             <select class="cyber-input" onchange="window.Studio.updateParticle('colorMode', this.value)">
                <option value="rainbow" ${state.studioParticleSettings.colorMode==='rainbow'?'selected':''}>🌈 RAINBOW</option>
                <option value="velocity" ${state.studioParticleSettings.colorMode==='velocity'?'selected':''}>VELOCITY</option>
                <option value="solid" ${state.studioParticleSettings.colorMode==='solid'?'selected':''}>SOLID</option>
            </select>
        </div>
        ${state.studioParticleSettings.colorMode === 'solid' ? `
        <div class="prop-group">
            <label>SOLID COLOR</label>
            <input type="color" value="${state.studioParticleSettings.color}" onchange="window.Studio.updateParticle('color', this.value)">
        </div>` : ''}
        <div class="prop-group">
            <label>COUNT (${state.studioParticleSettings.count})</label>
            <input type="range" min="50" max="1000" value="${state.studioParticleSettings.count}" onchange="window.Studio.updateParticle('count', parseInt(this.value))">
        </div>
        <div class="prop-group">
            <label>REACTIVITY</label>
            <input type="range" min="0" max="5" step="0.1" value="${state.studioParticleSettings.reactivity}" onchange="window.Studio.updateParticle('reactivity', parseFloat(this.value))">
        </div>
        <div class="prop-group">
            <label>PARTICLE SIZE</label>
            <input type="range" min="5" max="50" value="${state.studioParticleSettings.sizeBase || 20}" onchange="window.Studio.updateParticle('sizeBase', parseInt(this.value))">
        </div>
    `;
}