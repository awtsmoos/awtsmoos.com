// B"H 
//- script.js (Controller for the Rendering Worker)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const audioInput = document.getElementById('audio-input');
    const vttFileInput = document.getElementById('vtt-file-input');
    const vttTextInput = document.getElementById('vtt-text-input');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = playPauseBtn.querySelector('i');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const durationDisplay = document.getElementById('duration-display');
    const audioFileNameDisplay = document.getElementById('audio-file-name');
    const vttFileNameDisplay = document.getElementById('vtt-file-name');

    // Live Preview Elements
    const previewCanvas = document.getElementById('waveform-preview-canvas'); // The canvas on the page
    
    // All settings inputs grouped for easy access
    const settingsInputs = {
        fontSize: document.getElementById('font-size-slider'),
        fontColor: document.getElementById('font-color-picker'),
        textAlign: document.getElementById('text-align-select'),
        boxOpacity: document.getElementById('box-opacity-slider'),
        boxColor: document.getElementById('box-color-picker'),
        borderWidth: document.getElementById('text-border-width'),
        borderColor: document.getElementById('text-border-color'),
        shadowBlur: document.getElementById('shadow-blur'),
        shadowColor: document.getElementById('shadow-color'),
        particleDensity: document.getElementById('particle-density'),
        particleSize: document.getElementById('particle-size'),
        particleVariation: document.getElementById('particle-variation'),
        waveformHeight: document.getElementById('waveform-height'),
        waveformThickness: document.getElementById('waveform-thickness'),
        particles: document.getElementById('custom-particles'),
        resWidth: document.getElementById('resolution-width'),
        resHeight: document.getElementById('resolution-height'),
        maxDuration: document.getElementById('max-duration')
    };

    // Export UI
    const exportBtn = document.getElementById('export-btn');
    const exportOverlay = document.getElementById('export-overlay');
    const exportStatus = document.getElementById('export-status');
    const exportProgressBar = document.getElementById('export-progress-bar');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null;
    let animationFrameId;
    let worker; // The rendering worker
    let isWorkerReady = false;
    let audioBufferShim = null; // To store the decoded audio data

    // --- EVENT LISTENERS & INITIALIZATION ---

    audioInput.addEventListener('change', async (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            audioPlayer.src = URL.createObjectURL(audioFile);
            audioFileNameDisplay.textContent = audioFile.name;
            audioPlayer.load();
            await decodeAudioAndSetupWorker();
        }
    });

    vttFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                vttTextInput.value = event.target.result;
                processVTTContent(event.target.result);
                vttFileNameDisplay.textContent = file.name;
                checkAndSetupWorker();
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', () => {
        processVTTContent(vttTextInput.value);
        vttFileNameDisplay.textContent = 'Pasted content';
        checkAndSetupWorker();
    });

    playPauseBtn.addEventListener('click', () => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause());
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => audioPlayer.currentTime = progressBar.value);
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        
      });

    Object.values(settingsInputs).forEach(el => {
        el.addEventListener('input', () => {
            if (isWorkerReady) {
                // Send settings updates to the worker for the live preview
                worker.postMessage({ type: 'UPDATE_SETTINGS', settings: collectSettings() });
            }
        });
    });

    exportBtn.addEventListener('click', () => {
        if (!isWorkerReady || !audioBufferShim) {
            alert('Please load an audio file and VTT content before exporting.');
            return;
        }
        exportOverlay.classList.remove('hidden');
        exportStatus.textContent = 'Starting export process...';
        exportProgressBar.style.width = '0%';
        worker.postMessage({ type: 'EXPORT', audioBufferShim });
    });

    audioPlayer.addEventListener('play', () => {
        playPauseIcon.className = 'fas fa-pause';
        renderPreviewFrame(); // Start the animation loop
    });
    
    audioPlayer.addEventListener('pause', () => {
        playPauseIcon.className = 'fas fa-play';
        cancelAnimationFrame(animationFrameId);
    });
    audioPlayer.addEventListener('ended', () => {
        playPauseIcon.className = 'fas fa-play';
        cancelAnimationFrame(animationFrameId);
    });

    // --- WORKER COMMUNICATION ---

    async function decodeAudioAndSetupWorker() {
        if (!audioFile) return;
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferShim = {
            sampleRate: audioBuffer.sampleRate,
            duration: audioBuffer.duration,
            channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i)),
        };
        checkAndSetupWorker();
    }

    function checkAndSetupWorker() {
        if (cues.length > 0 && audioBufferShim) {
            setupWorker();
        }
    }

    function setupWorker() {
        if (worker) worker.terminate(); // Terminate any existing worker
        isWorkerReady = false;
        
        worker = new Worker('video-worker.js');
        
        worker.onmessage = ({ data }) => {
            // Listen for export-related messages from the worker
            switch (data.type) {
                case 'STATUS_UPDATE':
                    exportStatus.textContent = data.payload.message;
                    exportProgressBar.style.width = `${data.payload.progress}%`;
                    break;
                case 'VIDEO_COMPLETE':
                    exportStatus.textContent = 'Download starting...';
                    downloadBlob(data.payload.blob, data.payload.fileName);
                    setTimeout(() => exportOverlay.classList.add('hidden'), 2000);
                    worker.terminate();
                    worker = null;
                    isWorkerReady = false;
                    break;
                case 'FATAL_ERROR':
                    exportStatus.innerHTML = `Error: ${data.payload.message}<br><button id="close-error-btn">Close</button>`;
                    document.getElementById('close-error-btn').onclick = () => exportOverlay.classList.add('hidden');
                    break;
            }
        };
        
        // Transfer the canvas control to the worker
        const offscreenCanvas = previewCanvas.transferControlToOffscreen();
        worker.postMessage({
            type: 'INIT',
            canvas: offscreenCanvas,
            cues,
            audioBufferShim,
            settings: collectSettings()
        }, [offscreenCanvas]); // The second argument is a list of transferable objects

        isWorkerReady = true;
    }

    function renderPreviewFrame() {
        // This is the core animation loop. It just tells the worker to draw.
        if (isWorkerReady) {
            worker.postMessage({ type: 'DRAW_PREVIEW', time: audioPlayer.currentTime });
        }
        animationFrameId = requestAnimationFrame(renderPreviewFrame);
    }
    
    // --- UTILITY FUNCTIONS ---
    
    function collectSettings() {
        const settings = {};
        for (const key in settingsInputs) {
            settings[key] = settingsInputs[key].type === 'number' || settingsInputs[key].type === 'range' 
                ? parseFloat(settingsInputs[key].value) 
                : settingsInputs[key].value;
        }
        // Nest settings for the worker's convenience
        return {
            resolution: { width: settings.resWidth, height: settings.resHeight },
            maxDuration: settings.maxDuration,
            waveformThickness: settings.waveformThickness,
            waveformHeight: settings.waveformHeight,
            font: {
                size: settings.fontSize,
                color: settings.fontColor,
                align: settings.textAlign,
                borderWidth: settings.borderWidth,
                borderColor: settings.borderColor,
            },
            particles: {
                density: settings.particleDensity,
                baseSize: settings.particleSize,
                variation: settings.particleVariation,
                chars: settings.particles,
            },
            // The worker needs these for text box rendering
            boxColor: settings.boxColor,
            boxOpacity: settings.boxOpacity,
        };
    }

    function processVTTContent(vttText) {
        cues = parseVTT(vttText);
        
        currentCueIndex = -1;
    
    }

    function updateLyrics(currentTime) {
        // This function now ONLY updates the simple HTML text, not the canvas.
        // It's kept for accessibility and as a simple fallback.
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            lyricsDisplay.innerHTML = (newCueIndex !== -1) ? `<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>` : "";
            currentCueIndex = newCueIndex;
        }
    }

    // VTT parsing, time formatting, and blob downloading functions remain the same
    function parseVTT(vttContent){const lines=vttContent.trim().split(/\r?\n/);const parsedCues=[];for(let i=0;i<lines.length;i++){if(lines[i]&&lines[i].includes("-->")){const[start,end]=lines[i].split(" --> ").map(timeToSeconds);let text="";let j=i+1;while(lines[j]&&lines[j].trim()!==""){text+=lines[j]+"\n";j++}if(start!==null&&end!==null){parsedCues.push({start,end,text:text.trim()})}i=j-1}}return parsedCues}
    function timeToSeconds(timeStr){try{const parts=timeStr.trim().split(":");const seconds=parts.length===3?parseFloat(parts[0])*3600+parseFloat(parts[1])*60+parseFloat(parts[2]):parseFloat(parts[0])*60+parseFloat(parts[1]);return isNaN(seconds)?null:seconds}catch{return null}}
    function formatTime(time){if(isNaN(time))return"0:00";const minutes=Math.floor(time/60);const seconds=Math.floor(time%60);return`${minutes}:${seconds.toString().padStart(2,"0")}`}
    function downloadBlob(blob,fileName){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.style.display="none";a.href=url;a.download=fileName;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}
});