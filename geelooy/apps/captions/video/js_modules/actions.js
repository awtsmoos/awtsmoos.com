/* B"H */
import { AppState } from './state.js';
import { DOM, CTX } from './config.js';
import { setStatus, updateUI, switchVisuals, showMobilePreview } from './ui.js';
import { getSettings, getCaptionData, prepareBitmaps } from './data.js';
import { sendMessage } from './worker_client.js';
import { processQueue } from './downloads.js';

// --- Message Router ---
export function handleWorkerMessage(e) {
    const { type, payload } = e.data;
    
    switch (type) {
        case 'WORKER_READY':
            setStatus('Ready.');
            AppState.status = 'IDLE';
            updateUI(AppState);
            // Trigger initial preview
            triggerPreview();
            break;
            
        case 'STATUS_UPDATE':
            setStatus(payload.message);
            break;
            
        case 'PROGRESS_UPDATE':
            if (DOM.progressBar) DOM.progressBar.style.width = `${payload.percent}%`;
            break;
            
        case 'PREVIEW_READY':
            if (CTX) {
                switchVisuals('canvas');
                CTX.clearRect(0,0, DOM.previewCanvas.width, DOM.previewCanvas.height);
                CTX.drawImage(payload.bitmap, 0, 0, DOM.previewCanvas.width, DOM.previewCanvas.height);
                payload.bitmap.close(); // Important!
            }
            if(AppState.status === 'PREVIEWING') {
                AppState.status = 'IDLE';
                setStatus('Preview Updated');
            }
            break;
            
        case 'VIDEO_COMPLETE':
            if (AppState.videoURL) URL.revokeObjectURL(AppState.videoURL);
            AppState.videoURL = URL.createObjectURL(payload.blob);
            if(DOM.outputVideo) DOM.outputVideo.src = AppState.videoURL;
            
            switchVisuals('video');
            showMobilePreview();
            
            AppState.status = 'IDLE';
            updateUI(AppState);
            setStatus('Render Complete', 'success');
            break;
            
        case 'IMAGE_COMPLETE':
            AppState.downloadQueue.push(payload);
            processQueue(AppState);
            break;
            
        case 'BATCH_COMPLETE':
            AppState.status = 'IDLE';
            updateUI(AppState);
            setStatus('Batch Complete', 'success');
            break;
            
        case 'FATAL_ERROR':
            setStatus(`Error: ${payload.message}`, 'error');
            AppState.status = 'IDLE';
            updateUI(AppState);
            break;
    }
}

// --- Action Triggers ---

export async function triggerRender() {
    if (AppState.status !== 'IDLE') return;
    AppState.status = 'RENDERING';
    updateUI(AppState);
    setStatus('Preparing Assets...');
    showMobilePreview(); // Show them progress
    switchVisuals('canvas'); // Show rendering frames

    try {
        const settings = getSettings();
        const data = await getCaptionData();
        const { bitmaps, transferables } = await prepareBitmaps();
        
        // Add Audio to transferables
        if(data.plainAudioBuffer) {
            data.plainAudioBuffer.channels.forEach(c => transferables.push(c.buffer));
        }

        const mode = DOM.renderMode.value;
        const dl = DOM.enableImageDownload.checked;
        const workerMode = (dl && mode === 'image') ? 'imageBatch' : mode;

        sendMessage('START_RENDER', {
            mode: workerMode,
            settings,
            resolution: { width: parseInt(DOM.videoWidth.value), height: parseInt(DOM.videoHeight.value) },
            captionData: data,
            portalBitmaps: bitmaps,
            plainAudioBuffer: data.plainAudioBuffer,
            fps: parseInt(DOM.frameRate.value)
        }, transferables);
        
    } catch(e) {
        console.error(e);
        setStatus("Prep Failed: " + e.message, 'error');
        AppState.status = 'IDLE';
        updateUI(AppState);
    }
}

export async function triggerPreview(manual = false) {
    if (AppState.status !== 'IDLE') return;
    AppState.status = 'PREVIEWING';
    
    if(manual) {
        showMobilePreview();
        switchVisuals('canvas');
    }

    // Set canvas resolution visually
    if(DOM.previewCanvas) {
        DOM.previewCanvas.width = parseInt(DOM.videoWidth.value);
        DOM.previewCanvas.height = parseInt(DOM.videoHeight.value);
    }

    try {
        const settings = getSettings();
        const { bitmaps, transferables } = await prepareBitmaps();
        
        // Default text if empty
        let prevText = DOM.mainCaptions.value.split(/\n\s*\n/)[0] || "PREVIEW TEXT";
        
        sendMessage('GENERATE_PREVIEW', {
            settings,
            resolution: { width: parseInt(DOM.videoWidth.value), height: parseInt(DOM.videoHeight.value) },
            primaryCaption: prevText,
            portalBitmaps: bitmaps
        }, transferables);
        
    } catch(e) {
        console.error(e);
        AppState.status = 'IDLE';
    }
}