// B"H
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    // Player & Input
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
    const lyricsDisplay = document.getElementById('lyrics-display');
    const waveformCanvas = document.getElementById('waveform-preview-canvas');
    const waveformCtx = waveformCanvas.getContext('2d');

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
    let audioContext, analyser, sourceNode, dataArray; // For Web Audio API
    let animationFrameId; // To control the animation loop
    const STORAGE_KEY = 'lyricSyncSettings';

    // --- EVENT LISTENERS & INITIALIZATION ---
    loadSettings(); // Load saved settings on startup

    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            audioPlayer.src = url;
            audioFileNameDisplay.textContent = audioFile.name;
            setupAudioAnalysis(); // Initialize Web Audio API for the new file
            audioPlayer.load();
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
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', () => {
        processVTTContent(vttTextInput.value);
        vttFileNameDisplay.textContent = 'Pasted content';
    });

    // Player controls
    playPauseBtn.addEventListener('click', () => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause());
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => audioPlayer.currentTime = progressBar.value);
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        updateLyrics(audioPlayer.currentTime);
    });
    
    // Add a single event listener for all settings changes to apply styles and save
    Object.values(settingsInputs).forEach(el => {
        el.addEventListener('input', () => {
            applyStyles();
            saveSettings();
        });
    });

    exportBtn.addEventListener('click', handleExport);

    // --- WEB AUDIO API & LIVE PREVIEW ANIMATION ---
    function setupAudioAnalysis() {
        if (audioContext) {
            audioContext.close(); // Close existing context before creating a new one
        }
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        sourceNode = audioContext.createMediaElementSource(audioPlayer);
        
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }

    function renderPreviewFrame() {
        if (audioPlayer.paused || audioPlayer.ended) {
            cancelAnimationFrame(animationFrameId);
            return;
        }
        
        animationFrameId = requestAnimationFrame(renderPreviewFrame);
        
        analyser.getByteTimeDomainData(dataArray);

        const { width, height } = waveformCanvas.getBoundingClientRect();
        waveformCanvas.width = width;
        waveformCanvas.height = height;

        waveformCtx.clearRect(0, 0, width, height);
        waveformCtx.lineWidth = settingsInputs.waveformThickness.value;
        waveformCtx.strokeStyle = 'rgba(200, 225, 255, 0.7)';
        waveformCtx.beginPath();
        
        const sliceWidth = width * 1.0 / analyser.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const v = dataArray[i] / 128.0; // Normalize to 0-2 range
            const y = v * height / 2;
            i === 0 ? waveformCtx.moveTo(x, y) : waveformCtx.lineTo(x, y);
            x += sliceWidth;
        }

        waveformCtx.lineTo(width, height / 2);
        waveformCtx.stroke();
    }
    
    audioPlayer.addEventListener('play', () => {
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
        playPauseIcon.className = 'fas fa-pause';
        if (analyser) renderPreviewFrame(); // Start animation loop
    });
    
    audioPlayer.addEventListener('pause', () => playPauseIcon.className = 'fas fa-play');
    audioPlayer.addEventListener('ended', () => playPauseIcon.className = 'fas fa-play');


    // --- CORE VTT & DISPLAY FUNCTIONS ---
    function processVTTContent(vttText) {
        cues = parseVTT(vttText);
        lyricsDisplay.innerHTML = `<p>Ready to play.</p>`;
        currentCueIndex = -1;
    }

    function parseVTT(vttContent) {
        const lines = vttContent.trim().split(/\r?\n/);
        const parsedCues = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                const [start, end] = lines[i].split(' --> ').map(timeToSeconds);
                let text = '';
                let j = i + 1;
                while (lines[j] && lines[j].trim() !== '') {
                    text += lines[j] + '\n';
                    j++;
                }
                if (start !== null && end !== null) parsedCues.push({ start, end, text: text.trim() });
                i = j - 1;
            }
        }
        return parsedCues;
    }

    function timeToSeconds(timeStr) {
        try {
            const parts = timeStr.trim().split(':');
            const seconds = parts.length === 3
                ? parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2])
                : parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
            return isNaN(seconds) ? null : seconds;
        } catch { return null; }
    }

    function updateLyrics(currentTime) {
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            lyricsDisplay.innerHTML = (newCueIndex !== -1) ? `<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>` : "";
            currentCueIndex = newCueIndex;
        }
    }
    
    function formatTime(time) {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // --- SETTINGS MANAGEMENT ---
    function applyStyles() {
        const root = document.documentElement;
        
        // Text & Font
        root.style.setProperty('--lyrics-font-size', `${settingsInputs.fontSize.value}px`);
        root.style.setProperty('--lyrics-font-color', settingsInputs.fontColor.value);
        root.style.setProperty('--lyrics-text-align', settingsInputs.textAlign.value);

        // Box Color & Opacity
        const boxColor = settingsInputs.boxColor.value;
        const boxOpacity = settingsInputs.boxOpacity.value;
        const r = parseInt(boxColor.substr(1, 2), 16);
        const g = parseInt(boxColor.substr(3, 2), 16);
        const b = parseInt(boxColor.substr(5, 2), 16);
        root.style.setProperty('--lyrics-box-bg-color', `rgba(${r}, ${g}, ${b}, ${boxOpacity})`);

        // Shadow
        const shadowBlur = `${settingsInputs.shadowBlur.value}px`;
        const shadowColor = settingsInputs.shadowColor.value;
        root.style.setProperty('--lyrics-text-shadow', `0px 0px ${shadowBlur} ${shadowColor}`);
    }

    function saveSettings() {
        const settingsToSave = {};
        for (const key in settingsInputs) {
            settingsToSave[key] = settingsInputs[key].value;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    }

    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (savedSettings) {
            for (const key in savedSettings) {
                if (settingsInputs[key]) {
                    settingsInputs[key].value = savedSettings[key];
                }
            }
        }
        applyStyles();
    }

    // --- VIDEO EXPORT ---
    async function handleExport() {
        if (!audioFile || cues.length === 0) {
            alert('Please load an audio file and VTT content before exporting.');
            return;
        }

        exportOverlay.classList.remove('hidden');
        exportStatus.textContent = 'Preparing audio data...';
        exportProgressBar.style.width = '0%';

        try {
            // Re-use the existing audio context if available, otherwise create one
            const exportAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await exportAudioContext.decodeAudioData(arrayBuffer);

            // Gather all current settings from the UI
            const settings = {};
            for (const key in settingsInputs) {
                const input = settingsInputs[key];
                settings[key] = (input.type === 'range' || input.type === 'number') ? parseFloat(input.value) : input.value;
            }
            settings.originalFileName = audioFile.name; // Add filename for worker
            settings.resolution = { width: settings.resWidth, height: settings.resHeight };
            settings.font = { // Group font settings for the worker
                size: settings.fontSize,
                color: settings.fontColor,
                align: settings.textAlign,
                borderWidth: settings.borderWidth,
                borderColor: settings.borderColor,
                shadowBlur: settings.shadowBlur,
                shadowColor: settings.shadowColor,
                boxColor: settings.boxColor,
                boxOpacity: settings.boxOpacity,
            };

            const audioBufferShim = {
                sampleRate: audioBuffer.sampleRate,
                length: audioBuffer.length,
                duration: audioBuffer.duration,
                numberOfChannels: audioBuffer.numberOfChannels,
                channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i)),
            };

            const worker = new Worker('video-worker.js');

            worker.onmessage = ({ data: { type, payload } }) => {
                switch (type) {
                    case 'STATUS_UPDATE':
                        exportStatus.textContent = payload.message;
                        if (payload.progress) exportProgressBar.style.width = `${payload.progress}%`;
                        break;
                    case 'VIDEO_COMPLETE':
                        exportStatus.textContent = 'Download starting...';
                        downloadBlob(payload.blob, payload.fileName);
                        setTimeout(() => exportOverlay.classList.add('hidden'), 2000);
                        worker.terminate();
                        break;
                    case 'FATAL_ERROR':
                        exportStatus.innerHTML = `Error: ${payload.message}<br><button id="close-error-btn">Close</button>`;
                        document.getElementById('close-error-btn').onclick = () => exportOverlay.classList.add('hidden');
                        console.error('Worker Error:', payload.error);
                        worker.terminate();
                        break;
                }
            };
            
            worker.postMessage({ cues, audioBufferShim, settings });

        } catch (error) {
            exportStatus.innerHTML = `Error preparing data: ${error.message}<br><button id="close-error-btn">Close</button>`;
            document.getElementById('close-error-btn').onclick = () => exportOverlay.classList.add('hidden');
            console.error(error);
        }
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});