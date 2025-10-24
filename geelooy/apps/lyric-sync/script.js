// B"H
// - Definitive Main Script v4: Karaoke VTT Parser + Full localStorage Persistence

document.addEventListener('DOMContentLoaded', () => {
	// --- DOM ELEMENT REFERENCES ---
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
		particleSpeed: document.getElementById('particle-speed'),
		particleSpeedVariation: document.getElementById('particle-speed-variation'),
		waveformHeight: document.getElementById('waveform-height'),
		waveformThickness: document.getElementById('waveform-thickness'),
		particles: document.getElementById('custom-particles'),
		resWidth: document.getElementById('resolution-width'),
		resHeight: document.getElementById('resolution-height'),
		maxDuration: document.getElementById('max-duration'),
		bloomIntensity: document.getElementById('bloom-intensity'),
		filmGrain: document.getElementById('film-grain'),
	};

	// --- APPLICATION STATE ---
	let cues = [];
	let currentCueIndex = -1;
	let audioFile = null;
	let imageFiles = [];

	// --- B"H - SETTINGS PERSISTENCE ---
	function saveSettings() {
		try {
			const s = {};
			for (const k in settingsInputs) {
				s[k] = settingsInputs[k].value;
			}
			localStorage.setItem('lyricSyncEngineSettings', JSON.stringify(s));
		} catch (e) {
			console.warn("Could not save settings.", e);
		}
	}

	function loadSettings() {
		const s = localStorage.getItem('lyricSyncEngineSettings');
		if (!s) return;
		try {
			const settings = JSON.parse(s);
			for (const k in settings) {
				if (settingsInputs[k]) {
					settingsInputs[k].value = settings[k];
					settingsInputs[k].dispatchEvent(new Event('input', {
						bubbles: true
					}));
				}
			}
			console.log("B\"H - Settings loaded.");
		} catch (e) {
			console.error("Failed to load settings.", e);
		}
	}

	// --- EVENT LISTENERS ---
	imageInput.addEventListener('change', (e) => {
		imageFiles = Array.from(e.target.files);
		imageFileNameDisplay.textContent = imageFiles.length > 0 ? `${imageFiles.length} image(s)` : 'No images';
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
		const f = e.target.files[0];
		if (f) {
			vttFileNameDisplay.textContent = f.name;
			const r = new FileReader();
			r.onload = (ev) => {
				vttTextInput.value = ev.target.result;
				cues = parseVTT(ev.target.result);
			};
			r.readAsText(f);
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
	settingsPanel.addEventListener('input', saveSettings);

	// --- EXPORT FUNCTIONALITY ---
	exportBtn.addEventListener('click', async () => {
		if (!audioFile || cues.length === 0) {
			alert('Please load an audio file and VTT content.');
			return;
		}
		exportOverlay.classList.remove('hidden');
		exportStatus.textContent = 'Preparing...';
		exportProgressBar.style.width = '0%';
		try {
			exportStatus.textContent = 'Processing images...';
			const imageBitmaps = await Promise.all(imageFiles.map(f => createImageBitmap(f)));
			exportStatus.textContent = 'Analyzing audio...';
			const audioCtx = new AudioContext();
			const arrayBuffer = await audioFile.arrayBuffer();
			const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
			const settings = collectSettings();
			let finalAudioBuffer = audioBuffer;
			if (settings.maxDuration > 0 && settings.maxDuration < audioBuffer.duration) {
				exportStatus.textContent = `Trimming audio...`;
				const newLen = Math.floor(settings.maxDuration * audioBuffer.sampleRate);
				const tB = audioCtx.createBuffer(audioBuffer.numberOfChannels, newLen, audioBuffer.sampleRate);
				for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
					tB.copyToChannel(audioBuffer.getChannelData(i).slice(0, newLen), i);
				}
				finalAudioBuffer = tB;
			}
			const audioShim = {
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
						alert(`Error: ${data.payload.message}`);
						exportOverlay.classList.add('hidden');
						worker.terminate();
						break;
				}
			};
			worker.postMessage({
				cues,
				audioBufferShim: audioShim,
				settings,
				imageBitmaps
			}, imageBitmaps);
		} catch (e) {
			console.error("Export failed:", e);
			alert(`Export failed: ${e.message}`);
			exportOverlay.classList.add('hidden');
		}
	});

	// --- B"H - ADVANCED KARAOKE-AWARE VTT PARSER ---
	function parseVTT(vttContent) {
		if (!vttContent || typeof vttContent !== 'string') return [];
		const lines = vttContent.trim().replace(/\r/g, '').split('\n');
		const parsedCues = [];
		let i = 0;
		while (i < lines.length) {
			if (!lines[i].includes('-->')) {
				i++;
				continue;
			}
			const timeLine = lines[i];
			const [start, end] = timeLine.split(' --> ').map(timeToSeconds);
			let textLines = [];
			let j = i + 1;
			while (j < lines.length && lines[j] && lines[j].trim() !== '') {
				textLines.push(lines[j]);
				j++;
			}
			const fullText = textLines.join('\n');
			const cue = {
				start,
				end,
				text: fullText.replace(/<.*?>/g, ''),
				words: []
			};

			// Karaoke parsing logic
			const karaokeTagRegex = /<c(?:\.time=([\d.]+))?>(.*?)<\/c>/g;
			if (fullText.includes('<c')) {
				let match;
				let lastWordEndTime = start;
				const tempWords = [];

				while ((match = karaokeTagRegex.exec(fullText)) !== null) {
					const wordStartTime = match[1] ? timeToSeconds(match[1]) : lastWordEndTime;
					const wordText = match[2];
					tempWords.push({
						text: wordText,
						start: wordStartTime
					});
				}

				if (tempWords.length > 0) {
					for (let k = 0; k < tempWords.length; k++) {
						const currentWord = tempWords[k];
						const nextWord = tempWords[k + 1];
						currentWord.end = nextWord ? nextWord.start : end;
						cue.words.push(currentWord);
						lastWordEndTime = currentWord.end;
					}
				}
			}

			if (start != null && end != null) {
				parsedCues.push(cue);
			}
			i = j;
		}
		return parsedCues;
	}

	// --- HELPER & UTILITY FUNCTIONS ---
	function collectSettings() {
		const s = {};
		for (const k in settingsInputs) {
			s[k] = settingsInputs[k].type === 'range' ? parseFloat(settingsInputs[k].value) : settingsInputs[k].value;
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
				speed: s.particleSpeed,
				speedVariation: s.particleSpeedVariation,
				chars: Array.from(s.particles)
			},
			boxColor: s.boxColor,
			boxOpacity: s.boxOpacity,
			effects: {
				bloom: s.bloomIntensity,
				grain: s.filmGrain
			}
		};
	}

	function updateLyrics(currentTime) {
		const newCueIdx = cues.findIndex(c => currentTime >= c.start && currentTime < c.end);
		if (newCueIdx !== currentCueIndex) {
			lyricsDisplay.innerHTML = (newCueIdx !== -1) ? `<p>${cues[newCueIdx].text.replace(/\n/g, '<br>')}</p>` : '<p>...</p>';
			currentCueIndex = newCueIdx;
		}
	}

	function timeToSeconds(t) {
		if (!t) return null;
		try {
			const p = String(t).trim().split(":");
			return p.length === 3 ? (+p[0] * 3600 + +p[1] * 60 + +p[2]) : p.length === 2 ? (+p[0] * 60 + +p[1]) : +p[0];
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
	loadSettings();
});