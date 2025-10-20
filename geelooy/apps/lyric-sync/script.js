// B"H - Definitive Main Script: Stable Foundation, No Visuals, No Crashes

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
    
    // We are now only using the simple HTML div for lyrics.
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
            audioPlayer.src = URL.createObjectURL(audioFile);
            audioFileNameDisplay.textContent = audioFile.name;
            audioPlayer.load();
        }
    });

    vttFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // FIX: Ensure the file name is displayed immediately.
            vttFileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                const vttContent = event.target.result;
                vttTextInput.value = vttContent;
                cues = parseVTT(vttContent); // Use the new, safe parser
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', (e) => {
        vttFileNameDisplay.textContent = 'Pasted content';
        cues = parseVTT(e.target.value); // Use the new, safe parser
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

    // --- THE DEFINITIVE, CRASH-PROOF VTT PARSER ---
    function parseVTT(vttContent) {
        if (!vttContent || typeof vttContent !== 'string') return [];
        
        const lines = vttContent.trim().replace(/\r/g, '').split('\n');
        const cues = [];
        let i = 0;

        while (i < lines.length) {
            // Find the next line that contains a timestamp
            const timeLineIndex = lines.findIndex((line, index) => index >= i && line.includes('-->'));

            if (timeLineIndex === -1) {
                // No more timestamps found, we are done.
                break;
            }

            const [start, end] = lines[timeLineIndex].split(' --> ').map(timeToSeconds);

            let text = '';
            let j = timeLineIndex + 1;
            // Collect text lines until we hit a blank line or the end of the file
            while (j < lines.length && lines[j].trim() !== '') {
                text += lines[j] + '\n';
                j++;
            }

            if (start != null && end != null) {
                cues.push({ start, end, text: text.trim() });
            }

            // Safely advance the main index past the block we just processed.
            // This is guaranteed to move forward and cannot cause an infinite loop.
            i = j;
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
            currentCueIndex = newCueIndex;
        }
    }

    // --- UTILITY FUNCTIONS ---
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

    // Export is disabled for now to guarantee stability.
    exportBtn.addEventListener('click', () => {
        alert("We are on a stable foundation. The export feature will be re-enabled next.");
    });
});