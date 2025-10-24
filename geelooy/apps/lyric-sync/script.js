// B"H
// - Definitive Main Script v3: Full localStorage Persistence + Image Backgrounds

document.addEventListener('DOMContentLoaded', () => {
	// --- DOM ELEMENT REFERENCES ---
	// Group all references for clarity and easy access.
	const imageInput = document.getElementById('image-input');
	const audioInput = document.getElementById('audio-input');
	const vttFileInput = document.getElementById('vtt-file-input');
	const vttTextInput = document.getElementById('vtt-text-input');
	const audioPlayer = document.getElementById('audio-player');
	const playPauseBtn = document.getElementById('play-pause-btn');
	const playPauseIcon = playPauseBtn.querySelector('i');
	const progressBar = document.getElementById('progress-bar');
	const currentTimeDisplay = document.getElementById('current-time-display');
	const durationDisplay = document.getElementById('duration-display');
	const imageFileNameDisplay = document.getElementById('image-file-name');
	const audioFileNameDisplay = document.getElementById('audio-file-name');
	const vttFileNameDisplay = document.getElementById('vtt-file-name');
	const lyricsDisplay = document.getElementById('lyrics-display');
	const exportBtn = document.getElementById('export-btn');
	const exportOverlay = document.getElementById('export-overlay');
	const exportStatus = document.getElementById('export-status');
	const exportProgressBar = document.getElementById('export-progress-bar');
	const settingsPanel = document.querySelector('.settings-panel');

	// Central object for all UI controls that need to be saved/loaded.
	// The key MUST match the element's ID.
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
		maxDuration: document.getElementById('max-duration'),
		bloomIntensity: document.getElementById('bloom-intensity'),
		filmGrain: document.getElementById('film-grain'),
		vignetteIntensity: document.getElementById('vignette-intensity')
	};

	// --- APPLICATION STATE ---
	let cues = [];
	let currentCueIndex = -1;
	let audioFile = null;
	let imageFiles = [];

	// --- B"H - SETTINGS PERSISTENCE FUNCTIONS ---

	/**
	 * Saves the current state of all UI controls to the browser's local storage.
	 * This is triggered automatically on any input change within the settings panel.
	 */
	function saveSettings() {
		try {
			const settingsToSave = {};
			for (const key in settingsInputs) {
				const el = settingsInputs[key];
				settingsToSave[key] = el.type === 'checkbox' ? el.checked : el.value;
			}
			localStorage.setItem('lyricSyncEngineSettings', JSON.stringify(settingsToSave));
		} catch (e) {
			console.warn("Could not save settings to localStorage. It might be full or disabled.", e);
		}
	}

	/**
	 * Loads settings from local storage and applies them to the UI controls.
	 * This runs once when the application starts.
	 */
	function loadSettings() {
		const savedSettings = localStorage.getItem('lyricSyncEngineSettings');
		if (!savedSettings) return;

		try {
			const settings = JSON.parse(savedSettings);
			for (const key in settings) {
				if (settingsInputs[key]) {
					const el = settingsInputs[key];
					el.value = settings[key];
					// IMPORTANT: Dispatch an event to ensure UI updates, like range slider value displays.
					el.dispatchEvent(new Event('input', {
						bubbles: true
					}));
				}
			}
			console.log('B"H', "- Successfully loaded settings from browser storage.");
		} catch (e) {
			console.error("Failed to load or parse settings from localStorage.", e);
		}
	}


	// --- EVENT LISTENERS ---

	imageInput.addEventListener('change', (e) => {
		imageFiles = Array.from(e.target.files);
		imageFileNameDisplay.textContent = imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : 'No images chosen';
	});

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

	playPauseBtn.addEventListener('click', () => {
		audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
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
	audioPlayer.addEventListener('timeupdate', () => {
		progressBar.value = audioPlayer.currentTime;
		currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
		updateLyrics(audioPlayer.currentTime);
	});

	// Attach a single listener to the settings panel to save on any change.
	settingsPanel.addEventListener('input', saveSettings);

	// --- EXPORT FUNCTIONALITY ---
	exportBtn.addEventListener('click', async () => {
		if (!audioFile || cues.length === 0) {
			alert('Please load an audio file and VTT content before exporting.');
			return;
		}

		exportOverlay.classList.remove('hidden');
		exportStatus.textContent = 'Preparing export...';
		exportProgressBar.style.width = '0%';

		try {
			exportStatus.textContent = 'Processing images...';
			const imageBitmaps = await Promise.all(
				imageFiles.map(file => createImageBitmap(file))
			);

			exportStatus.textContent = 'Analyzing audio...';
			const tempAudioContext = new AudioContext();
			const arrayBuffer = await audioFile.arrayBuffer();
			const audioBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);

			const settings = collectSettings();
			let finalAudioBuffer = audioBuffer;
			const maxDuration = settings.maxDuration;

			if (maxDuration > 0 && maxDuration < audioBuffer.duration) {
				exportStatus.textContent = `Trimming audio to ${maxDuration} seconds...`;
				const newSampleLength = Math.floor(maxDuration * audioBuffer.sampleRate);
				const trimmedBuffer = tempAudioContext.createBuffer(audioBuffer.numberOfChannels, newSampleLength, audioBuffer.sampleRate);
				for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
					trimmedBuffer.copyToChannel(audioBuffer.getChannelData(i).slice(0, newSampleLength), i);
				}
				finalAudioBuffer = trimmedBuffer;
			}

			const audioBufferShim = {
				sampleRate: finalAudioBuffer.sampleRate,
				duration: finalAudioBuffer.duration,
				length: finalAudioBuffer.length,
				numberOfChannels: finalAudioBuffer.numberOfChannels,
				channels: Array.from({
					length: finalAudioBuffer.numberOfChannels
				}, (_, i) => finalAudioBuffer.getChannelData(i)),
			};

			const worker = new Worker('video-worker.js');
			worker.onmessage = ({
				data
			}) => {
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
						alert(`A critical error occurred: ${data.payload.message}`);
						exportOverlay.classList.add('hidden');
						worker.terminate();
						break;
				}
			};

			worker.postMessage({
				cues,
				audioBufferShim,
				settings,
				imageBitmaps
			}, imageBitmaps);

		} catch (error) {
			console.error("Export preparation failed:", error);
			alert(`Failed to prepare data for export: ${error.message}`);
			exportOverlay.classList.add('hidden');
		}
	});

	// --- HELPER & UTILITY FUNCTIONS ---

	function collectSettings() {
		const s = {};
		for (const key in settingsInputs) {
			s[key] = settingsInputs[key].type === 'range' ? parseFloat(settingsInputs[key].value) : settingsInputs[key].value;
		}
		return {
			resolution: {
				width: parseInt(s.resWidth),
				height: parseInt(s.resHeight)
			},
			maxDuration: s.maxDuration,
			waveformThickness: s.waveformThickness,
			waveformHeight: s.waveformHeight,
			font: {
				size: s.fontSize,
				color: s.fontColor,
				align: s.textAlign,
				borderWidth: s.borderWidth,
				borderColor: s.borderColor
			},
			particles: {
				density: parseInt(s.particleDensity),
				baseSize: s.particleSize,
				variation: s.particleVariation,
				chars: Array.from(s.particles) // Emoji-safe character splitting
			},
			boxColor: s.boxColor,
			boxOpacity: s.boxOpacity,
			effects: {
				bloom: s.bloomIntensity,
				grain: s.filmGrain,
				vignette: s.vignetteIntensity
			}
		};
	}

	function updateLyrics(currentTime) {
		const newCueIndex = cues.findIndex(cue => currentTime >= cue.start && currentTime < cue.end);
		if (newCueIndex !== currentCueIndex) {
			lyricsDisplay.innerHTML = (newCueIndex !== -1) ?
				`<p>${cues[newCueIndex].text.replace(/\n/g, '<br>')}</p>` :
				'<p>...</p>';
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
				cues.push({
					start,
					end,
					text: text.trim()
				});
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

	// --- INITIALIZATION ---
	loadSettings(); // Load all user settings from their last session on startup.
});