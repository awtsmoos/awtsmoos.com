// B"H - Definitive Main Script: Stable Foundation, No Live Visuals, No Crashes

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
    
    // We are now only using the simple HTML div for lyrics, no canvas.
    const lyricsDisplay = document.getElementById('lyrics-display');

    const exportBtn = document.getElementById('export-btn');

    // --- APPLICATION STATE ---
    let cues = [];
    let currentCueIndex = -1;
    let audioFile = null;

    // --- EVENT LISTENERS ---

    audioInput.addEventListener('change', (e) => {
        audioFile = e.target.files[0];
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            audioPlayer.src = url;
            audioFileNameDisplay.textContent = audioFile.name;
            audioPlayer.load();
        }
    });

    vttFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const vttContent = event.target.result;
                vttTextInput.value = vttContent;
                vttFileNameDisplay.textContent = file.name;
                // Process the content using the new, safe parser
                cues = parseVTT(vttContent);
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', (e) => {
        const vttContent = e.target.value;
        vttFileNameDisplay.textContent = 'Pasted content';
        // Process the content using the new, safe parser
        cues = parseVTT(vttContent);
    });
    
    // --- PLAYER CONTROLS (SIMPLIFIED) ---

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });
    
    audioPlayer.addEventListener('play', () => {
        playPauseIcon.className = 'fas fa-pause';
    });
    
    audioPlayer.addEventListener('pause', () => {
        playPauseIcon.className = 'fas fa-play';
    });

    audioPlayer.addEventListener('ended', () => {
        playPauseIcon.className = 'fas fa-play';
    });
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    
    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });
    
    // The timeupdate listener now only updates the progress bar and the simple HTML lyrics.
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        updateLyrics(audioPlayer.currentTime);
    });

    // --- STABLE VTT PARSER (INFINITE LOOP FIXED) ---
    function parseVTT(vttContent) {
        if (!vttContent) return [];
        
        const lines = vttContent.trim().replace(/\r/g, '').split('\n');
        const cues = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                const [start, end] = lines[i].split(' --> ').map(timeToSeconds);
                
                let text = '';
                let j = i + 1;
                // Collect text lines until we hit a blank line or the end of the file
                while (j < lines.length && lines[j].trim() !== '') {
                    text += lines[j] + '\n';
                    j++;
                }

                if (start != null && end != null) {
                    cues.push({ start, end, text: text.trim() });
                }

                // THIS IS THE FIX:
                // We safely jump the main loop index 'i' to the position right after
                // the text we just processed. This is guaranteed to move forward
                // and can never cause an infinite loop.
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
            } else {
                // To keep the caption on screen, we simply don't clear it.
                // If you want it to clear in silent parts, uncomment the next line:
                // lyricsDisplay.innerHTML = "";
            }
            currentCueIndex = newCueIndex;
        }
    }

    // --- UTILITY FUNCTIONS ---
    function timeToSeconds(t) {
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

    // The export button is currently disabled by removing its logic.
    // We can add it back once this foundation is confirmed to be stable.
    exportBtn.addEventListener('click', () => {
        alert("Visual preview is disabled. Export functionality will be restored once the core is stable.");
    });
});