//B"H
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements (these are all correct)
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
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontColorPicker = document.getElementById('font-color-picker');
    const highlightColorPicker = document.getElementById('highlight-color-picker');
    const textAlignSelect = document.getElementById('text-align-select');

    let cues = [];
    let currentCueIndex = -1;

    // --- File and Text Input Handling (Unchanged) ---
    audioInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            audioPlayer.src = URL.createObjectURL(file);
            audioFileNameDisplay.textContent = file.name;
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
                lyricsDisplay.innerHTML = `<p>Ready to play.</p>`;
            };
            reader.readAsText(file);
        }
    });

    vttTextInput.addEventListener('input', () => {
        cues = parseVTT(vttTextInput.value);
        lyricsDisplay.innerHTML = `<p>Ready to play.</p>`;
        vttFileNameDisplay.textContent = 'Pasted content';
        currentCueIndex = -1;
    });

    // --- VTT Parsing Logic (THIS FUNCTION IS NOW FIXED) ---
    function parseVTT(vttContent) {
        // Use a regex to split by newlines, handling both Windows (\r\n) and Unix (\n) line endings
        const lines = vttContent.trim().split(/\r?\n/);
        const parsedCues = [];
        let i = 0;
        
        while (i < lines.length) {
            // Find the next line that contains a timestamp
            if (lines[i] && lines[i].includes('-->')) {
                const timeLine = lines[i];
                const [start, end] = timeLine.split(' --> ').map(timeToSeconds);
                
                let text = '';
                i++; // Move to the line after the timestamp

                // --- THIS IS THE LINE THAT FIXES THE PARSING BUG ---
                // Collect text lines until we hit a blank line OR the next timestamp
                while (lines[i] && lines[i].trim() !== '' && !lines[i].includes('-->')) {
                    text += lines[i] + '\n';
                    i++;
                }

                if (start !== null && end !== null) {
                    parsedCues.push({ start, end, text: text.trim() });
                }
                // Don't increment i here, because the outer loop will handle it
                continue; 
            }
            i++;
        }
        console.log("Parsed Cues:", parsedCues); // For debugging
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

    // --- Audio Player Controls & Synchronization (Unchanged from previous fix) ---
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

    function updateLyrics(currentTime) {
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
        if (newCueIndex !== currentCueIndex) {
            if (newCueIndex !== -1) {
                const activeCue = cues[newCueIndex];
                lyricsDisplay.innerHTML = `<p>${activeCue.text.replace(/\n/g, '<br>')}</p>`;
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
    
    // --- Settings Panel Logic (Unchanged) ---
    function applyStyles() {
        const root = document.documentElement;
        root.style.setProperty('--lyrics-font-size', `${fontSizeSlider.value}px`);
        root.style.setProperty('--lyrics-font-color', fontColorPicker.value);
        root.style.setProperty('--lyrics-highlight-color', highlightColorPicker.value);
        root.style.setProperty('--lyrics-text-align', textAlignSelect.value);
    }

    fontSizeSlider.addEventListener('input', applyStyles);
    fontColorPicker.addEventListener('input', applyStyles);
    highlightColorPicker.addEventListener('input', applyStyles);
    textAlignSelect.addEventListener('change', applyStyles);

    applyStyles();
});