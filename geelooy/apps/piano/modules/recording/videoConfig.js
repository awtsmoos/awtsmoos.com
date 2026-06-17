/* B"H */
import { elements, scrollState } from '../ui.js';
function readPanelLayout(panelId){
    const panel=document.getElementById(panelId); if(!panel) return [];
    return [...panel.querySelectorAll('.key')].map(key=>({note:key.dataset.note,isBlack:key.classList.contains('black-key'),x:key.offsetLeft,width:key.offsetWidth})).filter(key=>key.note&&key.width>0);
}
function readKeyboardLayout(){return {bottom:readPanelLayout('keyboard-bottom'),top:readPanelLayout('keyboard-top')};}
function liveEncoderTuning(fps){return {liveRenderBudgetMs:6,liveMaxFramesPerPump:1,livePumpIntervalMs:140,eventHistoryLimit:50000,exportFps:fps,finalFrameBatch:12};}
export function makeVideoConfig(){
    const isVertical=window.innerHeight>window.innerWidth;
    const resolution=isVertical?{width:720,height:1280}:{width:1280,height:720};
    const requested=parseInt(document.getElementById('myFPS')?.value,10)||18;
    const fps=Math.max(12,Math.min(requested,18));
    return {renderMode:elements.effectSelect.value,resolution,outputFormat:{quality:.68,fps},startOctave:elements.octaveSelect.value,alwaysDual:elements.alwaysDualCheckbox.checked,independentScroll:elements.independentScrollCheckbox.checked,isVertical,style:{userKeyWidth:parseInt(elements.keyWidthSlider.value,10),userViewportWidth:elements.keyboardContainer.clientWidth},initialScrollX:scrollState.x,initialScrollX2:scrollState.x2||0,keyboardLayout:readKeyboardLayout(),...liveEncoderTuning(fps)};
}
