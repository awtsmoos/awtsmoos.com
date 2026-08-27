//B"H
// modules/studio/ui/props/fx.js
import state from '../../../state.js';

export function renderFXProps(container) {
    const fx = state.studioFX;
    const t = (k) => `window.Studio.updateFX('${k}', this.checked)`;
    
    container.innerHTML += `
        <label style="color:var(--c-lime); font-weight:bold;">MASTER FX</label>
        <div class="prop-group"><label><input type="checkbox" ${fx.beatRing?'checked':''} onchange="${t('beatRing')}"> BEAT RING (CENTRAL)</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.pump?'checked':''} onchange="${t('pump')}"> AUDIO PUMP</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.rgbSplit?'checked':''} onchange="${t('rgbSplit')}"> RGB SPLIT</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.mirrorX?'checked':''} onchange="${t('mirrorX')}"> MIRROR X</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.mirrorY?'checked':''} onchange="${t('mirrorY')}"> MIRROR Y</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.vhs?'checked':''} onchange="${t('vhs')}"> VHS OVERLAY</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.crt?'checked':''} onchange="${t('crt')}"> CRT MONITOR</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.colorCycle?'checked':''} onchange="${t('colorCycle')}"> COLOR CYCLE</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.jitter?'checked':''} onchange="${t('jitter')}"> JITTER SHAKE</label></div>
        <div class="prop-group"><label><input type="checkbox" ${fx.vaporGrid?'checked':''} onchange="${t('vaporGrid')}"> VAPOR GRID</label></div>
    `;
}