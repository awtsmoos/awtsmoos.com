//B"H
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // Settings Panel Elements
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontColorPicker = document.getElementById('font-color-picker');
    const highlightColorPicker = document.getElementById('highlight-color-picker');
    const textAlignSelect = document.getElementById('text-align-select');
    
    let cues = [];
    let currentCueIndex = -1;

    // --- File and Text Input Handling ---
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
    });

    // --- VTT Parsing Logic ---
    function parseVTT(vttContent) {
        const lines = vttContent.trim().split('\n');
        const parsedCues = [];
        let i = 0;
        
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
        const parts = timeStr.split(':');
        let seconds = 0;
        try {
            if (parts.length === 3) { // HH:MM:SS.ms
                seconds += parseFloat(parts[0]) * 3600;
                seconds += parseFloat(parts[1]) * 60;
                seconds += parseFloat(parts[2]);
            } else { // MM:SS.ms
                seconds += parseFloat(parts[0]) * 60;
                seconds += parseFloat(parts[1]);
            }
            return seconds;
        } catch (error) {
            console.error("Error parsing time:", timeStr, error);
            return null;
        }
    }

    // --- Audio Player Controls & Synchronization ---
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });

    audioPlayer.addEventListener('play', () => {
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    });

    audioPlayer.addEventListener('pause', () => {
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime;
        progressBar.value = currentTime;
        currentTimeDisplay.textContent = formatTime(currentTime);
        updateLyrics(currentTime);
    });

    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });

    function updateLyrics(currentTime) {
        const activeCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime <= cue.end);

        if (activeCueIndex !== -1 && activeCueIndex !== currentCueIndex) {
            currentCueIndex = activeCueIndex;
            const activeCue = cues[currentCueIndex];
            
            // Display previous, current, and next lines for context (optional, but a nice touch)
            let html = '';
            const prevCue = cues[currentCueIndex - 1];
            const nextCue = cues[currentCueIndex + 1];

            if (prevCue) {
                html += `<p style="opacity: 0.5;">${prevCue.text.replace(/\n/g, '<br>')}</p>`;
            }
            
            html += `<p class="active-cue">${activeCue.text.replace(/\n/g, '<br>')}</p>`;

            if (nextCue) {
                html += `<p style="opacity: 0.5;">${nextCue.text.replace(/\n/g, '<br>')}</p>`;
            }
            
            lyricsDisplay.innerHTML = html;

        } else if (activeCueIndex === -1 && currentCueIndex !== -1) {
            // No active cue, maybe between cues, so we can clear or keep the last one.
            // For now, let's just keep the context but remove the highlight.
            if(lyricsDisplay.querySelector('.active-cue')) {
                lyricsDisplay.querySelector('.active-cue').classList.remove('active-cue');
            }
            currentCueIndex = -1;
        }
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // --- Settings Panel Logic ---
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

    // Initial style application
    applyStyles();
});
