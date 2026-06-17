/* B"H */
export const recordingState = {
    isVideoRecording:false, videoStartTime:0, videoKeyDownMap:new Map(), videoWorker:null,
    audioChunks:[], mediaRecorder:null, mediaSession:null, mediaWriteChain:Promise.resolve(),
    isSheetRecording:false, sheetNotes:[], sheetRecordingStartTime:0, isTextRecording:false, textNotes:[]
};
export const getIsVideoRecording=()=>recordingState.isVideoRecording;
export const getVideoKeyDownMap=()=>recordingState.videoKeyDownMap;
export const setVideoWorker=worker=>{recordingState.videoWorker=worker;};
