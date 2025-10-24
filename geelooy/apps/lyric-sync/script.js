// B"H
// - Definitive Main Script: Stable Playback Foundation + Safe Export

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
    const settingsInputs = {
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
        resWidth: document.getElementById('resolution-width'),
        resHeight: document.getElementById('resolution-height'),
        maxDuration: document.getElementById('max-duration')
    };
    const exportBtn = document.getElementById('export-btn');
    const exportOverlay = document.getElementById('export-overlay');
    const exportStatus = document.getElementById('export-status');
    const exportProgressBar = document.getElementById('export-progress-bar');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null;

    // --- FILE INPUT LISTENERS ---
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
            vttFileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                vttTextInput.value = event.target.result;
                cues = parseVTT(event.target.result);
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', (e) => {
        vttFileNameDisplay.textContent = 'Pasted content';
        cues = parseVTT(e.target.value);
    });
    
    // --- STABLE PLAYER CONTROLS (NO WEB AUDIO API) ---
    playPauseBtn.addEventListener('click', () => {
        audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
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

    // --- SAFE, ON-DEMAND EXPORT FUNCTIONALITY ---
    // REPLACE THE ENTIRE LISTENER WITH THIS STABLE VERSION
exportBtn.addEventListener('click', async () => {
if (!audioFile || cues.length === 0) {
        alert('Please load an audio file and VTT content before exporting.');
        return;
    }

    // --- THE CRITICAL FIX IS HERE ---
    // 1. Show the export overlay and status message IMMEDIATELY.
    // This must happen before any 'await' calls.
    exportOverlay.classList.remove('hidden');
    exportStatus.textContent = 'Preparing export...';
    exportProgressBar.style.width = '0%';

// This is the new, upgraded code for your exportBtn listener's try block
try {
    const tempAudioContext = new AudioContext();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);

    // --- AUDIO TRIMMING LOGIC ---
    let finalAudioBuffer = audioBuffer; // Default to the full audio buffer
    const settings = collectSettings();
    const maxDuration = settings.maxDuration;

    // Check if trimming is necessary
    if (maxDuration > 0 && maxDuration < audioBuffer.duration) {
        exportStatus.textContent = `Trimming audio to ${maxDuration} seconds...`;
        
        // Calculate the exact number of samples for the new duration
        const newSampleLength = Math.floor(maxDuration * audioBuffer.sampleRate);

        // Create a new, empty audio buffer with the desired shorter length
        const trimmedBuffer = tempAudioContext.createBuffer(
            audioBuffer.numberOfChannels,
            newSampleLength,
            audioBuffer.sampleRate
        );

        // Copy the audio data from the start of the original buffer to the new buffer
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const originalChannelData = audioBuffer.getChannelData(i);
            // .copyToChannel is an efficient way to transfer the samples
            trimmedBuffer.copyToChannel(originalChannelData.slice(0, newSampleLength), i);
        }
        
        // The trimmed buffer is now our final buffer for the export
        finalAudioBuffer = trimmedBuffer;
    }
    // --- END OF AUDIO TRIMMING LOGIC ---

    // Now, build the shim using the final (potentially trimmed) audio buffer
    const audioBufferShim = {
        sampleRate: finalAudioBuffer.sampleRate,
        duration: finalAudioBuffer.duration,
        length: finalAudioBuffer.length,
        numberOfChannels: finalAudioBuffer.numberOfChannels,
        channels: Array.from({ length: finalAudioBuffer.numberOfChannels }, (_, i) => finalAudioBuffer.getChannelData(i)),
    };

    const worker = new Worker('video-worker.js');

    worker.onmessage = ({ data }) => {
        // ... (your existing onmessage logic is correct) ...
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

    // Send the final (potentially trimmed) audio data to the worker
    worker.postMessage({
        cues,
        audioBufferShim,
        settings // Pass the settings we collected earlier
    });

} catch (error) {
    alert(`Failed to prepare data for export: ${error.message}`);
    exportOverlay.classList.add('hidden');
}

})
    // --- HELPER & UTILITY FUNCTIONS ---

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

    function updateLyrics(currentTime) {
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            if (newCueIndex !== -1) {
                lyricsDisplay.innerHTML = `<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>`;
            }
            currentCueIndex = newCueIndex;
        }
    }

    function parseVTT(vttContent) {
        if (!vttContent || typeof vttContent !== 'string') return [];
        const lines = vttContent.trim().replace(/\r/g, '').split('\n');
        const cues = [];
        let i = 0;
        while (i < lines.length) {
            const timeLineIndex = lines.findIndex((line, index) => index >= i && line.includes('-->'));
            if (timeLineIndex === -1) break;
            const [start, end] = lines[timeLineIndex].split(' --> ').map(timeToSeconds);
            let text = '';
            let j = timeLineIndex + 1;
            while (j < lines.length && lines[j].trim() !== '') {
                text += lines[j] + '\n';
                j++;
            }
            if (start != null && end != null) {
                cues.push({ start, end, text: text.trim() });
            }
            i = j;
        }
        return cues;
    }

    function timeToSeconds(t) {
        if (!t) return null;
        try {
            const p = t.trim().split(":");
            return p.length === 3 ? (+p[0] * 3600 + +p[1] * 60 + +p[2]) : (+p[0] * 60 + +p[1]);
        } catch {
            return null;
        }
    }

    function formatTime(t) {
        if (isNaN(t)) return "0:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    function downloadBlob(b, f) {
        const u = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = u;
        a.download = f;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
    }
});