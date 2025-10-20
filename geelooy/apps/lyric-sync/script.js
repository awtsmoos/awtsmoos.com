// B"H - Definitive Main Script: Stable Foundation, No Web Audio API, No Crashes

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
    const lyricsDisplay = document.getElementById('lyrics-display');
    const settingsInputs = { // Keep refs for the export function
        resWidth: document.getElementById('resolution-width'),
        resHeight: document.getElementById('resolution-height'),
        maxDuration: document.getElementById('max-duration'),
        // Add all other settings inputs here so export can access them
        fontSize: document.getElementById('font-size-slider'),
        fontColor: document.getElementById('font-color-picker'),
        textAlign: document.getElementById('text-align-select'),
        boxOpacity: document.getElementById('box-opacity-slider'),
        boxColor: document.getElementById('box-color-picker'),
        borderWidth: document.getElementById('text-border-width'),
        borderColor: document.getElementById('text-border-color'),
        particleDensity: document.getElementById('particle-density'),
        particleSize: document.getElementById('particle-size'),
        particleVariation: document.getElementById('particle-variation'),
        waveformHeight: document.getElementById('waveform-height'),
        waveformThickness: document.getElementById('waveform-thickness'),
        particles: document.getElementById('custom-particles'),
    };
    const exportBtn = document.getElementById('export-btn');
    const exportOverlay = document.getElementById('export-overlay');
    const exportStatus = document.getElementById('export-status');
    const exportProgressBar = document.getElementById('export-progress-bar');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null;

    // --- EVENT LISTENERS ---
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
            // --- BUG FIX: Update the VTT file name display ---
            vttFileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                const vttContent = event.target.result;
                vttTextInput.value = vttContent;
                cues = parseVTT(vttContent);
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', (e) => {
        vttFileNameDisplay.textContent = 'Pasted content';
        cues = parseVTT(e.target.value);
    });
    
    // --- STABLE PLAYER CONTROLS ---
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });
    
    audioPlayer.addEventListener('play', () => { playPauseIcon.className = 'fas fa-pause'; });
    audioPlayer.addEventListener('pause', () => { playPauseIcon.className = 'fas fa-play'; });
    audioPlayer.addEventListener('ended', () => { playPauseIcon.className = 'fas fa-play'; });
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    
    progressBar.addEventListener('input', () => { audioPlayer.currentTime = progressBar.value; });
    
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        updateLyrics(audioPlayer.currentTime);
    });

    // --- STABLE VTT PARSER ---
    function parseVTT(vttContent) {
        if (!vttContent) return [];
        const lines = vttContent.trim().replace(/\r/g, '').split('\n');
        const cues = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                const [start, end] = lines[i].split(' --> ').map(timeToSeconds);
                let text = '';
                let j = i + 1;
                while (j < lines.length && lines[j].trim() !== '') {
                    text += lines[j] + '\n';
                    j++;
                }
                if (start != null && end != null) {
                    cues.push({ start, end, text: text.trim() });
                }
                i = j;
            }
        }
        return cues;
    }

    // --- SIMPLE HTML LYRIC UPDATER ---
    function updateLyrics(currentTime) {
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            if (newCueIndex !== -1) {
                lyricsDisplay.innerHTML = `<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>`;
            }
            // By not having an 'else', the last caption stays on screen
            currentCueIndex = newCueIndex;
        }
    }

    // --- UTILITY FUNCTIONS ---
    function timeToSeconds(t){try{const p=t.trim().split(":");return p.length===3?+p[0]*3600+ +p[1]*60+ +p[2]:+p[0]*60+ +p[1]}catch{return null}}
    function formatTime(t){if(isNaN(t))return"0:00";const m=Math.floor(t/60),s=Math.floor(t%60);return`${m}:${s.toString().padStart(2,"0")}`}
    function downloadBlob(b,f){const u=URL.createObjectURL(b),a=document.createElement("a");a.style.display="none",a.href=u,a.download=f,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(u)}
    
    // --- SAFE, SELF-CONTAINED EXPORT ---
    exportBtn.addEventListener('click', async () => {
        if (!audioFile || cues.length === 0) {
            alert('Please load an audio file and VTT content before exporting.');
            return;
        }

        exportOverlay.classList.remove('hidden');
        exportStatus.textContent = 'Preparing export...';
        exportProgressBar.style.width = '0%';

        try {
            // Safely decode the audio from scratch, only for the export process
            const arrayBuffer = await audioFile.arrayBuffer();
            const tempAudioContext = new AudioContext();
            const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
            const audioBufferShim = {
                sampleRate: audioBuffer.sampleRate,
                duration: audioBuffer.duration,
                channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i)),
            };

            const worker = new Worker('video-worker.js');

            worker.onmessage = ({ data }) => {
                switch (data.type) {
                    case 'STATUS_UPDATE':
                        exportStatus.textContent = data.payload.message;
                        exportProgressBar.style.width = `${data.payload.progress}%`;
                        break;
                    case 'VIDEO_COMPLETE':
                        downloadBlob(data.payload.blob, data.payload.fileName);
                        setTimeout(() => exportOverlay.classList.add('hidden'), 2000);
                        worker.terminate();
                        break;
                    case 'FATAL_ERROR':
                        alert(`A critical error occurred in the rendering worker: ${data.payload.message}`);
                        exportOverlay.classList.add('hidden');
                        worker.terminate();
                        break;
                }
            };
            
            const transferList = [];
            audioBufferShim.channels.forEach(channel => transferList.push(channel.buffer));
            
            worker.postMessage({
                cues,
                audioBufferShim,
                settings: collectSettings() // This function now collects all settings
            }, transferList);

        } catch (error) {
            alert(`Failed to prepare data for export: ${error.message}`);
            exportOverlay.classList.add('hidden');
        }
    });

    function collectSettings() {
        const s = {};
        for (const key in settingsInputs) {
            s[key] = settingsInputs[key].type === 'range' ? parseFloat(settingsInputs[key].value) : settingsInputs[key].value;
        }
        return {
            resolution: { width: parseInt(s.resWidth), height: parseInt(s.resHeight) },
            maxDuration: s.maxDuration,
            waveformThickness: s.waveformThickness,
            waveformHeight: s.waveformHeight,
            font: { size: s.fontSize, color: s.fontColor, align: s.textAlign, borderWidth: s.borderWidth, borderColor: s.borderColor },
            particles: { density: parseInt(s.particleDensity), baseSize: s.particleSize, variation: s.particleVariation, chars: s.particles },
            boxColor: s.boxColor,
            boxOpacity: s.boxOpacity
        };
    }
});