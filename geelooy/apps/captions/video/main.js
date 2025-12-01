/*
    ב"ה
    B"H
    */
    document.addEventListener('DOMContentLoaded', function() {
        /*
        ב"ה
        B"H
        */

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
            regenBgControls: document.getElementById('regen-bg-controls'),
            // Inside your existing 'const dom = { ... }' block
    enableImageDownload: document.getElementById('enableImageDownload'),
    imageDownloadFolderControls: document.getElementById('image-download-folder-controls'),
    selectDownloadFolderButton: document.getElementById('selectDownloadFolderButton'),
    selectedDownloadFolderDisplay: document.getElementById('selectedDownloadFolderDisplay'),
        };
        const pCtx = dom.previewCanvas.getContext('2d');

        // --- App State ---
        let appState = {
            appStatus: 'INITIALIZING', // INITIALIZING, IDLE, RENDERING, PREVIEWING
            worker: null,
            db: null,
            portalImageBitmaps: [],
            simpleCaptions: { main: '', translation: '' },
            srtCaptions: { main: '', translation: '' },
            currentVideoURL: null,
        // Inside your existing 'let appState = { ... }' block
    selectedDownloadDirectoryHandle: null,
    imageDownloadQueue: [],
    isDownloadingImages: false,
        };
        
        // --- Core Functions ---
        
        function setStatus(message, type = '') {
            /*
            ב"ה
            B"H
            */
            dom.status.textContent = message;
            dom.status.className = type;
        }

        function updateUIState() {
            /*
            ב"ה
            B"H
            */
            const isRendering = appState.appStatus === 'RENDERING';
            const isIdle = appState.appStatus === 'IDLE';

            dom.controlsWrapper.classList.toggle('rendering', isRendering);
            
            let hasCaptions = false;
            if (dom.renderMode.value === 'image' || dom.captionSource.value === 'simple') {
                hasCaptions = dom.mainCaptions.value.trim().length > 0;
            } else { // Video + SRT
                hasCaptions = appState.srtCaptions.main.trim().length > 0;
            }
            
            const width = parseInt(document.getElementById('videoWidth').value);
            const height = parseInt(document.getElementById('videoHeight').value);
            const canRender = width > 0 && height > 0 && width % 2 === 0 && height % 2 === 0 && hasCaptions;

            dom.renderButton.disabled = !isIdle || !canRender;
            dom.previewButton.disabled = !isIdle || !canRender;

            if (isIdle) {
                if (!canRender && hasCaptions) setStatus('Width/Height must be even numbers.', 'warning');
                else if (!hasCaptions) setStatus('Please provide captions to render.', 'warning');
                else setStatus('Awaiting Command.', '');
            }

            // Show/hide FPS controls based on dynamic background toggle
            const isVideo = dom.renderMode.value === 'video';
            const isDynamicBg = dom.dynamicBackgroundToggle.checked;
            dom.fpsControls.style.display = isVideo && isDynamicBg ? 'block' : 'none';
        }

        function initializeWorker() {
            /*
            ב"ה
            B"H
            */
            try {
                appState.worker = new Worker('ein_sof_worker.js');
                appState.worker.onmessage = handleWorkerMessage;
                appState.worker.onerror = (err) => {
                    console.error("Unhandled Worker Error:", err);
                    setStatus(`Critical Worker Error: ${err.message}`, 'error');
                    appState.appStatus = 'IDLE';
                    updateUIState();
                };
            } catch (error) {
                console.error("Failed to initialize worker:", error);
                setStatus('FATAL: Could not load render engine.', 'error');
                dom.renderButton.disabled = true;
                dom.previewButton.disabled = true;
            }
        }

        // REPLACE your entire existing `function handleWorkerMessage(event) { ... }`
function handleWorkerMessage(event) {
    /* ב"ה B"H */
    const { type, payload } = event.data;

    switch (type) {
        case 'WORKER_READY':
            setStatus('Engine ready. Awaiting command.');
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
            if (appState.currentVideoURL) {
                URL.revokeObjectURL(appState.currentVideoURL);
            }
            appState.currentVideoURL = URL.createObjectURL(payload.blob);
            dom.outputVideo.src = appState.currentVideoURL;
            dom.outputVideo.style.display = 'block';
            dom.previewCanvas.style.display = 'none';
            dom.progressContainer.style.display = 'none';
            setStatus('Render complete.', 'success');
            appState.appStatus = 'IDLE';
            updateUIState();
            if (appState.imageDownloadQueue.length > 0) {
                processImageDownloadQueue();
            }
            break;
        case 'IMAGE_COMPLETE':
            const { blob, filename } = payload;
            appState.imageDownloadQueue.push({ blob, filename });
            if (!appState.isDownloadingImages) {
                processImageDownloadQueue();
            }
            break;
        case 'BATCH_COMPLETE':
            setStatus('Image batch processing finished.', 'success');
            dom.progressContainer.style.display = 'none';
            appState.appStatus = 'IDLE';
            updateUIState();
            if (appState.imageDownloadQueue.length > 0) {
                processImageDownloadQueue();
            }
            break;
        case 'FATAL_ERROR':
            console.error('Error from worker:', payload);
            setStatus(`Render Failed: ${payload.message}`, 'error');
            dom.progressContainer.style.display = 'none';
            appState.appStatus = 'IDLE';
            updateUIState();
            break;
    }
}
        
        // --- Event Handlers ---

        // REPLACE your entire existing `async function handleRender() { ... }`
async function handleRender() {
    /* ב"ה B"H */
    if (appState.appStatus !== 'IDLE') return;

    appState.appStatus = 'RENDERING';
    updateUIState();
    setStatus('Preparing render...');
    dom.outputVideo.style.display = 'none';
    dom.previewCanvas.style.display = 'block';

    const settings = getSettings();
    const resolution = {
        width: parseInt(document.getElementById('videoWidth').value),
        height: parseInt(document.getElementById('videoHeight').value)
    };
    const mode = dom.renderMode.value;
    const enableImageDownload = dom.enableImageDownload.checked;

    const captionData = await getCaptionData();
    if ((mode === 'video' || enableImageDownload) && captionData.primary.length === 0) {
        setStatus('No valid captions found for video or image batch.', 'error');
        appState.appStatus = 'IDLE';
        updateUIState();
        return;
    }

    let workerRenderMode = mode;
    if (enableImageDownload && mode === 'image') {
        workerRenderMode = 'imageBatch';
    }

    const transferableObjects = appState.portalImageBitmaps ? [...appState.portalImageBitmaps] : [];
    if (captionData.plainAudioBuffer) {
        captionData.plainAudioBuffer.channels.forEach(channel => {
            transferableObjects.push(channel.buffer);
        });
    }

    appState.worker.postMessage({
        type: 'START_RENDER',
        payload: {
            mode: workerRenderMode,
            settings,
            resolution,
            captionData,
            portalBitmaps: appState.portalImageBitmaps,
            plainAudioBuffer: captionData.plainAudioBuffer,
            isDynamic: dom.dynamicBackgroundToggle.checked,
            fps: parseInt(document.getElementById('frameRate').value),
            enableImageDownload: enableImageDownload
        }
    }, transferableObjects);

    appState.portalImageBitmaps = [];
}

            

        async function handlePreview() {
            /*
            ב"ה
            B"H
            */
            if (appState.appStatus !== 'IDLE') return;

            appState.appStatus = 'PREVIEWING';
            setStatus('Generating quick preview...');
            updateUIState();
            dom.outputVideo.style.display = 'none';
            dom.previewCanvas.style.display = 'block';

            const settings = resolveSettings(getSettings());
            const resolution = { 
                width: parseInt(document.getElementById('videoWidth').value), 
                height: parseInt(document.getElementById('videoHeight').value) 
            };
            const primaryCaption = (dom.mainCaptions.value.split(/\n\s*\n/)[0] || 'PREVIEW').trim();
            
            // Transfer ownership
            const transferableObjects = appState.portalImageBitmaps ? [...appState.portalImageBitmaps] : [];

            appState.worker.postMessage({
                type: 'GENERATE_PREVIEW',
                payload: {
                    settings,
                    resolution,
                    primaryCaption,
                    portalBitmaps: appState.portalImageBitmaps,
                }
            }, transferableObjects);
            
            appState.portalImageBitmaps = [];
        }

        function handleCancel() {
             /*
            ב"ה
            B"H
            */
            if (appState.appStatus !== 'RENDERING') return;
            // Terminate the current worker. It's the simplest and most reliable way to stop.
            appState.worker.terminate();
            // Start a new one for the next job.
            initializeWorker();
            setStatus('Render canceled by user.', 'warning');
            dom.progressContainer.style.display = 'none';
            // State will be set to IDLE by the new worker's 'WORKER_READY' message
        }

        // --- Data & Settings Management ---

        // REPLACE your entire existing `function getSettings() { ... }`
function getSettings() {
    /* ב"ה B"H */
    const settings = {};
    document.querySelectorAll('.control-group[data-control-name]').forEach(group => { const name = group.dataset.controlName; const mainInput = group.querySelector('input, select, textarea'); const isRandom = group.classList.contains('randomize-active'); settings[name] = { randomize: isRandom }; if (isRandom) { if (mainInput.type === 'color') { settings[name].type = 'color'; } else { settings[name].min = parseFloat(group.querySelector('.rand-min').value); settings[name].max = parseFloat(group.querySelector('.rand-max').value); settings[name].isFloat = mainInput.step && parseFloat(mainInput.step) < 1; } } else { settings[name].value = mainInput.type === 'range' ? parseFloat(mainInput.value) : mainInput.value; } });
    ['headerText', 'particleChars', 'networkType', 'enableVignette', 'enableFilmGrain', 'regenerateBgToggle', 'randomizeBoxColorToggle', 'enableLensDirt', 'enableDataCorruption', 'enableLensflare', 'enableGodRays', 'enableInterference', 'enableLightLeaks', 'enableCRTCurvature', 'enableChromaticAberration', 'enableScanLines', 'enableRgbShift', 'enableDustAndScratches', 'enableImageDownload'].forEach(id => {
        const el = document.getElementById(id);
        if (el) settings[id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return settings;
}
        
        function resolveSettings(settings, isStatic = true) {
             /*
            ב"ה
            B"H
            */
            const resolved = {};
            for (const key in settings) {
                const setting = settings[key];
                if (setting && typeof setting === 'object' && setting.randomize) {
                    if (setting.type === 'color') { resolved[key] = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6); } 
                    else { const min = Math.min(setting.min, setting.max); const max = Math.max(setting.min, setting.max); resolved[key] = setting.isFloat ? (min + Math.random() * (max - min)) : Math.floor(min + Math.random() * (max - min + 1)); }
                } else { resolved[key] = (setting && typeof setting === 'object') ? setting.value : setting; }
            }
            if (!isStatic) {
                resolved.time = Date.now();
            }
            return resolved;
        }

        async function getCaptionData() {
            /*
            ב"ה
            B"H
            */
            const parseSimple = (text) => text.trim() ? text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean) : [];
            const parseSRT = (srt) => { const caps = []; if(!srt) return []; srt.trim().replace(/\r/g, '').split(/\n\n/).forEach(b => { const l = b.split('\n'); if(l.length < 2) return; const m = l[1]?.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/); const t = l.slice(2).join('\n').trim(); if (m&&t){ const p = (h,m,s,ms) => parseInt(h,10)*3600+parseInt(m,10)*60+parseInt(s,10)+parseInt(ms,10)/1000; caps.push({startTime:p(m[1],m[2],m[3],m[4]), endTime:p(m[5],m[6],m[7],m[8]), text:t});}}); return caps; };
            const simpleToTimed = (text, duration) => parseSimple(text).map((t, i) => ({ startTime: i * duration, endTime: (i + 1) * duration, text: t }));
            
            let primary = [], translation = [];
            
            if (dom.captionSource.value === 'srt') {
                primary = parseSRT(appState.srtCaptions.main);
                if (document.getElementById('dualCaptionToggle').checked) translation = parseSRT(appState.srtCaptions.translation);
            } else {
                const duration = parseFloat(document.getElementById('captionDuration').value);
                primary = simpleToTimed(dom.mainCaptions.value, duration);
                if (document.getElementById('dualCaptionToggle').checked) translation = simpleToTimed(dom.translationCaptions.value, duration);
            }
            
            // *** FIX HERE: Deconstruct AudioBuffer into a transferable format ***
            let plainAudioBuffer = null;
            const audioFile = document.getElementById('audioFile').files[0];
            if (audioFile) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(await audioFile.arrayBuffer());
                
                const channels = [];
                for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                    channels.push(audioBuffer.getChannelData(i));
                }
                
                plainAudioBuffer = {
                    channels,
                    length: audioBuffer.length,
                    sampleRate: audioBuffer.sampleRate,
                    numberOfChannels: audioBuffer.numberOfChannels,
                    duration: audioBuffer.duration
                };
                
                audioContext.close();
            }

            return { primary, translation, plainAudioBuffer };
        }

        // --- UI Setup & Helpers ---
        function setupUI() {
            /*
            ב"ה
            B"H
            */
            function updateUIMode() {
                const isVideo = dom.renderMode.value === 'video';
                dom.previewCanvas.style.display = 'block'; dom.outputVideo.style.display = 'none';
                if (appState.currentVideoURL) { URL.revokeObjectURL(appState.currentVideoURL); appState.currentVideoURL = null; }
                dom.timingControls.classList.toggle('hidden-control', !isVideo);
                dom.regenBgControls.classList.toggle('hidden-control', isVideo && !dom.dynamicBackgroundToggle.checked);
                document.getElementById('dual-caption-toggle-container').classList.toggle('hidden-control', !isVideo);
                updateCaptionMode();
                dom.renderButton.textContent = isVideo ? 'R E N D E R  V I D E O' : 'G E N E R A T E  I M A G E S';
                updateUIState();
            }
            function updateCaptionMode() {
                const isSrt = dom.captionSource.value === 'srt';
                document.getElementById('simple-caption-controls').classList.toggle('hidden-control', isSrt);
                document.getElementById('srt-caption-controls').classList.toggle('hidden-control', !isSrt);
                document.getElementById('simple-timing-controls').classList.toggle('hidden-control', isSrt);
                document.getElementById('translation-controls').classList.toggle('hidden-control', isSrt);
                if (isSrt) {
                    appState.simpleCaptions.main = dom.mainCaptions.value;
                    appState.simpleCaptions.translation = dom.translationCaptions.value;
                    dom.mainCaptions.value = ''; dom.translationCaptions.value = '';
                } else {
                    dom.mainCaptions.value = appState.simpleCaptions.main;
                    dom.translationCaptions.value = appState.simpleCaptions.translation;
                }
                updateUIState();
            }

            dom.renderButton.addEventListener('click', handleRender);
            dom.previewButton.addEventListener('click', handlePreview);
            dom.cancelButton.addEventListener('click', handleCancel);
            dom.renderMode.addEventListener('change', updateUIMode);
            dom.captionSource.addEventListener('change', updateCaptionMode);
            dom.dynamicBackgroundToggle.addEventListener('change', () => {
                const isVideo = dom.renderMode.value === 'video';
                dom.regenBgControls.classList.toggle('hidden-control', isVideo && !dom.dynamicBackgroundToggle.checked);
                updateUIState();
            });
            document.getElementById('controls').addEventListener('input', () => { updateUIState(); saveSettings(); });
            document.getElementById('portalImages').addEventListener('change', async (e) => {
                const files = Array.from(e.target.files); if (files.length === 0) return; setStatus(`Processing ${files.length} images...`);
                try {
                    appState.portalImageBitmaps = await Promise.all(files.map(file => createImageBitmap(file))); setStatus(`Loaded ${files.length} images.`, 'success');
                } catch(err) {
                    setStatus(`Error loading images: ${err.message}`, 'error');
                }
            });
            document.getElementById('srtFile').addEventListener('change', async (e) => { const file = e.target.files[0]; if (!file) return; try { const text = await file.text(); appState.srtCaptions.main = text; document.getElementById('srtPreview').value = text; updateUIState(); } catch (e) { setStatus(`Error reading SRT: ${e.message}`, 'error'); } });
            document.getElementById('translationSrtFile').addEventListener('change', async (e) => { const file = e.target.files[0]; if (!file) return; try { const text = await file.text(); appState.srtCaptions.translation = text; document.getElementById('translationSrtPreview').value = text; updateUIState(); } catch (e) { setStatus(`Error reading SRT: ${e.message}`, 'error'); } });
            document.querySelectorAll('input[type="range"]').forEach(slider => { const display = document.getElementById(slider.id + 'Value'); if (display) { slider.addEventListener('input', () => { display.textContent = slider.value; }); } });
            document.querySelectorAll('.randomize-toggle').forEach(toggle => { toggle.addEventListener('click', function() { this.closest('.control-group').classList.toggle('randomize-active'); this.classList.toggle('active'); saveSettings(); }); });
            document.querySelectorAll('.fieldset-randomize').forEach(btn => { btn.addEventListener('click', () => { btn.closest('fieldset').querySelectorAll('.randomize-toggle:not(.active)').forEach(t => t.click()); }); });
            dom.randomizeAllBtn.addEventListener('click', () => document.querySelectorAll('fieldset .randomize-toggle:not(.active)').forEach(t => t.click()));


            // Inside your existing `setupUI` function
    // New event listeners for image download
    dom.enableImageDownload.addEventListener('change', () => {
        dom.imageDownloadFolderControls.classList.toggle('hidden-control', !dom.enableImageDownload.checked);
        updateUIState();
        saveSettings();
    });

    dom.selectDownloadFolderButton.addEventListener('click', async () => {
        try {
            if ('showDirectoryPicker' in window) {
                appState.selectedDownloadDirectoryHandle = await window.showDirectoryPicker();
                dom.selectedDownloadFolderDisplay.textContent = `Folder: ${appState.selectedDownloadDirectoryHandle.name}`;
                setStatus('Download folder selected.', 'success');
            } else {
                setStatus('File System Access API not supported. Images will download individually.', 'warning');
                appState.selectedDownloadDirectoryHandle = null;
                dom.selectedDownloadFolderDisplay.textContent = 'No folder selected (API not supported)';
            }
        } catch (error) {
            console.error('Directory picker canceled or failed:', error);
            setStatus('Folder selection canceled or failed.', 'warning');
            appState.selectedDownloadDirectoryHandle = null;
            dom.selectedDownloadFolderDisplay.textContent = 'No folder selected';
        }
        updateUIState();
        saveSettings();
    });

            updateUIMode();
            pCtx.fillStyle = '#0c0c10'; pCtx.fillRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
        }

        // --- Database & Presets ---
        function initDB() { /* ב"ה B"H */ return new Promise((resolve) => { const request = indexedDB.open('EinSofEngineDB_v4', 1); request.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains('settingsStore')) db.createObjectStore('settingsStore', { keyPath: 'id' }); if (!db.objectStoreNames.contains('presets')) db.createObjectStore('presets', { keyPath: 'name' }); }; request.onsuccess = e => { appState.db = e.target.result; resolve(); }; request.onerror = e => { console.warn('IndexedDB failed.', e.target.error); resolve(); }; }); }
        function saveSettings() { /* ב"ה B"H */ if (!appState.db) return; const settings = {}; document.querySelectorAll('[id]').forEach(el => { if (el.type === 'checkbox') settings[el.id] = el.checked; else if (el.value !== undefined && el.type !== 'file' && !el.readOnly) settings[el.id] = el.value; }); document.querySelectorAll('.control-group[data-control-name]').forEach(group => { const name = group.dataset.controlName; settings[name + '_randomize'] = group.classList.contains('randomize-active'); }); appState.db.transaction('settingsStore', 'readwrite').objectStore('settingsStore').put({ id: 'userSettings', ...settings }); }


        // REPLACE your entire existing `function loadSettings() { ... }`
