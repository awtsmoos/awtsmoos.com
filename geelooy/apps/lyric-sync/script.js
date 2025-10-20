// B"H - script.js (Definitive Version with Main-Thread Analysis to Prevent Crashes)

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
    const previewCanvas = document.getElementById('waveform-preview-canvas');
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
    let audioFile = null;
    let vttContent = '';
    let animationFrameId;
    let worker;
    let isWorkerReady = false;
    let audioBufferForExport = null; // We store the full audio buffer here for later

    // --- EVENT LISTENERS ---
    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            audioPlayer.src = URL.createObjectURL(audioFile);
            audioFileNameDisplay.textContent = audioFile.name;
            audioPlayer.load();
            attemptWorkerInitialization();
        }
    });

    vttFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                vttTextInput.value = event.target.result;
                vttContent = event.target.result;
                vttFileNameDisplay.textContent = file.name;
                attemptWorkerInitialization();
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', (e) => {
        vttContent = e.target.value;
        vttFileNameDisplay.textContent = 'Pasted content';
        attemptWorkerInitialization();
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
                worker.postMessage({ type: 'UPDATE_SETTINGS', settings: collectSettings() });
            }
        });
    });

    exportBtn.addEventListener('click', () => {
        if (!isWorkerReady || !audioBufferForExport) {
            alert('Please load audio and VTT content first.');
            return;
        }
        exportOverlay.classList.remove('hidden');
        
        // Transfer the audio buffer ONLY when exporting. This is memory-safe.
        const transferList = [];
        audioBufferForExport.channels.forEach(channel => transferList.push(channel.buffer));
        worker.postMessage({ type: 'EXPORT', audioBufferShim: audioBufferForExport }, transferList);
    });

    audioPlayer.addEventListener('play', () => { playPauseIcon.className = 'fas fa-pause'; renderPreviewFrame(); });
    audioPlayer.addEventListener('pause', () => { playPauseIcon.className = 'fas fa-play'; cancelAnimationFrame(animationFrameId); });
    audioPlayer.addEventListener('ended', () => { playPauseIcon.className = 'fas fa-play'; cancelAnimationFrame(animationFrameId); });

    // --- ROBUST INITIALIZATION LOGIC ---
    async function attemptWorkerInitialization() {
        if (!audioFile || !vttContent) return;

        if (worker) {
            worker.terminate();
            isWorkerReady = false;
        }

        try {
            // 1. Decode audio on the main thread
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Store the full buffer for the export button to use later
            audioBufferForExport = {
                sampleRate: audioBuffer.sampleRate,
                duration: audioBuffer.duration,
                channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i)),
            };

            // 2. Perform analysis on the main thread
            const frameRate = 24;
            const totalFrames = Math.floor(audioBuffer.duration * frameRate);
            const volumeDataForFrames = preAnalyzeAudio(audioBufferForExport, totalFrames);
            
            cues = parseVTT(vttContent);
            if (cues.length === 0) return;

            // 3. Setup worker with the small analysis array
            setupWorker(cues, volumeDataForFrames, audioBuffer.duration);
        } catch (error) {
            console.error("Error setting up worker:", error);
            alert("Failed to process the audio file. It may be corrupt or an unsupported format.");
        }
    }

    function setupWorker(cues, volumeDataForFrames, duration) {
      /*  worker = new Worker('video-worker.js');

        worker.onmessage = ({ data }) => {
            switch (data.type) {
                case 'STATUS_UPDATE':
                    exportStatus.textContent = data.payload.message;
                    exportProgressBar.style.width = `${data.payload.progress}%`;
                    break;
                case 'VIDEO_COMPLETE':
                    downloadBlob(data.payload.blob, data.payload.fileName);
                    setTimeout(() => exportOverlay.classList.add('hidden'), 2000);
                    break;
                case 'FATAL_ERROR':
                    alert(`A critical error occurred in the rendering engine: ${data.payload.message}`);
                    exportOverlay.classList.add('hidden');
                    break;
            }
        };*/
        
        const rect = previewCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        previewCanvas.width = 1080
        previewCanvas.height = 1920
       // const offscreenCanvas = previewCanvas.transferControlToOffscreen();
        
        // 4. Send ONLY the necessary small data to the worker. NO MORE CRASHES.
     /*   worker.postMessage({
            type: 'INIT',
           // canvas: offscreenCanvas,
            cues,
            volumeDataForFrames,
            duration,
            settings: collectSettings()
        },
        // [offscreenCanvas]
        );*/

        //isWorkerReady = true;
    }

    // --- AUDIO ANALYSIS (RUNS ON MAIN THREAD) ---
    function preAnalyzeAudio(audioBufferShim, totalFrames) {
        const channelData = audioBufferShim.channels[0];
        if (!channelData || channelData.length === 0) return new Array(totalFrames).fill(0.01);
        const volumeLevels = [];
        const samplesPerFrame = Math.floor(channelData.length / totalFrames);
        for (let i = 0; i < totalFrames; i++) {
            let rms = 0;
            const start = i * samplesPerFrame;
            for (let j = 0; j < samplesPerFrame; j++) rms += (channelData[start + j] || 0) ** 2;
            const volume = Math.sqrt(rms / samplesPerFrame);
            volumeLevels.push(isNaN(volume) ? 0.01 : Math.max(0.01, volume));
        }
        return volumeLevels;
    }
    
    // --- PREVIEW & UTILITIES ---
    function renderPreviewFrame() {
        if (isWorkerReady) {
            worker.postMessage({ type: 'DRAW_PREVIEW', time: audioPlayer.currentTime });
        }
        animationFrameId = requestAnimationFrame(renderPreviewFrame);
    }

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
    
    function parseVTT(vtt){ const lines=vtt.trim().split(/\r?\n/),cues=[];for(let i=0;i<lines.length;i++){if(lines[i].includes("-->")){const[start,end]=lines[i].split(" --> ").map(timeToSeconds);let text="";for(let j=i+1;lines[j]&&lines[j].trim()!=="";j++)text+=lines[j]+"\n";if(start!=null&&end!=null)cues.push({start,end,text:text.trim()});i=lines.findIndex((l,idx)=>idx>i&&l.trim()==="")||lines.length}}return cues}
    function timeToSeconds(t){try{const p=t.trim().split(":");return p.length===3?+p[0]*3600+ +p[1]*60+ +p[2]:+p[0]*60+ +p[1]}catch{return null}}
    function formatTime(t){if(isNaN(t))return"0:00";const m=Math.floor(t/60),s=Math.floor(t%60);return`${m}:${s.toString().padStart(2,"0")}`}
    function downloadBlob(b,f){const u=URL.createObjectURL(b),a=document.createElement("a");a.style.display="none",a.href=u,a.download=f,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(u)}
});