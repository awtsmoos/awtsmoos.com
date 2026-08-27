//B"H
// modules/studio/ui/props/global.js
import state from '../../../state.js';
import * as Project from '../../project.js';
import { updatePropertiesPanel } from '../../ui.js';

export function renderGlobalProps(container) {
    container.innerHTML += `
        <div class="prop-group" style="border:1px solid #333; padding:10px; margin-bottom:10px;">
            <label style="color:var(--c-yellow)">PROJECT: ${state.projectName}</label>
            <div style="display:flex; gap:5px;">
                <button class="btn-tool" id="btn-save-proj">SAVE</button>
                <button class="btn-tool" id="btn-load-proj">LOAD</button>
                <button class="btn-tool" id="btn-export-json">JSON</button>
            </div>
        </div>

        <div class="prop-group">
            <label>RESOLUTION</label>
            <select class="cyber-input" onchange="window.Studio.setResolution(this.value)">
                <option value="portrait" ${state.resolutionSetting==='portrait'?'selected':''}>PORTRAIT (9:16)</option>
                <option value="landscape" ${state.resolutionSetting==='landscape'?'selected':''}>LANDSCAPE (16:9)</option>
                <option value="square" ${state.resolutionSetting==='square'?'selected':''}>SQUARE (1:1)</option>
            </select>
        </div>

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
    `;
    
    // Bind Project Buttons
    setTimeout(() => {
        document.getElementById('btn-save-proj').onclick = () => {
            const name = prompt("Project Name:", state.projectName);
            if(name) { state.projectName = name; Project.saveProjectToDB(); updatePropertiesPanel(); }
        };
        document.getElementById('btn-load-proj').onclick = async () => {
            const list = await Project.loadProjectList();
            if(list.length===0) return alert("No Saved Projects");
            const msg = list.map((p,i) => `${p.id}: ${p.name}`).join('\n');
            const id = prompt("Enter ID to load:\n" + msg);
            if(id) Project.loadProject(parseInt(id));
        };
        document.getElementById('btn-export-json').onclick = () => Project.exportProjectJSON();
    }, 0);
}