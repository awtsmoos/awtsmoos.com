/* B"H */
import { elements, scrollState } from '../ui.js';
function readPanelLayout(panelId){
    const panel=document.getElementById(panelId); if(!panel) return [];
    return [...panel.querySelectorAll('.key')].map(key=>({note:key.dataset.note,isBlack:key.classList.contains('black-key'),x:key.offsetLeft,width:key.offsetWidth})).filter(key=>key.note&&key.width>0);
}
function readKeyboardLayout(){return {bottom:readPanelLayout('keyboard-bottom'),top:readPanelLayout('keyboard-top')};}
function recorderTuning(fps){return {liveRenderBudgetMs:7,liveMaxFramesPerPump:1,livePumpIntervalMs:280,liveEncodeLatency:.55,maxLiveBacklog:1.35,eventHistoryLimit:100000,exportFps:fps,finalFrameBatch:8};}
export function makeVideoConfig(){
    const isVertical=window.innerHeight>window.innerWidth;
    const resolution=isVertical?{width:720,height:1280}:{width:1280,height:720};
    const requested=parseInt(document.getElementById('myFPS')?.value,10)||15;
    const fps=Math.max(10,Math.min(requested,15));
    return {renderMode:elements.effectSelect.value,resolution,outputFormat:{quality:.64,fps},startOctave:elements.octaveSelect.value,alwaysDual:elements.alwaysDualCheckbox.checked,independentScroll:elements.independentScrollCheckbox.checked,isVertical,style:{userKeyWidth:parseInt(elements.keyWidthSlider.value,10),userViewportWidth:elements.keyboardContainer.clientWidth},initialScrollX:scrollState.x,initialScrollX2:scrollState.x2||0,keyboardLayout:readKeyboardLayout(),...recorderTuning(fps)};
}
