/* B"H */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';
import { createVideoWorker } from './videoWorker.js';
import { makeVideoConfig } from './videoConfig.js';
import { logVideoKeyUp } from './videoEvents.js';
export async function toggleVideoRecording(){
    const btn=elements.recordVideoButton;
    if(recordingState.isVideoRecording) return stopVideo(btn);
    recordingState.videoKeyDownMap.clear();
    const worker=createVideoWorker();
    await startMediaRecorder('video');
    recordingState.videoStartTime=AudioState.context.currentTime;
    worker.postMessage({type:'INITIALIZE_RENDERER',payload:makeVideoConfig()});
    recordingState.isVideoRecording=true;
    elements.videoProgress.textContent='Recording video... live preview is throttled for smooth playing.';
    btn.textContent='Stop Video';
}
function stopVideo(btn){
    const stopTime=AudioState.context.currentTime;
    recordingState.videoKeyDownMap.forEach((_down,noteName)=>logVideoKeyUp(noteName,stopTime));
    recordingState.videoKeyDownMap.clear();
    stopMediaRecorder();
    recordingState.isVideoRecording=false;
    btn.textContent='Processing Video...';
    elements.videoProgress.textContent='Saving audio chunks and rendering final video...';
}
