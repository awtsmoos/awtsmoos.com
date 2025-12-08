/*
    ב"ה
    B"H
*/
import { dom, pCtx, setStatus, updateUIState } from './js_modules/ui_helpers.js';
import { getSettings, getCaptionData } from './js_modules/data_helpers.js';
import { initDB, saveSettings, loadSettings, savePreset, deletePreset, applyPreset } from './js_modules/storage_helpers.js';
import { processImageDownloadQueue } from './js_modules/download_helpers.js';

document.addEventListener('DOMContentLoaded', async function() {
    
    // --- App State ---
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
        // Debounce timer for auto-preview
        previewTimer: null 
    };

    // --- Worker Management ---
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
                triggerAutoPreview(); // Initial preview
                break;
            case 'STATUS_UPDATE':
                setStatus(payload.message);
                break;
            case 'PROGRESS_UPDATE':
                dom.progressContainer.style.display = 'block';
                dom.progressBar.style.width = `${payload.percent}%`;
                break;
            case 'PREVIEW_READY':
                // Draw logic
                pCtx.clearRect(0,0, dom.previewCanvas.width, dom.previewCanvas.height);
                pCtx.drawImage(payload.bitmap, 0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                payload.bitmap.close();
                
                // Only reset status if we are not in the middle of a render
                if(appState.appStatus === 'PREVIEWING') {
                    appState.appStatus = 'IDLE';
                    setStatus('Preview Updated.');
                }
                break;
            case 'VIDEO_COMPLETE':
                if (appState.currentVideoURL) URL.revokeObjectURL(appState.currentVideoURL);
                appState.currentVideoURL = URL.createObjectURL(payload.blob);
                dom.outputVideo.src = appState.currentVideoURL;
                dom.outputVideo.style.display = 'block';
                dom.previewCanvas.style.display = 'none';
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

    // --- Real-time Preview Logic ---
    function triggerAutoPreview() {
        // Debounce: Wait 300ms after last change
        if (appState.previewTimer) clearTimeout(appState.previewTimer);
        
        appState.previewTimer = setTimeout(() => {
            if (appState.appStatus === 'IDLE') {
                handlePreview();
            }
        }, 300);
    }

    // --- Action Handlers ---

    async function handleRender() {
        if (appState.appStatus !== 'IDLE') return;
        appState.appStatus = 'RENDERING';
        updateUIState(appState);
        setStatus('Preparing...');
        
        const settings = getSettings();
        const resolution = {
            width: parseInt(dom.videoWidth.value),
            height: parseInt(dom.videoHeight.value)
        };
        const mode = dom.renderMode.value;
        const enableImageDownload = dom.enableImageDownload.checked;
        const captionData = await getCaptionData(appState);

        // Prepare Bitmaps
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

    async function handlePreview() {
        if (appState.appStatus !== 'IDLE' && appState.appStatus !== 'PREVIEWING') return;
        
        // Don't change UI state to 'PREVIEWING' to avoid flickering buttons
        // Just set internal flag if needed, but worker handles it.
        appState.appStatus = 'PREVIEWING'; 
        
        const settings = getSettings();
        const resolution = { 
            width: parseInt(dom.videoWidth.value), 
            height: parseInt(dom.videoHeight.value) 
        };
        
        // Ensure canvas matches resolution aspect ratio visually
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

    // --- Init Listeners ---
    dom.renderButton.addEventListener('click', handleRender);
    dom.previewButton.addEventListener('click', handlePreview); // Manual refresh
    dom.cancelButton.addEventListener('click', () => {
        if(appState.worker) appState.worker.terminate();
        initializeWorker();
    });

    // AUTO-PREVIEW LISTENER
    // Listen to 'input' and 'change' on the whole controls wrapper
    // This catches everything: text typing, sliders dragging, checkboxes
    document.getElementById('controls').addEventListener('input', (e) => {
        saveSettings(appState); // Save while typing/dragging
        triggerAutoPreview();   // Trigger preview
        
        // Update slider values visually
        if(e.target.type === 'range') {
            const group = e.target.closest('.control-group') || e.target.closest('.slider-group');
            if(group) {
                const display = group.querySelector('.value-display');
                if(display) display.textContent = e.target.value;
            }
        }
    });
    
    // Checkboxes usually fire 'change' not 'input'
    document.getElementById('controls').addEventListener('change', (e) => {
        saveSettings(appState);
        updateUIState(appState);
        triggerAutoPreview();
    });

    // DB Actions
    dom.savePresetBtn.addEventListener('click', () => savePreset(appState));
    dom.deletePresetBtn.addEventListener('click', () => deletePreset(appState));
    dom.presetSelect.addEventListener('change', (e) => applyPreset(appState, e.target.value));
    
    // Directory Picker
    dom.selectDownloadFolderButton.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            appState.selectedDownloadDirectoryHandle = await window.showDirectoryPicker();
            dom.selectedDownloadFolderDisplay.textContent = "Folder Selected: " + appState.selectedDownloadDirectoryHandle.name;
        } else {
             alert("File System Access API not supported.");
        }
    });

    // Toggle Randomize UI
    document.getElementById('controls').addEventListener('click', (e) => {
        if(e.target.classList.contains('fieldset-randomize')) {
            // Randomize specific section logic here
            // For now, just trigger preview
            triggerAutoPreview();
        }
    });
    
    // Start
    await initDB(appState);
    await loadSettings(appState);
    initializeWorker();
    updateUIState(appState);
});