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
    let currentCueIndex = -1; // Used to track the currently displayed cue

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
        currentCueIndex = -1; // Reset tracker
    });

    // --- VTT Parsing Logic (Unchanged) ---
    function parseVTT(vttContent) {
        const lines = vttContent.trim().split('\n');
        const parsedCues = [];
        let i = 0;
        if (!lines[0].startsWith('WEBVTT')) {
             console.warn("VTT content might be missing the WEBVTT header.");
        }
        
        while (i < lines.length) {
            if (lines[i].includes('-->')) {
                const timeLine = lines[i];
                const [start, end] = timeLine.split(' --> ').map(timeToSeconds);
                
                let text = '';
                i++;
                while (lines[i] && lines[i].trim() !== '') {
                    text += lines[i] + '\n';
                    i++;
                }

                if (start !== null && end !== null) {
                    parsedCues.push({ start, end, text: text.trim() });
                }
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
            return seconds;
        } catch (error) {
            console.error("Error parsing time:", timeStr, error);
            return null;
        }
    }

    // --- Audio Player Controls (Unchanged) ---
    playPauseBtn.addEventListener('click', () => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause());
    audioPlayer.addEventListener('play', () => playPauseIcon.className = 'fas fa-pause');
    audioPlayer.addEventListener('pause', () => playPauseIcon.className = 'fas fa-play');
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => audioPlayer.currentTime = progressBar.value);

    // --- Time Update and Synchronization ---
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        updateLyrics(audioPlayer.currentTime);
    });

    // --- THIS FUNCTION HAS BEEN COMPLETELY REWRITTEN FOR THE FIX ---
    function updateLyrics(currentTime) {
        // Find the index of the cue that should be active at the current time
        const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);

        // Only update the display if the active cue has changed
        if (newCueIndex !== currentCueIndex) {
            // If a new cue is active (index is not -1)
            if (newCueIndex !== -1) {
                const activeCue = cues[newCueIndex];
                // Display ONLY the text of the new active cue
                lyricsDisplay.innerHTML = `<p>${activeCue.text.replace(/\n/g, '<br>')}</p>`;
            } else {
                // If no cue is active (the time is between cues), clear the display
                lyricsDisplay.innerHTML = "";
            }
            // Update the tracker to the new index
            currentCueIndex = newCueIndex;
        }
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // --- Settings Panel Logic (Unchanged) ---
    function applyStyles() {
        const root = document.documentElement;
        root.style.setProperty('--lyrics-font-size', `${fontSizeSlider.value}px`);
        root.style.setProperty('--lyrics-font-color', fontColorPicker.value);
        root.style.setProperty('--lyrics-highlight-color', highlightColorPicker.value); // Highlight color is now unused but kept for future features
        root.style.setProperty('--lyrics-text-align', textAlignSelect.value);
    }

    fontSizeSlider.addEventListener('input', applyStyles);
    fontColorPicker.addEventListener('input', applyStyles);
    highlightColorPicker.addEventListener('input', applyStyles);
    textAlignSelect.addEventListener('change', applyStyles);

    applyStyles();
});