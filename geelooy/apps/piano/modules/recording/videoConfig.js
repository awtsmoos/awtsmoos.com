/* B"H */
import { elements, scrollState } from '../ui.js';
function readPanelLayout(panelId){
    const panel=document.getElementById(panelId); if(!panel) return [];
    return [...panel.querySelectorAll('.key')].map(key=>({note:key.dataset.note,isBlack:key.classList.contains('black-key'),x:key.offsetLeft,width:key.offsetWidth})).filter(key=>key.note&&key.width>0);
}
function readKeyboardLayout(){return {bottom:readPanelLayout('keyboard-bottom'),top:readPanelLayout('keyboard-top')};}
function liveEncoderTuning(fps){return {liveRenderBudgetMs:fps>30?5:7,liveMaxFramesPerPump:1,livePumpIntervalMs:fps>30?140:180,eventHistoryLimit:700};}
export function makeVideoConfig(){
    const isVertical=window.innerHeight>window.innerWidth;
    const resolution=isVertical?{width:1080,height:1920}:{width:1920,height:1080};
    const fps=Math.max(12,Math.min(parseInt(document.getElementById('myFPS')?.value,10)||24,30));
    return {renderMode:elements.effectSelect.value,resolution,outputFormat:{quality:.78,fps},startOctave:elements.octaveSelect.value,alwaysDual:elements.alwaysDualCheckbox.checked,independentScroll:elements.independentScrollCheckbox.checked,isVertical,style:{userKeyWidth:parseInt(elements.keyWidthSlider.value,10),userViewportWidth:elements.keyboardContainer.clientWidth},initialScrollX:scrollState.x,initialScrollX2:scrollState.x2||0,keyboardLayout:readKeyboardLayout(),...liveEncoderTuning(fps)};
}
