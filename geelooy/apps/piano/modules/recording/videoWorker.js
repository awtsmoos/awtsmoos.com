/* B"H */
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { downloadBlob } from './download.js';
export function createVideoWorker(){const worker=new Worker(`./synth-video-worker.js?bh=${Date.now()}`); worker.onmessage=e=>handleWorkerMessage(worker,e.data); setVideoWorker(worker); return worker;}
function handleWorkerMessage(worker,data){
    const {type,payload}=data, progress=elements.videoProgress;
    if(type==='STATUS_UPDATE') progress.textContent=payload.message;
    else if(type==='PROGRESS_UPDATE') progress.textContent=`Processing: ${payload.percent}%`;
    else if(type==='VIDEO_COMPLETE') complete(worker,payload,progress);
    else if(type==='FATAL_ERROR'){progress.textContent=payload.message; recordingState.isVideoRecording=false; elements.recordVideoButton.textContent='Record Video';}
}
function complete(worker,payload,progress){
    progress.textContent='Complete! Downloading...'; downloadBlob(payload.blob,`BH-Video-${Date.now()}.mp4`);
    worker.terminate(); setVideoWorker(null); recordingState.isVideoRecording=false;
    elements.recordVideoButton.textContent='Record Video'; progress.textContent='';
}