function loadSettings() {
    /* ב"ה B"H */
    if (!appState.db) return;
    return new Promise(resolve => {
        const request = appState.db.transaction('settingsStore', 'readonly').objectStore('settingsStore').get('userSettings');
        request.onsuccess = e => {
            const settings = e.target.result;
            if (settings) {
                for (const key in settings) {
                    const el = document.getElementById(key);
                    if (el && !el.readOnly) {
                        if (el.type === 'checkbox') el.checked = settings[key];
                        else el.value = settings[key];
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                document.querySelectorAll('.control-group[data-control-name]').forEach(group => { const name = group.dataset.controlName; if (settings[name + '_randomize']) { group.classList.add('randomize-active'); group.querySelector('.randomize-toggle').classList.add('active'); } else { group.classList.remove('randomize-active'); group.querySelector('.randomize-toggle').classList.remove('active'); }});
                appState.simpleCaptions.main = settings.mainCaptions || '';
                appState.simpleCaptions.translation = settings.translationCaptions || '';
            }
            resolve();
        };
    });
}

        // Add this new function anywhere in your <script> section
function triggerDownload(blob, filename) {
    /* ב"ה B"H */
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
        }
        // Add this new function anywhere in your <script> section
// REPLACE the existing downloadImage function in index.html
async function downloadImage(blob, filename, directoryHandle = null) {
    /* ב"ה B"H */
    if (directoryHandle && 'getFileHandle' in directoryHandle) {
        // --- FOLDER SELECTED MODE ---
        try {
            // 1. Get reference to file (create if doesn't exist)
            const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
            // 2. Create a writable stream
            const writable = await fileHandle.createWritable();
            // 3. Write the blob data
            await writable.write(blob);
            // 4. Close the file - THIS IS CRITICAL for sequential writing
            await writable.close();
            console.log(`Saved ${filename} to selected folder.`);
        } catch (error) {
            console.error(`Error saving ${filename} using File System Access API:`, error);
            setStatus(`Failed to save ${filename}. Check folder permissions.`, 'error');
            // Do not fallback to auto-download here to avoid mixed behavior if one fails
        }
    } else {
        // --- NO FOLDER SELECTED (Auto Download) ---
        triggerDownload(blob, filename);
    }
}


async function processImageDownloadQueue() {
    /* ב"ה B"H */
    if (appState.isDownloadingImages || appState.imageDownloadQueue.length === 0) {
        return;
    }

    appState.isDownloadingImages = true;
    
    const total = appState.imageDownloadQueue.length + (appState.processedCount || 0);
    
    while (appState.imageDownloadQueue.length > 0) {
        const { blob, filename } = appState.imageDownloadQueue.shift();
        setStatus(`Saving: ${filename}...`);

        await downloadImage(blob, filename, appState.selectedDownloadDirectoryHandle);
        
        // Logic:
        // If using a folder (directoryHandle), the 'await downloadImage' above blocks until the file is physically closed.
        // If NO folder (triggerDownload), the function returns instantly. We need a delay to prevent browser choking.
        
        const delay = appState.selectedDownloadDirectoryHandle ? 50 : 500; // 50ms for folder, 500ms for browser download
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    appState.isDownloadingImages = false;
    
    // Only show "All done" if the worker is also finished
    if(appState.appStatus === 'IDLE') {
        setStatus('All images saved successfully.', 'success');
    } else {
        setStatus('Saving images...', '');
    }
}

        
        
        function loadPresets() { /* ב"ה B"H */ if (!appState.db) return; const tx = appState.db.transaction('presets', 'readonly'); const store = tx.objectStore('presets'); const request = store.getAll(); request.onsuccess = () => { dom.presetSelect.innerHTML = '<option value="">Load Preset...</option>'; request.result.forEach(preset => { const option = document.createElement('option'); option.value = preset.name; option.textContent = preset.name; dom.presetSelect.appendChild(option); }); }; }
        function savePreset() { /* ב"ה B"H */ if (!appState.db) return; const name = prompt("Enter preset name:"); if (!name) return; const settings = {}; document.querySelectorAll('[id]').forEach(el => { if (el.value !== undefined && el.type !== 'file' && !el.readOnly && el.id !== 'preset-select') { if (el.type === 'checkbox') settings[el.id] = el.checked; else settings[el.id] = el.value; }}); document.querySelectorAll('.control-group[data-control-name]').forEach(g => { settings[g.dataset.controlName + '_randomize'] = g.classList.contains('randomize-active'); }); appState.db.transaction('presets', 'readwrite').objectStore('presets').put({ name, settings }).onsuccess = () => { alert(`Preset "${name}" saved.`); loadPresets(); }; }
        function deletePreset() { /* ב"ה B"H */ if (!appState.db) return; const name = dom.presetSelect.value; if (!name) return; if (confirm(`Delete preset "${name}"?`)) { appState.db.transaction('presets', 'readwrite').objectStore('presets').delete(name).onsuccess = () => { alert(`Preset "${name}" deleted.`); loadPresets(); }; } }
        function applyPreset(name) { /* ב"ה B"H */ if (!appState.db || !name) return; appState.db.transaction('presets', 'readonly').objectStore('presets').get(name).onsuccess = e => { const preset = e.target.result; if (preset) { for (const key in preset.settings) { const el = document.getElementById(key); if (el && !el.readOnly) { if (el.type === 'checkbox') el.checked = preset.settings[key]; else el.value = preset.settings[key]; el.dispatchEvent(new Event('input', { bubbles: true })); } } document.querySelectorAll('.control-group[data-control-name]').forEach(g => { const randKey = g.dataset.controlName + '_randomize'; if (preset.settings[randKey]) { g.classList.add('randomize-active'); g.querySelector('.randomize-toggle').classList.add('active'); } else { g.classList.remove('randomize-active'); g.querySelector('.randomize-toggle').classList.remove('active'); }}); } }; }
        dom.savePresetBtn.addEventListener('click', savePreset); dom.deletePresetBtn.addEventListener('click', deletePreset); dom.presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));

        // --- Main Execution ---
        async function main() {
            /*
            ב"ה
            B"H
            */
            setupUI();
            await initDB();
            await loadSettings();
            loadPresets();
            initializeWorker();
        }

        main();
    });