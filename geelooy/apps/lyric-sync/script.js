// B"H - Definitive Main Script: Stable, High-Performance, All Visuals

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
    const ctx = previewCanvas.getContext('2d');
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
    let lastActiveCue = null;
    let audioFile = null;
    let audioContext, analyser, sourceNode, dataArray;
    let particleSystem;
    let animationFrameId = null;
    const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
    const EMOJI_FALLBACK_FONT = 'sans-serif';

    // --- CORE PERFORMANCE FIX: CANVAS RESIZING ---
    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = previewCanvas.getBoundingClientRect();
        previewCanvas.width = rect.width * dpr;
        previewCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Resize once on startup

    // --- AUDIO & VTT SETUP ---
    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            audioPlayer.src = url;
            audioFileNameDisplay.textContent = audioFile.name;
            setupAudioAnalysis();
            audioPlayer.load();
        }
    });

    vttFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                vttTextInput.value = event.target.result;
                cues = parseVTT(event.target.result);
                vttFileNameDisplay.textContent = file.name;
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', () => {
        cues = parseVTT(vttTextInput.value);
        vttFileNameDisplay.textContent = 'Pasted content';
    });
    
    function setupAudioAnalysis() {
        if (audioContext) audioContext.close();
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        sourceNode = audioContext.createMediaElementSource(audioPlayer);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    
    // --- PLAYER CONTROLS & ANIMATION LOOP ---
    playPauseBtn.addEventListener('click', () => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause());
    
    audioPlayer.addEventListener('play', () => {
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
        playPauseIcon.className = 'fas fa-pause';
        resizeCanvas(); // Ensure canvas is correctly sized before starting
        if (!particleSystem) { // Initialize particle system on first play
             particleSystem = new ParticleSystem(collectSettings().particles, {width: previewCanvas.width, height: previewCanvas.height});
        }
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        renderPreviewFrame();
    });

    const stopAnimation = () => {
        playPauseIcon.className = 'fas fa-play';
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    };
    audioPlayer.addEventListener('pause', stopAnimation);
    audioPlayer.addEventListener('ended', stopAnimation);
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    
    progressBar.addEventListener('input', () => audioPlayer.currentTime = progressBar.value);
    
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    // --- MAIN RENDERING LOOP (STABLE) ---
    function renderPreviewFrame() {
        animationFrameId = requestAnimationFrame(renderPreviewFrame);

        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray); // Use frequency data for better volume representation
        let volume = dataArray.reduce((a, b) => a + b, 0) / (dataArray.length * 128) - 1.0;
        volume = Math.max(0.01, volume * 2.0); // Amplify and clamp

        const settings = collectSettings();
        const width = previewCanvas.width / (window.devicePixelRatio || 1);
        const height = previewCanvas.height / (window.devicePixelRatio || 1);
        const time = audioPlayer.currentTime;

        ctx.clearRect(0, 0, width, height);

        if (particleSystem && settings.particles.density !== particleSystem.settings.density) {
            particleSystem = new ParticleSystem(settings.particles, {width, height});
        }
        if (particleSystem) particleSystem.updateAndDraw(ctx, volume);
        
        drawWaveform(ctx, time, width, height, settings, volume);

        const currentCue = cues.find(cue => time >= cue.start && time < cue.end);
        if (currentCue) lastActiveCue = currentCue;

        if (lastActiveCue) {
            const boxSize = width * 0.9;
            const r = parseInt(settings.boxColor.substr(1, 2), 16), g = parseInt(settings.boxColor.substr(3, 2), 16), b = parseInt(settings.boxColor.substr(5, 2), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${settings.boxOpacity})`;
            ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
            wrapText(ctx, lastActiveCue.text, width / 2, height / 2, boxSize, boxSize, settings.font, height / 720);
        }
    }

    // --- VISUAL EFFECTS FOR PREVIEW ---

    function drawWaveform(ctx, time, width, height, settings, volume) {
        // This is a direct port of the high-quality worker waveform
        const { waveformHeight, waveformThickness } = settings;
        if (waveformHeight <= 0) return;

        const maxAmplitude = height * (waveformHeight / 100);
        const amplitude = maxAmplitude * (volume ** 1.5);
        const undulation = Math.sin(time * 0.7) * (height * 0.015);
        const baseY = height * 0.85 + undulation;

        const createPath = () => {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 15) {
                const mainWave = Math.sin(x * 0.01 + time * 4) * 0.5;
                const detailWave = Math.sin(x * 0.03 + time * 9) * 0.3;
                const staticWave = Math.sin(x * 0.1 + time * 20) * 0.2;
                const yOffset = (mainWave + detailWave + staticWave) * amplitude;
                const finalY = baseY + yOffset;
                x === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY);
            }
        };
        
        const colorIntensity = 200 + Math.floor(volume * 55);
        const glowColor = `rgba(${colorIntensity - 50}, ${colorIntensity - 20}, 255, ${0.3 * volume})`;
        const mainColor = `rgba(${colorIntensity}, ${colorIntensity}, 255, ${0.6 * volume + 0.2})`;

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = waveformThickness * 3;
        createPath();
        ctx.stroke();

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = waveformThickness;
        createPath();
        ctx.stroke();
    }

    class ParticleSystem {
        // Direct port of the high-quality worker particle system
        constructor(settings, resolution) {
            this.settings = settings;
            this.width = resolution.width;
            this.height = resolution.height;
            this.sizeScalar = Math.max(1.0, this.height / 720);
            this.particles = Array.from({ length: this.settings.density || 0 }, () => this.createParticle({}));
        }
        createParticle(p = {}, options = {}) {
            const { isSubParticle = false, x, y } = options;
            p.x = x !== undefined ? x : Math.random() * this.width;
            p.y = y !== undefined ? y : this.height + Math.random() * 20;
            if (isSubParticle) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 4;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.life = 60;
            } else {
                p.vx = (Math.random() - 0.5) * 2;
                p.vy = -(Math.random() * 2.0 + 1.5);
                p.life = Infinity;
            }
            const baseSize = Math.max(5, (this.settings.baseSize || 20) + (Math.random() - 0.5) * (this.settings.variation || 15));
            p.size = baseSize * this.sizeScalar;
            if (isSubParticle) p.size *= 0.6;
            p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
            p.hue = Math.random() * 360;
            p.opacity = 0.6 + Math.random() * 0.4;
            return p;
        }
        updateAndDraw(ctx, volume) {
            const earthquakeAmount = (volume ** 2) * 70;
            const explosionChance = 0.002 + (volume * 0.02);
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                if (p.life !== Infinity) p.life--;
                if (p.life <= 0) { this.particles.splice(i, 1); continue; }
                if (p.life === Infinity && Math.random() < explosionChance) {
                    for (let j = 0; j < 7; j++) this.particles.push(this.createParticle({}, { isSubParticle: true, x: p.x, y: p.y }));
                    this.createParticle(p);
                    continue;
                }
                p.x += p.vx;
                p.y += p.vy;
                if (p.life === Infinity && p.y < -p.size) this.createParticle(p);
                const jiggleX = (Math.random() - 0.5) * earthquakeAmount;
                const jiggleY = (Math.random() - 0.5) * earthquakeAmount;
                const opacity = (p.life < 30) ? p.opacity * (p.life / 30) : p.opacity;
                ctx.save();
                ctx.translate(p.x + jiggleX, p.y + jiggleY);
                ctx.rotate((p.x + p.y) * 0.02);
                ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
                ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${opacity})`;
                ctx.fillText(p.char, 0, 0);
                ctx.restore();
            }
            this.drawLightning(ctx);
        }
        drawLightning(ctx) {
            const checks = 3;
            for (let i = 0; i < checks; i++) {
                const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
                const p2 = this.particles[Math.floor(Math.random() * this.particles.length)];
                if (p1 && p2 && p1 !== p2 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < this.width * 0.35) {
                    const createPath = () => {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        for (let j = 1; j <= 3; j++) ctx.lineTo(p1.x + (p2.x - p1.x) * (j / 4) + (Math.random() - 0.5) * 25, p1.y + (p2.y - p1.y) * (j / 4) + (Math.random() - 0.5) * 25);
                        ctx.lineTo(p2.x, p2.y);
                    };
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                    ctx.lineWidth = 3;
                    createPath();
                    ctx.stroke();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.lineWidth = 1;
                    createPath();
                    ctx.stroke();
                }
            }
        }
    }
    
    // --- EXPORT ---
    
    exportBtn.addEventListener('click', async () => {
        if (!audioFile || cues.length === 0) {
            alert('Please load an audio file and VTT content before exporting.');
            return;
        }

        exportOverlay.classList.remove('hidden');
        exportStatus.textContent = 'Decoding audio for export...';
        exportProgressBar.style.width = '5%';

        try {
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
                        exportProgressBar.style.width = `${5 + data.payload.progress * 0.95}%`; // Scale progress
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
                settings: collectSettings()
            }, transferList);

        } catch (error) {
            alert(`Failed to prepare data for export: ${error.message}`);
            exportOverlay.classList.add('hidden');
        }
    });

    // --- UTILITY FUNCTIONS ---
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
    function getWrappedLines(ctx,text,maxWidth){const lines=text.split("\n");let allLines=[];lines.forEach(line=>{let currentLine="",words=line.split(" ");for(let i=0;i<words.length;i++){let testLine=currentLine+(currentLine?" ":"")+words[i];i>0&&ctx.measureText(testLine).width>maxWidth?(allLines.push(currentLine),currentLine=words[i]):currentLine=testLine}allLines.push(currentLine)});return allLines}
    function wrapText(ctx,text,x,y,maxWidth,maxHeight,fontSettings,scaleFactor){let scaledFontSize=fontSettings.size*scaleFactor;while(scaledFontSize>5){ctx.font=`bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;const lines=getWrappedLines(ctx,text,maxWidth*.95);if(lines.length*scaledFontSize*1.4<maxHeight*.95)break;scaledFontSize-=1}ctx.direction="ltr",ctx.font=`bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`,ctx.textAlign=fontSettings.align;const lines=getWrappedLines(ctx,text,maxWidth*.95),lineHeight=1.4*scaledFontSize,startY=y-(lines.length-1)*lineHeight/2+.3*scaledFontSize;lines.forEach((line,i)=>{const currentY=startY+i*lineHeight;fontSettings.borderWidth>0&&(ctx.strokeStyle=fontSettings.borderColor,ctx.lineWidth=fontSettings.borderWidth*scaleFactor*2,ctx.strokeText(line,x,currentY)),ctx.fillStyle=fontSettings.color,ctx.fillText(line,x,currentY)})}
});