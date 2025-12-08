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
                setStatus('Engine Ready.');
                appState.appStatus = 'IDLE';
                updateUIState(appState);
                break;
            case 'STATUS_UPDATE':
                setStatus(payload.message);
                break;
            case 'PROGRESS_UPDATE':
                dom.progressContainer.style.display = 'block';
                dom.progressBar.style.width = `${payload.percent}%`;
                break;
            case 'PREVIEW_READY':
                pCtx.drawImage(payload.bitmap, 0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
                payload.bitmap.close();
                setStatus('Preview generated.', 'success');
                appState.appStatus = 'IDLE';
                updateUIState(appState);
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
        const transferables = workerBitmaps.filter(b => b); // Remove nulls
        
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
        if (appState.appStatus !== 'IDLE') return;
        appState.appStatus = 'PREVIEWING';
        setStatus('Previewing...');
        
        const settings = getSettings();
        const resolution = { 
            width: parseInt(dom.videoWidth.value), 
            height: parseInt(dom.videoHeight.value) 
        };
        
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
    dom.previewButton.addEventListener('click', handlePreview);
    dom.cancelButton.addEventListener('click', () => {
        if(appState.worker) appState.worker.terminate();
        initializeWorker();
    });

    // Inputs changing state
    dom.renderMode.addEventListener('change', () => updateUIState(appState));
    dom.enableImageDownload.addEventListener('change', () => updateUIState(appState));
    dom.captionSource.addEventListener('change', () => updateUIState(appState));
    
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
             alert("File System Access API not supported in this browser.");
        }
    });

    // Range Sliders display update
    document.getElementById('controls').addEventListener('input', (e) => {
        if(e.target.type === 'range') {
            const display = document.getElementById(e.target.id + 'Value');
            if(display) display.textContent = e.target.value;
        }
        saveSettings(appState);
    });

    // Randomize toggles logic
    document.querySelectorAll('.randomize-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.closest('.control-group').classList.toggle('randomize-active');
            this.classList.toggle('active');
            saveSettings(appState);
        });
    });
    
    document.getElementById('randomize-all-btn').addEventListener('click', () => {
         document.querySelectorAll('fieldset .randomize-toggle:not(.active)').forEach(t => t.click());
    });
    
    document.querySelectorAll('.fieldset-randomize').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('fieldset').querySelectorAll('.randomize-toggle:not(.active)').forEach(t => t.click());
        });
    });
    
    // SRT File reading
    dom.srtFile.addEventListener('change', async (e) => { 
        if(e.target.files[0]) appState.srtCaptions.main = await e.target.files[0].text(); 
        document.getElementById('srtPreview').value = appState.srtCaptions.main;
    });
    dom.translationSrtFile.addEventListener('change', async (e) => { 
        if(e.target.files[0]) appState.srtCaptions.translation = await e.target.files[0].text(); 
    });

    // Start
    await initDB(appState);
    await loadSettings(appState);
    initializeWorker();
    updateUIState(appState);
});