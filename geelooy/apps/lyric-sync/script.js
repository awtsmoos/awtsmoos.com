//B"H
// B"H
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    // Player & Input
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

    // Settings
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontColorPicker = document.getElementById('font-color-picker');
    const textAlignSelect = document.getElementById('text-align-select');

    // Export
    const exportBtn = document.getElementById('export-btn');
    const exportOverlay = document.getElementById('export-overlay');
    const exportStatus = document.getElementById('export-status');
    const exportProgressBar = document.getElementById('export-progress-bar');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null; // Store the actual File object for export

    // --- EVENT LISTENERS ---

    // Load Audio File
    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            audioPlayer.src = URL.createObjectURL(audioFile);
            audioFileNameDisplay.textContent = audioFile.name;
            audioPlayer.load();
        }
    });

    // Load VTT from File
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

    // Load VTT from Textarea
    vttTextInput.addEventListener('input', () => {
        processVTTContent(vttTextInput.value);
        vttFileNameDisplay.textContent = 'Pasted content';
    });

    // Player Controls
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
    
    // Settings Listeners
    document.querySelectorAll('.settings-panel input, .settings-panel select').forEach(el => {
        el.addEventListener('input', applyStyles);
    });

    // Export Button
    exportBtn.addEventListener('click', handleExport);

    // --- CORE FUNCTIONS ---

    function processVTTContent(vttText) {
        cues = parseVTT(vttText);
        lyricsDisplay.innerHTML = `<p>Ready to play.</p>`;
        currentCueIndex = -1; // Reset tracker
    }

    function parseVTT(vttContent) {
        const lines = vttContent.trim().split(/\r?\n/);
        const parsedCues = [];
        let i = 0;
        
        while (i < lines.length) {
            if (lines[i] && lines[i].includes('-->')) {
                const timeLine = lines[i];
                const [start, end] = timeLine.split(' --> ').map(timeToSeconds);
                
                let text = '';
                i++;
                while (lines[i] && lines[i].trim() !== '' && !lines[i].includes('-->')) {
                    text += lines[i] + '\n';
                    i++;
                }

                if (start !== null && end !== null) {
                    parsedCues.push({ start, end, text: text.trim() });
                }
                continue;
            }
            i++;
        }
        return parsedCues;
    }

    function timeToSeconds(timeStr) {
        if (!timeStr) return null;
        const parts = timeStr.trim().split(':');
        let seconds = 0;
        try {
            if (parts.length === 3) {
                seconds += parseFloat(parts[0]) * 3600;
                seconds += parseFloat(parts[1]) * 60;
                seconds += parseFloat(parts[2]);
            } else {
                seconds += parseFloat(parts[0]) * 60;
                seconds += parseFloat(parts[1]);
            }
            return isNaN(seconds) ? null : seconds;
        } catch (error) {
            console.error("Error parsing time:", timeStr, error);
            return null;
        }
    }

    function updateLyrics(currentTime) {
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            if (newCueIndex !== -1) {
                lyricsDisplay.innerHTML = `<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>`;
            } else {
                lyricsDisplay.innerHTML = "";
            }
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
        root.style.setProperty('--lyrics-font-size', `${fontSizeSlider.value}px`);
        root.style.setProperty('--lyrics-font-color', fontColorPicker.value);
        root.style.setProperty('--lyrics-text-align', textAlignSelect.value);
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
                resolution: {
                    width: parseInt(document.getElementById('resolution-width').value),
                    height: parseInt(document.getElementById('resolution-height').value),
                },
                maxDuration: parseFloat(document.getElementById('max-duration').value),
                particles: document.getElementById('custom-particles').value,
                font: {
                    size: parseInt(document.getElementById('font-size-slider').value),
                    color: document.getElementById('font-color-picker').value,
                    align: document.getElementById('text-align-select').value,
                    borderWidth: parseInt(document.getElementById('text-border-width').value),
                    borderColor: document.getElementById('text-border-color').value,
                },
                originalFileName: audioFile.name
            };

            // Create a "shim" of the AudioBuffer to send to the worker
            const audioBufferShim = {
                sampleRate: audioBuffer.sampleRate,
                length: audioBuffer.length,
                duration: audioBuffer.duration,
                numberOfChannels: audioBuffer.numberOfChannels,
                channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
                    audioBuffer.getChannelData(i)
                ),
            };

            const worker = new Worker('video-worker.js');

            worker.onmessage = (e) => {
                const { type, payload } = e.data;
                switch (type) {
                    case 'STATUS_UPDATE':
                        exportStatus.textContent = payload.message;
                        if (payload.progress) {
                            exportProgressBar.style.width = `${payload.progress}%`;
                        }
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
            
            worker.postMessage({
                cues,
                audioBufferShim,
                settings
            });

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

    // Initial style application on load
    applyStyles();
});