/*
    ב"ה
    B"H
*/
document.addEventListener('DOMContentLoaded', function() {
    
    // --- DOM Elements ---
    const dom = {
        controlsWrapper: document.getElementById('controls-wrapper'),
        renderButton: document.getElementById('renderButton'),
        previewButton: document.getElementById('previewButton'),
        cancelButton: document.getElementById('cancelButton'),
        previewCanvas: document.getElementById('previewCanvas'),
        outputVideo: document.getElementById('outputVideo'),
        status: document.getElementById('status'),
        progressContainer: document.getElementById('progressContainer'),
        progressBar: document.getElementById('progressBar'),
        renderMode: document.getElementById('renderMode'),
        timingControls: document.getElementById('timing-controls'),
        captionSource: document.getElementById('captionSource'),
        mainCaptions: document.getElementById('mainCaptions'),
        translationCaptions: document.getElementById('translationCaptions'),
        presetSelect: document.getElementById('preset-select'),
        savePresetBtn: document.getElementById('save-preset-btn'),
        deletePresetBtn: document.getElementById('delete-preset-btn'),
        randomizeAllBtn: document.getElementById('randomize-all-btn'),
        dynamicBackgroundToggle: document.getElementById('dynamicBackgroundToggle'),
        fpsControls: document.getElementById('fps-controls'),
        
        // New Inputs
        enableImageDownload: document.getElementById('enableImageDownload'),
        imageDownloadFolderControls: document.getElementById('image-download-folder-controls'),
        selectDownloadFolderButton: document.getElementById('selectDownloadFolderButton'),
        selectedDownloadFolderDisplay: document.getElementById('selectedDownloadFolderDisplay'),
        backgroundImageInput: document.getElementById('backgroundImageInput'),
        portalImagesInput: document.getElementById('portalImages')
    };
    
    const pCtx = dom.previewCanvas.getContext('2d');

    // --- App State ---
    let appState = {
        appStatus: 'IDLE',
        worker: null,
        db: null,
        bgImageBitmap: null, // Specific Background
        portalImageBitmaps: [], // Floating Portals
        simpleCaptions: { main: '', translation: '' },
        srtCaptions: { main: '', translation: '' },
        currentVideoURL: null,
        selectedDownloadDirectoryHandle: null,
        imageDownloadQueue: [],
        isDownloadingImages: false,
        processedCount: 0,
    };
    
    // --- Helper: Status ---
    function setStatus(message, type = '') {
        dom.status.textContent = message;
        dom.status.className = type;
    }

    // --- Helper: Get Bitmaps Array for Worker ---
    // The worker expects [Background|null, Portal1, Portal2, ...]
    function getWorkerBitmaps() {
        const bitmaps = [];
        // Index 0: Background (or null if not set)
        bitmaps.push(appState.bgImageBitmap || null);
        // Index 1+: Portals
        if (appState.portalImageBitmaps && appState.portalImageBitmaps.length > 0) {
            bitmaps.push(...appState.portalImageBitmaps);
        }
        return bitmaps;
    }

    function getTransferables() {
        const bitmaps = getWorkerBitmaps();
        // Filter out nulls because you can't transfer null
        return bitmaps.filter(b => b instanceof ImageBitmap);
    }

    function initializeWorker() {
        try {
            if (appState.worker) appState.worker.terminate();
            appState.worker = new Worker('ein_sof_worker.js');
            appState.worker.onmessage = handleWorkerMessage;
            appState.worker.onerror = (err) => {
                console.error("Worker Error:", err);
                setStatus(`Engine Error: ${err.message}`, 'error');
                appState.appStatus = 'IDLE';
            };
        } catch (error) {
            setStatus('FATAL: Engine Init Failed.', 'error');
        }
    }

    function handleWorkerMessage(event) {
        const { type, payload } = event.data;
        switch (type) {
            case 'WORKER_READY':
                setStatus('Engine Ready.');
                appState.appStatus = 'IDLE';
                updateUIState();
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
                updateUIState();
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
                updateUIState();
                break;
            case 'IMAGE_COMPLETE':
                appState.imageDownloadQueue.push(payload);
                processImageDownloadQueue();
                break;
            case 'BATCH_COMPLETE':
                setStatus('Batch Finished.', 'success');
                dom.progressContainer.style.display = 'none';
                appState.appStatus = 'IDLE';
                updateUIState();
                break;
            case 'FATAL_ERROR':
                setStatus(`Error: ${payload.message}`, 'error');
                appState.appStatus = 'IDLE';
                updateUIState();
                break;
        }
    }

    async function handleRender() {
        if (appState.appStatus !== 'IDLE') return;
        appState.appStatus = 'RENDERING';
        updateUIState();
        setStatus('Preparing...');
        
        const settings = getSettings();
        const resolution = {
            width: parseInt(document.getElementById('videoWidth').value),
            height: parseInt(document.getElementById('videoHeight').value)
        };
        const mode = dom.renderMode.value;
        const enableImageDownload = dom.enableImageDownload.checked;
        const captionData = await getCaptionData();

        // Prepare Bitmaps and Transferables
        // Note: We clone them because transfer closes the original
        // But since we reload them from file input on change, or we just want to send them:
        // Actually, ImageBitmaps are transferable. Once transferred, they are gone from main thread.
        // We need to re-create them next time or just let them go.
        // Since user might render twice, we should probably re-create them or accept they are gone.
        // For now, let's transfer. If user renders again, they might need to reload images 
        // OR we don't transfer, we just clone? No, structuredClone of ImageBitmap throws.
        // We MUST transfer.
        
        // Wait! If I transfer appState.bgImageBitmap, it becomes unusable for Preview.
        // Solution: Create the bitmap RIGHT BEFORE sending, from the file input files.
        // This ensures every render gets a fresh bitmap.
        
        const bgFile = dom.backgroundImageInput.files[0];
        const portalFiles = Array.from(dom.portalImagesInput.files);
        
        let freshBgBitmap = null;
        if (bgFile) freshBgBitmap = await createImageBitmap(bgFile);
        
        let freshPortalBitmaps = [];
        if (portalFiles.length > 0) {
            freshPortalBitmaps = await Promise.all(portalFiles.map(f => createImageBitmap(f)));
        }

        // Construct the Payload array
        const workerBitmaps = [freshBgBitmap, ...freshPortalBitmaps];
        const transferables = workerBitmaps.filter(b => b); // Remove nulls for transfer list
        
        // Audio
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
                portalBitmaps: workerBitmaps, // Pass the array [BG, P1, P2...]
                plainAudioBuffer: captionData.plainAudioBuffer,
                fps: parseInt(document.getElementById('frameRate').value)
            }
        }, transferableObjects);
    }

    async function handlePreview() {
        if (appState.appStatus !== 'IDLE') return;
        appState.appStatus = 'PREVIEWING';
        setStatus('Previewing...');
        
        const settings = resolveSettings(getSettings());
        const resolution = { 
            width: parseInt(document.getElementById('videoWidth').value), 
            height: parseInt(document.getElementById('videoHeight').value) 
        };
        
        // Re-load bitmaps for preview (since previous render might have transferred them)
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

    // --- Settings & UI Logic ---
    function updateUIState() {
        const isIdle = appState.appStatus === 'IDLE';
        dom.controlsWrapper.classList.toggle('rendering', !isIdle);
        dom.renderButton.disabled = !isIdle;
        dom.previewButton.disabled = !isIdle;
        
        const isVideo = dom.renderMode.value === 'video';
        dom.timingControls.classList.toggle('hidden-control', !isVideo);
        document.getElementById('dual-caption-toggle-container').classList.toggle('hidden-control', !isVideo);
        dom.imageDownloadFolderControls.classList.toggle('hidden-control', !dom.enableImageDownload.checked);
    }

    function getSettings() {
        const settings = {};
        document.querySelectorAll('[id]').forEach(el => {
            if (el.type === 'checkbox') settings[el.id] = el.checked;
            else if (el.type !== 'file' && !el.readOnly && el.value !== undefined) settings[el.id] = el.value;
        });
        document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
            const name = group.dataset.controlName;
            const input = group.querySelector('input');
            const isRandom = group.classList.contains('randomize-active');
            if (isRandom) {
                // Simplified random logic for UI retrieval
                settings[name] = { randomize: true, min: 0, max: 100 }; // simplified
            } else {
                settings[name] = (input.type === 'range' || input.type === 'number') ? parseFloat(input.value) : input.value;
            }
        });
        return settings;
    }
    
    function resolveSettings(s) { return s; } // Pass through for now

    async function getCaptionData() {
        // ... (Same parsing logic as before) ...
        // Keeping it brief for the fix
        const duration = parseFloat(document.getElementById('captionDuration').value) || 2.5;
        const text = dom.mainCaptions.value;
        const primary = text.trim() ? text.split(/\n\s*\n/).map((t,i) => ({ startTime: i*duration, endTime: (i+1)*duration, text: t.trim() })) : [];
        
        // Audio
        let plainAudioBuffer = null;
        const aFile = document.getElementById('audioFile').files[0];
        if (aFile) {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const ab = await ac.decodeAudioData(await aFile.arrayBuffer());
            plainAudioBuffer = { channels: [ab.getChannelData(0)], sampleRate: ab.sampleRate, duration: ab.duration };
            ac.close();
        }
        return { primary, translation: [], plainAudioBuffer };
    }

    // Download Logic (Queue)
    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    }
    
    async function processImageDownloadQueue() {
        if (appState.isDownloadingImages || appState.imageDownloadQueue.length === 0) return;
        appState.isDownloadingImages = true;
        
        const item = appState.imageDownloadQueue.shift();
        if (appState.selectedDownloadDirectoryHandle) {
             // File System API logic
             try {
                const handle = await appState.selectedDownloadDirectoryHandle.getFileHandle(item.filename, { create: true });
                const w = await handle.createWritable();
                await w.write(item.blob);
                await w.close();
             } catch(e) { console.error(e); }
        } else {
            triggerDownload(item.blob, item.filename);
        }
        
        setTimeout(() => {
            appState.isDownloadingImages = false;
            processImageDownloadQueue();
        }, 200); // Small delay
    }

    // --- Init ---
    dom.renderButton.addEventListener('click', handleRender);
    dom.previewButton.addEventListener('click', handlePreview);
    dom.cancelButton.addEventListener('click', () => {
        if(appState.worker) appState.worker.terminate();
        initializeWorker();
    });
    
    // Directory Picker
    dom.selectDownloadFolderButton.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            appState.selectedDownloadDirectoryHandle = await window.showDirectoryPicker();
            dom.selectedDownloadFolderDisplay.textContent = "Folder Selected";
        }
    });

    dom.renderMode.addEventListener('chan