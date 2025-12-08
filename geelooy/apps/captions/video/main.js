/*
    ב"ה
    B"H
*/
import { dom, pCtx, setStatus, updateUIState, showPreviewPanel, hidePreviewPanel, showCanvas, showVideo } from './js_modules/ui_helpers.js';
import { getSettings, getCaptionData } from './js_modules/data_helpers.js';
import { initDB, saveSettings, loadSettings, savePreset, deletePreset, applyPreset } from './js_modules/storage_helpers.js';
import { processImageDownloadQueue } from './js_modules/download_helpers.js';

document.addEventListener('DOMContentLoaded', async function() {
    
    // ... (appState remains same)
    const appState = {
        appStatus: 'IDLE',
        worker: null,
        db: null,
        bgImageBitmap: null,
        portalImageBitmaps: [],
        simpleCaptions: { main: '', translation: '' },
        srtCaptions: { main: '', translation: '' },
        currentVideoURL: null,
        selectedDownloadDirectoryHandle: null,
        imageDownloadQueue: [],
        isDownloadingImages: false,
        processedCount: 0,
        previewTimer: null 
    };

    // ... (initializeWorker remains same)
    function initializeWorker() {
        if (appState.worker) appState.worker.terminate();
        try {
            appState.worker = new Worker('ein_sof_worker.js');
            appState.worker.onmessage = handleWorkerMessage;
            appState.worker.onerror = (err) => {
                console.error("Worker Error:", err);
                setStatus(`Engine Error: ${err.message}`, 'error');
                appState.appStatus = 'IDLE';
            };
        } catch (e) {
             setStatus('FATAL: Engine Init Failed.', 'error');
        }
    }

    function handleWorkerMessage(event) {
        const { type, payload } = event.data;
        switch (type) {
            case 'WORKER_READY':
                setStatus('Ready.');
                appState.appStatus = 'IDLE';
                updateUIState(appState);
                triggerAutoPreview(); 
                break;
            case 'STATUS_UPDATE':
                setStatus(payload.message);
                break;
            case 'PROGRESS_UPDATE':
                dom.progressContainer.style.display = 'block';
                dom.progressBar.style.width = `${payload.percent}%`;
                break;
            case 'PREVIEW_READY':
                showCanvas(); // Ensure canvas is visible
                pCtx.clearRect(0,0, dom.previewCanvas.width, dom.previewCanvas.height);
                pCtx.drawImage(payload.bitmap, 0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                payload.bitmap.close();
                
                if(appState.appStatus === 'PREVIEWING') {
                    appState.appStatus = 'IDLE';
                    setStatus('Preview Updated.');
                }
                break;
            case 'VIDEO_COMPLETE':
                if (appState.currentVideoURL) URL.revokeObjectURL(appState.currentVideoURL);
                appState.currentVideoURL = URL.createObjectURL(payload.blob);
                
                dom.outputVideo.src = appState.currentVideoURL;
                
                showVideo(); // Switch to Video Mode
                showPreviewPanel(); // Force open panel on mobile
                
                dom.progressContainer.style.display = 'none';
                setStatus('Render Complete.', 'success');
                appState.appStatus = 'IDLE';
                updateUIState(appState);
                break;
            case 'IMAGE_COMPLETE':
                appState.imageDownloadQueue.push(payload);
                processImageDownloadQueue(appState);
                break;
            case 'BATCH_COMPLETE':
                setStatus('Batch Finished.', 'success');
                dom.progressContainer.style.display = 'none';
                appState.appStatus = 'IDLE';
                updateUIState(appState);
                break;
            case 'FATAL_ERROR':
                setStatus(`Error: ${payload.message}`, 'error');
                appState.appStatus = 'IDLE';
                updateUIState(appState);
                break;
        }
    }

    // --- Real-time Preview ---
    function triggerAutoPreview() {
        if (appState.previewTimer) clearTimeout(appState.previewTimer);
        // Longer debounce on mobile to prevent lag while typing
        const delay = (window.innerWidth < 900) ? 600 : 300;
        appState.previewTimer = setTimeout(() => {
            if (appState.appStatus === 'IDLE') {
                // On mobile, we DO update the preview logic, but we DON'T force the panel open.
                // We just render silently to the canvas so when they click "Preview", it's ready.
                handlePreview(false); 
            }
        }, delay);
    }

    // --- Actions ---

    async function handleRender() {
        if (appState.appStatus !== 'IDLE') return;
        appState.appStatus = 'RENDERING';
        updateUIState(appState);
        setStatus('Preparing...');
        
        // Force Open Panel so they see progress
        showPreviewPanel();
        showCanvas(); // Show canvas while rendering frames
        
        const settings = getSettings();
        const resolution = {
            width: parseInt(dom.videoWidth.value),
            height: parseInt(dom.videoHeight.value)
        };
        const mode = dom.renderMode.value;
        const enableImageDownload = dom.enableImageDownload.checked;
        const captionData = await getCaptionData(appState);

        const bgFile = dom.backgroundImageInput.files[0];
        const portalFiles = Array.from(dom.portalImagesInput.files);
        
        let freshBgBitmap = null;
        if (bgFile) freshBgBitmap = await createImageBitmap(bgFile);
        
        let freshPortalBitmaps = [];
        if (portalFiles.length > 0) {
            freshPortalBitmaps = await Promise.all(portalFiles.map(f => createImageBitmap(f)));
        }

        const workerBitmaps = [freshBgBitmap, ...freshPortalBitmaps];
        const transferables = workerBitmaps.filter(b => b); 
        
        const transferableObjects = [...transferables];
        if (captionData.plainAudioBuffer) {
            captionData.plainAudioBuffer.channels.forEach(c => transferableObjects.push(c.buffer));
        }

        appState.worker.postMessage({
            type: 'START_RENDER',
            payload: {
                mode: (enableImageDownload && mode === 'image') ? 'imageBatch' : mode,
                settings,
                resolution,
                captionData,
                portalBitmaps: workerBitmaps,
                plainAudioBuffer: captionData.plainAudioBuffer,
                fps: parseInt(dom.frameRate.value)
            }
        }, transferableObjects);
    }

    // forcePanel param: boolean, whether to slide up the mobile sheet
    async function handlePreview(forcePanel = true) {
        if (appState.appStatus !== 'IDLE' && appState.appStatus !== 'PREVIEWING') return;
        appState.appStatus = 'PREVIEWING';
        
        if (forcePanel) {
            showPreviewPanel();
            showCanvas();
        }
        
        const settings = getSettings();
        const resolution = { 
            width: parseInt(dom.videoWidth.value), 
            height: parseInt(dom.videoHeight.value) 
        };
        
        dom.previewCanvas.width = resolution.width;
        dom.previewCanvas.height = resolution.height;

        const bgFile = dom.backgroundImageInput.files[0];
        const portalFiles = Array.from(dom.portalImagesInput.files);
        
        let freshBgBitmap = null;
        if (bgFile) freshBgBitmap = await createImageBitmap(bgFile);
        
        let freshPortalBitmaps = [];
        if (portalFiles.length > 0) {
            freshPortalBitmaps = await Promise.all(portalFiles.map(f => createImageBitmap(f)));
        }
        
        const workerBitmaps = [freshBgBitmap, ...freshPortalBitmaps];
        const transferables = workerBitmaps.filter(b => b);

        appState.worker.postMessage({
            type: 'GENERATE_PREVIEW',
            payload: {
                settings,
                resolution,
                primaryCaption: (dom.mainCaptions.value.split('\n')[0] || 'Preview Text'),
                portalBitmaps: workerBitmaps
            }
        }, transferables);
    }

    // --- Listeners ---
    dom.renderButton.addEventListener('click', handleRender);
    
    // Manual "Preview" Button - Forces panel open
    dom.previewButton.addEventListener('click', () => handlePreview(true));
    
    // Close Mobile Preview
    dom.mobileCloseBtn.addEventListener('click', hidePreviewPanel);

    dom.cancelButton.addEventListener('click', () => {
        if(appState.worker) appState.worker.terminate();
        initializeWorker();
        hidePreviewPanel();
    });

    document.getElementById('controls').addEventListener('input', (e) => {
        saveSettings(appState); 
        triggerAutoPreview();   
        
        if(e.target.type === 'range') {
            const group = e.target.closest('.control-group') || e.target.closest('.slider-group');
            if(group) {
                const display = group.querySelector('.value-display');
                if(display) display.textContent = e.target.value;
            }
        }
    });
    
    document.getElementById('controls').addEventListener('change', (e) => {
        saveSettings(appState);
        updateUIState(appState);
        triggerAutoPreview();
    });

    // DB & File Init
    dom.savePresetBtn.addEventListener('click', () => savePreset(appState));
    dom.deletePresetBtn.addEventListener('click', () => deletePreset(appState));
    dom.presetSelect.addEventListener('change', (e) => applyPreset(appState, e.target.value));
    
    dom.selectDownloadFolderButton.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            appState.selectedDownloadDirectoryHandle = await window.showDirectoryPicker();
            dom.selectedDownloadFolderDisplay.textContent = "Selected: " + appState.selectedDownloadDirectoryHandle.name;
        } else {
             alert("Not supported on this browser.");
        }
    });

    // Start
    await initDB(appState);
    await loadSettings(appState);
    initializeWorker();
    updateUIState(appState);
});