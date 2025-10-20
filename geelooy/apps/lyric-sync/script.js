// B"H
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const audioInput = document.getElementById('audio-input');
    const vttFileInput = document.getElementById('vtt-file-input');
    const vttTextInput = document.getElementById('vtt-text-input');
    const audioPlayer = document.getElementById('audio-player');
    const lyricsDisplay = document.getElementById('lyrics-display');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = playPauseBtn.querySelector('i');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const durationDisplay = document.getElementById('duration-display');
    const audioFileNameDisplay = document.getElementById('audio-file-name');
    const vttFileNameDisplay = document.getElementById('vtt-file-name');

    // All settings elements
    const settingsInputs = {
        fontSize: document.getElementById('font-size-slider'),
        fontColor: document.getElementById('font-color-picker'),
        textAlign: document.getElementById('text-align-select'),
        resWidth: document.getElementById('resolution-width'),
        resHeight: document.getElementById('resolution-height'),
        maxDuration: document.getElementById('max-duration'),
        borderWidth: document.getElementById('text-border-width'),
        borderColor: document.getElementById('text-border-color'),
        particles: document.getElementById('custom-particles')
    };

    const exportBtn = document.getElementById('export-btn');
    const exportOverlay = document.getElementById('export-overlay');
    const exportStatus = document.getElementById('export-status');
    const exportProgressBar = document.getElementById('export-progress-bar');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null;
    const STORAGE_KEY = 'lyricSyncSettings';

    // --- EVENT LISTENERS & INITIALIZATION ---

    loadSettings(); // Load saved settings on startup

    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            audioPlayer.src = URL.createObjectURL(audioFile);
            audioFileNameDisplay.textContent = audioFile.name;
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

    playPauseBtn.addEventListener('click', () => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause());
    audioPlayer.addEventListener('play', () => playPauseIcon.className = 'fas fa-pause');
    audioPlayer.addEventListener('pause', () => playPauseIcon.className = 'fas fa-play');
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
    
    // Add a single event listener for all settings changes
    Object.values(settingsInputs).forEach(el => {
        el.addEventListener('input', () => {
            applyStyles();
            saveSettings();
        });
    });

    exportBtn.addEventListener('click', handleExport);

    // --- CORE FUNCTIONS ---

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
                i = j;
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

    function applyStyles() {
        const root = document.documentElement;
        root.style.setProperty('--lyrics-font-size', `${settingsInputs.fontSize.value}px`);
        root.style.setProperty('--lyrics-font-color', settingsInputs.fontColor.value);
        root.style.setProperty('--lyrics-text-align', settingsInputs.textAlign.value);
    }

    // --- LOCALSTORAGE & SETTINGS MANAGEMENT ---
    
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
        applyStyles(); // Apply loaded (or default) styles on startup
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
            const audioContext = new AudioContext();
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const settings = {
                resolution: { width: parseInt(settingsInputs.resWidth.value), height: parseInt(settingsInputs.resHeight.value) },
                maxDuration: parseFloat(settingsInputs.maxDuration.value),
                particles: settingsInputs.particles.value,
                font: {
                    size: parseInt(settingsInputs.fontSize.value),
                    color: settingsInputs.fontColor.value,
                    align: settingsInputs.textAlign.value,
                    borderWidth: parseInt(settingsInputs.borderWidth.value),
                    borderColor: settingsInputs.borderColor.value,
                },
                originalFileName: audioFile.name
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