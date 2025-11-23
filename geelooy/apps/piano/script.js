// B"H

document.addEventListener('DOMContentLoaded', () => {
	// --- CONSTANTS & SYNTH DEFINITIONS ---
	const BASE_GAIN_OSC = 0.45; // Base gain for one oscillator (normalize here)
	const CHORD_GAIN_MULTIPLIER = 0.35; // Chords are quieter

	// Waveforms: Simple + Original Custom + 7 New Unique Synths
	const ALL_WAVEFORMS = [
		'triangle', 'sine', 'sawtooth', 'square',
		'pulse', 'detuned-saw', 'wobble', 'crystalline', 'tonewheel',
		'super-fm', 'pluck', 'formant', 'rave-lead', 'hard-bass',
		'acid-pulse', 'hyper-saw', 'growl-bass', 'neuro-bass',
		'trance-gate', 'hardstyle', 'reese-bass', 'digital-hoover',

		'bell-ep', 'organ-drawbar', 'metal-hit', 'soft-pad',
		'sub-osc', 'fifths-saw', 'shimmer-sine'
	];

	const noteFrequencies = {
		'C': 16.35,
		'C#': 17.32,
		'D': 18.35,
		'D#': 19.45,
		'E': 20.60,
		'F': 21.83,
		'F#': 23.12,
		'G': 24.50,
		'G#': 25.96,
		'A': 27.50,
		'A#': 29.14,
		'B': 30.87
	};
	const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const major7thChords = {
		'C': ['C', 'E', 'G', 'B'],
		'D': ['D', 'F#', 'A', 'C#'],
		'E': ['E', 'G#', 'B', 'D#'],
		'F': ['F', 'A', 'C', 'E'],
		'G': ['G', 'B', 'D', 'F#'],
		'A': ['A', 'C#', 'E', 'G#'],
		'B': ['B', 'D#', 'F#', 'A#']
	};
	const minor7thChords = {
		'C': ['C', 'D#', 'G', 'A#'],
		'D': ['D', 'F', 'A', 'C'],
		'E': ['E', 'G', 'B', 'D'],
		'F': ['F', 'G#', 'C', 'D#'],
		'G': ['G', 'A#', 'D', 'F'],
		'A': ['A', 'C', 'E', 'G'],
		'B': ['B', 'D', 'F#', 'A']
	};

	// --- ELEMENT CACHE ---
	const elements = {};
	elements.recordSheetButton = document.getElementById('record-sheet-button');
elements.sheetMusicContainer = document.getElementById('sheet-music-container');

	document.querySelectorAll('[id]').forEach(el => {
		elements[el.id.replace(/-./g, match => match.toUpperCase()[1])] = el;
	});
	elements.menuIcon = document.querySelector('.menu-icon');
	elements.alwaysDualLabel = document.getElementById('always-dual-label');
	// Note: The element ID recordButton is now recordAudioButton in HTML, but we need to check the JS variables:
	elements.recordAudioButton = document.getElementById('record-audio-button');
	elements.recordVideoButton = document.getElementById('record-video-button');
	elements.videoProgress = document.getElementById('video-progress');
	// Inside your element caching logic
elements.effectSelect = document.getElementById('effect-select');

	// --- GLOBAL STATE ---
	let audioContext, mediaRecorder, mediaStreamDestination, convolver, wetGain, masterGain, lfo, compressor, customWaves = {};
	let microphoneSource, microphoneGain, micPlaybackGain;
	let defaultSettings = {};
	
	
let isSheetRecording = false;
let sheetNotes = [];
let sheetRecordingStartTime = 0;
	let currentChordRoot = null,
		currentChordNodes = [],
		noteHistory = [];
		let newlyPressedKeys = []; // <-- ADD THIS
	const activeNotes = new Map();
	
	
	let videoKeyDownMap = new Map()
	
	
	let scrollState = {
		x: 0,
		x2: 0
	};
	let activeScroller = {
		isDragging: false
	};
	
	let videoWorker = null; // Persistent Worker reference
let isVideoRecording = false;
let videoStartTime = 0;
let audioChunks = []; // Still needed for final audio muxing

	let hiddenAudioProxy = null;

	// --- INITIALIZATION ---
	function setupVideoWorkerListeners(worker) {
    worker.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'STATUS_UPDATE' && data.payload) {
            elements.videoProgress.textContent = data.payload.message;
        } else if (data.type === 'PROGRESS_UPDATE' && data.payload) {
            // PROGRESS_UPDATE from worker now reports finalization progress, not real-time frame rate
            elements.videoProgress.textContent = `Processing: ${data.payload.percent}%`;
        } else if (data.type === 'VIDEO_COMPLETE' && data.payload.blob) {
            elements.videoProgress.textContent = 'Video Complete! (Downloading)';
            const url = URL.createObjectURL(data.payload.blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `BH-WebSynth-Video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            // Cleanup and reset
            worker.terminate();
            videoWorker = null;
            elements.recordVideoButton.textContent = 'Record Video';
            elements.videoProgress.textContent = '';
        } else if (data.type === 'FATAL_ERROR') {
            elements.videoProgress.textContent = `FATAL ERROR: ${data.payload.message}`;
            console.error('Worker Error:', data.payload.error);
            if (worker) worker.terminate();
            videoWorker = null;
        }
    };
}


/**
 * Sends the current piano state to the video worker to render a frame.
 * This is the central function for keeping the video perfectly in sync with the UI.
 * @param {boolean} isKeyChange - True if the event was a key press/release.
 */
// REPLACE the old sendFrameStateToWorker function with this one
// REPLACE your entire sendFrameStateToWorker function
function sendFrameStateToWorker() {
    if (!isVideoRecording || !videoWorker) return;
    videoWorker.postMessage({
        type: 'UPDATE_SCROLL',
        payload: { time: audioContext.currentTime - videoStartTime, scrollX: scrollState.x, scrollX2: scrollState.x2 || 0 }
    });
}


	

	// Populate Select elements with all waveforms
	function populateWaveformSelects() {
		[elements.waveformSelect, elements.waveform2Select, elements.chordWaveformSelect].forEach(select => {
			select.innerHTML = '';
			ALL_WAVEFORMS.forEach(wave => {
				const option = document.createElement('option');
				option.value = wave;
				option.textContent = wave.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
				select.appendChild(option);
			});
		});
		// Set default values (e.g., sine for main, triangle for chord, saw for OSC2)
		elements.waveformSelect.value = 'sine';
		elements.chordWaveformSelect.value = 'triangle';
		elements.waveform2Select.value = 'sawtooth';
	}

	elements.startButton.addEventListener('click', () => {
		try {
			audioContext = new(window.AudioContext || window.webkitAudioContext)({
				// Attempt to unlock high performance on mobile (may not work everywhere)
				latencyHint: 'interactive',
				sampleRate: 44100
			});
			mediaStreamDestination = audioContext.createMediaStreamDestination();

			hiddenAudioProxy = document.createElement('audio');
			hiddenAudioProxy.setAttribute('playsinline', 'true'); // Necessary for mobile iOS/Android to play without fullscreen
			hiddenAudioProxy.setAttribute('loop', 'true'); // Forces the browser to keep the stream active indefinitely

			hiddenAudioProxy.style.display = 'none'; // Keep it out of view
			//  hiddenAudioProxy.muted = true;             // Crucial: Mute to prevent double audio (since masterGain already routes to speakers)
			document.body.appendChild(hiddenAudioProxy);

			//  hiddenAudioProxy.srcObject = mediaStreamDestination.stream;
			// Start playback to signal the OS media system that audio is active.
			// This is the key step that usually makes device recording work.
			//   hiddenAudioProxy.play().catch(e => console.warn("Audio play() failed (Autoplay policy issue, but stream is connected).", e));




			// --- MASTER AUDIO CHAIN with robust clipping prevention ---
			masterGain = audioContext.createGain();
			compressor = audioContext.createDynamicsCompressor();
			// Aggressive settings for mastering and preventing clipping
			compressor.threshold.value = -16;
			compressor.knee.value = 25;
			compressor.ratio.value = 10;
			compressor.attack.value = 0.003;
			compressor.release.value = 0.25;

			// Set initial master volume from slider
			masterGain.gain.value = parseFloat(elements.masterVolumeSlider.value);

			masterGain.connect(compressor);
			compressor.connect(audioContext.destination);

			// Crucial for recording other apps: connect *everything* to the destination AND mediaStreamDestination
			// Note: The structure is masterGain -> compressor -> [audioContext.destination, mediaStreamDestination]
			compressor.connect(mediaStreamDestination);

			if (audioContext.state === 'suspended') audioContext.resume();
		} catch (e) {
			alert('Web Audio API not supported or failed to initialize.');
			console.error(e);
			return;
		}

		populateWaveformSelects();
		createCustomWaves();
		setupReverb();
		setupLFO();
		storeDefaultSettings();
		elements.startScreen.style.display = 'none';
		elements.appContainer.style.display = 'flex';
		setupPiano();
	});

	function setupPiano() {
		loadSettings();
		handleKeyboardResize();
		setupEventListeners();
		loadScrollState();
	}

	// --- EVENT HANDLERS ---

	function handlePointerDown(e) {
    const target = e.target;
    const keyElement = target.closest('.key');
    if (keyElement) {
        e.preventDefault();
        if (activeNotes.has(e.pointerId)) return;

        const noteName = keyElement.dataset.note;
        const keyRect = keyElement.getBoundingClientRect();
        const touchX = e.clientX - keyRect.left;
        const touchY = e.clientY - keyRect.top;
        
        // This is now simplified, just pass the raw data down
        const note = noteName.replace(/\d/g, '');
        const octave = parseInt(noteName.match(/\d+/g));
        const frequency = noteFrequencies[note] * Math.pow(2, octave);
        if (elements.playChordsCheckbox.checked) triggerChord(note, octave, frequency);
        playNote(frequency, note, keyElement, e.pointerId, noteName, { x: touchX, y: touchY });
    }
}

	function handlePointerUpOrCancel(e) {
		if (activeScroller.isDragging) {
			activeScroller.thumb.style.cursor = 'grab';
			activeScroller.isDragging = false;
			saveScrollState();
		}
		stopNote(e.pointerId);
		// Stop chords if all main notes are released
		if (activeNotes.size === 0 && elements.playChordsCheckbox.checked) {
			currentChordNodes.forEach(n => stopSynth(n));
			currentChordNodes = [];
			currentChordRoot = null;
		}
	}

	function setupEventListeners() {
	
	elements.recordSheetButton.addEventListener('click', toggleSheetMusicRecording);
	
	
		elements.menuIcon.addEventListener('click', () => elements.settingsBar.classList.toggle('expanded'));
		elements.visualEffectsToggle.addEventListener('click', () => elements.visualEffectsMenu.classList.toggle('visible'));


		elements.recordAudioButton.addEventListener('click', toggleAudioRecording);

		// NEW: Video recording listener
		elements.recordVideoButton.addEventListener('click', toggleVideoRecording);

		elements.micButton.addEventListener('click', toggleMicrophone);
		elements.restoreDefaultsButton.addEventListener('click', restoreDefaults);

		elements.advancedSynthToggle.addEventListener('click', () => {
			elements.advancedSynthMenu.classList.toggle('visible');
			saveSettings();
		});
		elements.chordSettingsToggle.addEventListener('click', () => {
			elements.chordSettingsMenu.classList.toggle('visible');
			saveSettings();
		});
		elements.audioIoToggle.addEventListener('click', () => {
			elements.audioIoMenu.classList.toggle('visible');
			saveSettings();
		});

		['keyWidthSlider', 'octaveSelect', 'alwaysDualCheckbox', 'independentScrollCheckbox'].forEach(key => {
			elements[key].addEventListener('input', () => {
				handleKeyboardResize();
				saveSettings();
			});
		});

		elements.masterVolumeSlider.addEventListener('input', () => {
			if (masterGain) masterGain.gain.setTargetAtTime(parseFloat(elements.masterVolumeSlider.value), audioContext.currentTime, 0.01);
			saveSettings();
		});

		elements.micVolumeSlider.addEventListener('input', () => {
			if (microphoneGain) microphoneGain.gain.setTargetAtTime(parseFloat(elements.micVolumeSlider.value), audioContext.currentTime, 0.01);
			saveSettings();
		});
		elements.micPlaybackCheckbox.addEventListener('input', () => {
			if (micPlaybackGain) micPlaybackGain.gain.setTargetAtTime(elements.micPlaybackCheckbox.checked ? 1.0 : 0.0, audioContext.currentTime, 0.01);
			saveSettings();
		});

		const synthParamControls = [
			'waveformSelect', 'chordWaveformSelect', 'playChordsCheckbox', 'chordModeSelect', 'chordOctaveSelect',
			'attackSlider', 'decaySlider', 'sustainSlider', 'releaseSlider',
			'waveform2Select', 'oscMixSlider', 'detuneSlider',
			'pitchDepthSlider', 'pitchAttackSlider', // New Pitch Controls
			'filterCutoffSlider', 'filterQSlider', 'lfoRateSlider', 'lfoDepthSlider', 'reverbSlider'
		];
		synthParamControls.forEach(key => {
			elements[key].addEventListener('input', () => {
				updateAllActiveNotesParameters();
				if (['lfoRateSlider', 'lfoDepthSlider'].includes(key)) updateLFO();
				saveSettings();
			});
		});

		// Pointer events for keyboard
		elements.keyboardContainer.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('pointerup', handlePointerUpOrCancel);
		document.addEventListener('pointercancel', handlePointerUpOrCancel);

		// Scrollbar events (see scrolling logic below)
		elements.customScrollbarThumb.addEventListener('pointerdown', (e) => handleScrollbarPointerDown(e, 0)); // Top bar's thumb
		elements.customScrollbarThumbTop.addEventListener('pointerdown', (e) => handleScrollbarPointerDown(e, 1)); // Middle bar's thumb
		document.addEventListener('pointermove', handleDocumentPointerMove);
	}

	// NEW: Log the current state for video frame generation
	function logVideoFrame() {
		if (!isVideoRecording) return;

		const timestamp = audioContext.currentTime - videoStartTime;
		const keys = [];
		activeNotes.forEach((note, pointerId) => {
			keys.push({
				note: note.keyElement.dataset.note,
				isBlack: note.keyElement.classList.contains('black-key')
			});
		});
		// Only log if there's a state change (i.e., key press/release)
		if (keys.length > 0 || videoRecordingData.length === 0) {
			videoRecordingData.push({
				time: timestamp,
				keys: keys,
				scrollX: scrollState.x,
				keyboardWidth: elements.keyboardContainer.clientWidth,
				keyWidth: parseInt(elements.keyWidthSlider.value),
			});
		}
	}




	// --- SYNTH ENGINE ---

	/**
	 * Creates the core components for a single synth voice.
	 * @param {boolean} isChord - True if this voice is for a chord note.
	 * @returns {object} The synth nodes.
	 */
	function createSynthNode(isChord = false) {
		const osc1 = audioContext.createOscillator();
		const osc2 = audioContext.createOscillator();
		const filter = audioContext.createBiquadFilter();
		const noteGain = audioContext.createGain();
		const gain1 = audioContext.createGain();
		const gain2 = audioContext.createGain();

		// Connect the nodes
		osc1.connect(gain1);
		osc2.connect(gain2);
		gain1.connect(noteGain);
		gain2.connect(noteGain);
		noteGain.connect(filter);

		// Send to both master (via compressor) and reverb
		filter.connect(masterGain);
		filter.connect(convolver);

		const nodes = {
			osc1,
			osc2,
			gain1,
			gain2,
			filter,
			noteGain
		};
		applyCurrentParameters(nodes, isChord);
		return nodes;
	}

	/**
	 * Applies all synth parameters (ADSR, wave, filter, LFO, PITCH ENVELOPE) to a set of nodes.
	 * @param {object} nodes - The synth nodes.
	 * @param {boolean} isChord - True if this voice is for a chord note.
	 */
	function applyCurrentParameters(nodes, isChord) {
		const {
			osc1,
			osc2,
			gain1,
			gain2,
			filter,
			noteGain
		} = nodes;
		const ct = audioContext.currentTime;

		const wave1 = isChord ? elements.chordWaveformSelect.value : elements.waveformSelect.value;
		const wave2 = elements.waveform2Select.value;

		// 1. Waveform Setup
		if (customWaves[wave1]) osc1.setPeriodicWave(customWaves[wave1]);
		else osc1.type = wave1;
		if (customWaves[wave2]) osc2.setPeriodicWave(customWaves[wave2]);
		else osc2.type = wave2;

		// 2. OSC Mix
		gain1.gain.value = 1 - parseFloat(elements.oscMixSlider.value);
		gain2.gain.value = parseFloat(elements.oscMixSlider.value);

		// 3. Filter
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(parseFloat(elements.filterCutoffSlider.value), ct);
		filter.Q.setValueAtTime(parseFloat(elements.filterQSlider.value), ct);
		lfo.gain.connect(filter.frequency); // LFO modulates Filter Cutoff

		// 4. Volume (Amplitude) ADSR
		const baseADSR = getADSR();
		let peakGain = BASE_GAIN_OSC * (1 + parseFloat(elements.oscMixSlider.value));
		if (isChord) peakGain *= CHORD_GAIN_MULTIPLIER;

		noteGain.gain.cancelScheduledValues(ct);
		noteGain.gain.setValueAtTime(0.0001, ct);
		noteGain.gain.linearRampToValueAtTime(peakGain, ct + baseADSR.attack);
		noteGain.gain.setTargetAtTime(peakGain * baseADSR.sustain, ct + baseADSR.attack, baseADSR.decay + 0.001);

		// 5. Reverb
		wetGain.gain.setTargetAtTime(parseFloat(elements.reverbSlider.value), ct, 0.01);
	}

	/**
	 * Starts the synth voice with frequency and applies Pitch Envelope.
	 */
	function startSynth(nodes, frequency) {
		const ct = audioContext.currentTime;
		const pitchDepth = parseFloat(elements.pitchDepthSlider.value);
		const pitchAttack = parseFloat(elements.pitchAttackSlider.value);

		// --- PITCH ENVELOPE IMPLEMENTATION ---

		// Start detune at a higher value (positive pitchDepth)
		const startDetune = pitchDepth;

		// Set target frequency
		nodes.osc1.frequency.setValueAtTime(frequency, ct);
		nodes.osc2.frequency.setValueAtTime(frequency, ct);

		// Set up detune for the OSCILLATOR 1
		nodes.osc1.detune.setValueAtTime(startDetune, ct);
		// Quickly decay the pitch down to 0 cents (original pitch)
		nodes.osc1.detune.exponentialRampToValueAtTime(0.01, ct + pitchAttack);

		// Set up detune for the OSCILLATOR 2 (Detune Slider Value + Pitch Envelope)
		const osc2DetuneValue = parseFloat(elements.detuneSlider.value);
		nodes.osc2.detune.setValueAtTime(osc2DetuneValue + startDetune, ct);
		// Quickly decay the pitch down to the actual detune value
		nodes.osc2.detune.exponentialRampToValueAtTime(osc2DetuneValue + 0.01, ct + pitchAttack);

		// Start oscillators
		nodes.osc1.start(ct);
		nodes.osc2.start(ct);
	}

	function stopSynth(nodes) {
		if (!nodes) return;
		const {
			osc1,
			osc2,
			noteGain,
			filter
		} = nodes;
		const releaseTime = parseFloat(elements.releaseSlider.value);
		const ct = audioContext.currentTime;

		// Amplitude Release
		noteGain.gain.cancelScheduledValues(ct);
		noteGain.gain.setValueAtTime(noteGain.gain.value, ct);
		noteGain.gain.exponentialRampToValueAtTime(0.0001, ct + releaseTime);

		const stopTime = ct + releaseTime + 0.1;
		osc1.stop(stopTime);
		osc2.stop(stopTime);

		// Disconnect LFO when the note fully ends to clean up the graph
		osc1.onended = () => {
			if (filter?.frequency && lfo?.gain) {
				try {
					lfo.gain.disconnect(filter.frequency);
				} catch (e) {}
			}
		};
	}

	
	
	
	// REPLACE the old playNote function with this one
function playNote(frequency, note, keyElement, pointerId, noteName, touchCoords) {
    if (activeNotes.has(pointerId)) return;
    const synthNodes = createSynthNode(false);
    if (synthNodes) {
        startSynth(synthNodes, frequency);
        activeNotes.set(pointerId, { synthNodes, keyElement });
        keyElement.classList.add('active');

        if (isVideoRecording) {
            const downTime = audioContext.currentTime;
            // Log the start time and coordinates
            videoKeyDownMap.set(noteName, { startTime: downTime, x: touchCoords.x, y: touchCoords.y });
            
            // If in Touch Point mode, send an immediate KEY_DOWN event
            if (elements.effectSelect.value === 'touchpoint') {
                videoWorker.postMessage({
                    type: 'KEY_DOWN',
                    payload: { note: noteName, time: downTime - videoStartTime, x: touchCoords.x, y: touchCoords.y }
                });
            }
        }
    }
    
    
    
    
if (isSheetRecording) {
    // Log the start of a note press
    const startTime = audioContext.currentTime - sheetRecordingStartTime;
    activeNotes.get(pointerId).sheetMusicStartTime = startTime;
}
}

// REPLACE the old stopNote function with this one
// REPLACE the video logic inside your stopNote function
function stopNote(pointerId) {
    const activeNote = activeNotes.get(pointerId);
    if (activeNote) {
        stopSynth(activeNote.synthNodes);
        activeNote.keyElement.classList.remove('active');
        const noteName = activeNote.keyElement.dataset.note;
        activeNotes.delete(pointerId);

        if (isVideoRecording && videoKeyDownMap.has(noteName)) {
            const downEvent = videoKeyDownMap.get(noteName);
            const upTime = audioContext.currentTime;
            
            // ALWAYS send the full event data for the master log
            videoWorker.postMessage({
                type: 'ADD_KEY_EVENT',
                payload: { note: noteName, start: downEvent.startTime - videoStartTime, end: upTime - videoStartTime, x: downEvent.x, y: downEvent.y }
            });
            
            // If in Touch Point mode, send a discrete KEY_UP event
            if (elements.effectSelect.value === 'touchpoint') {
                videoWorker.postMessage({
                    type: 'KEY_UP',
                    payload: { note: noteName, time: upTime - videoStartTime }
                });
            }
            videoKeyDownMap.delete(noteName);
        }
        
        

if (isSheetRecording && activeNote.sheetMusicStartTime !== undefined) {
    const endTime = audioContext.currentTime - sheetRecordingStartTime;
    sheetNotes.push({
        note: noteName,
        start: activeNote.sheetMusicStartTime,
        duration: endTime - activeNote.sheetMusicStartTime
    });
}
       }
      }
	
	
	
	
	

	
	
	function getChordQuality(rootNote) {
		const mode = elements.chordModeSelect.value;
		if (mode !== 'auto') return mode;
		const rootIndex = noteNames.indexOf(rootNote);
		const majorThird = noteNames[(rootIndex + 4) % 12];
		const minorThird = noteNames[(rootIndex + 3) % 12];
		const recentNotes = noteHistory.slice(-5);
		return (recentNotes.includes(minorThird) && !recentNotes.includes(majorThird)) ? 'minor' : 'major';
	}

	function triggerChord(note, octave, frequency) {
		const rootNote = note.replace('#', '');
		// Only trigger chord if root note has a defined 7th chord and it's a new root
		if (!major7thChords[rootNote] || rootNote === currentChordRoot) return;

		// Stop current chord immediately
		currentChordNodes.forEach(node => stopSynth(node));
		currentChordNodes = [];
		currentChordRoot = rootNote;

		const quality = getChordQuality(rootNote);
		const chordNotes = (quality === 'minor') ? minor7thChords[rootNote] : major7thChords[rootNote];
		let chordOctave;
		const setting = elements.chordOctaveSelect.value;

		if (setting === 'auto') {
			// Find the closest octave that is lower than the root key being pressed
			let minDiff = Infinity;
			for (let i = 1; i < 6; i++) {
				const freqCheck = noteFrequencies[rootNote] * Math.pow(2, i);
				const diff = Math.abs((frequency / 4) - freqCheck);
				if (diff < minDiff) {
					minDiff = diff;
					chordOctave = i;
				}
			}
			chordOctave = Math.min(chordOctave, octave - 1); // Ensure chord is lower
		} else {
			chordOctave = octave + parseInt(setting);
		}

		chordOctave = Math.max(1, Math.min(6, chordOctave));

		chordNotes.forEach(name => {
			const freq = noteFrequencies[name] * Math.pow(2, chordOctave);
			const nodes = createSynthNode(true); // Pass isChord = true
			if (nodes) {
				startSynth(nodes, freq);
				currentChordNodes.push(nodes);
			}
		});
	}

	function getADSR() {
		return {
			attack: parseFloat(elements.attackSlider.value),
			decay: parseFloat(elements.decaySlider.value),
			sustain: parseFloat(elements.sustainSlider.value)
		};
	}

	// Update parameters of currently playing notes
	function updateAllActiveNotesParameters() {
		const allNodes = [...activeNotes.values()].map(n => n.synthNodes).concat(currentChordNodes);
		const rampTime = audioContext.currentTime + 0.05;

		allNodes.forEach(nodes => {
			if (!nodes) return;
			const isChord = currentChordNodes.includes(nodes); // Simple check
			const wave1 = isChord ? elements.chordWaveformSelect.value : elements.waveformSelect.value;
			const wave2 = elements.waveform2Select.value;

			// Apply new wave types (no smooth ramp for type)
			if (customWaves[wave1]) nodes.osc1.setPeriodicWave(customWaves[wave1]);
			else nodes.osc1.type = wave1;
			if (customWaves[wave2]) nodes.osc2.setPeriodicWave(customWaves[wave2]);
			else nodes.osc2.type = wave2;

			// Smoothly ramp other values
			nodes.osc2.detune.linearRampToValueAtTime(parseFloat(elements.detuneSlider.value), rampTime);
			nodes.gain1.gain.linearRampToValueAtTime(1 - parseFloat(elements.oscMixSlider.value), rampTime);
			nodes.gain2.gain.linearRampToValueAtTime(parseFloat(elements.oscMixSlider.value), rampTime);
			nodes.filter.frequency.linearRampToValueAtTime(parseFloat(elements.filterCutoffSlider.value), rampTime);
			nodes.filter.Q.linearRampToValueAtTime(parseFloat(elements.filterQSlider.value), rampTime);
			wetGain.gain.linearRampToValueAtTime(parseFloat(elements.reverbSlider.value), rampTime);
		});
	}

	// --- ADVANCED WAVE GENERATION (Includes 7 New Synths) ---
	function createCustomWaves() {
		const n = 4096;
		const real = new Float32Array(n).fill(0);
		const imag = {};

		ALL_WAVEFORMS.forEach(name => imag[name] = new Float32Array(n).fill(0));

		for (let i = 1; i < n; i++) {
			// Original waves
			if (i % 2 !== 0) imag.pulse[i] = 4 / (Math.PI * i);
			imag['detuned-saw'][i] = (2 / (Math.PI * i)) * (1 + 0.5 * Math.cos(20 * i / n));
			imag.wobble[i] = (1 / i) * (0.3 + 0.7 * Math.sin(100 * i / n) * Math.sin(30 * i / n));
			const freq = i * (audioContext.sampleRate / (2 * n));
			imag.formant[i] = (Math.exp(-Math.pow((freq - 700) / 150, 2)) + 0.5 * Math.exp(-Math.pow((freq - 1200) / 200, 2))) / (i * 0.5 + 1);
			for (let k = 1; k <= 10; k++) imag['rave-lead'][i] += (1 / (i * k)) * 0.1;
			if (i % 2 !== 0) imag['hard-bass'][i] = (1 / (i * i)) + 0.2 / i;
			if (i % 2 !== 0) imag['acid-pulse'][i] = 0.8 / i + 0.2 / (i * 1.5);
			for (let k = 0; k < 7; k++) imag['hyper-saw'][i] += (1 / (i + k * 0.1)) * (2 / (Math.PI * (i + k * 0.1)));
			imag['growl-bass'][i] = (1 / i) * Math.sin((i * Math.PI) / 2.5 + Math.sin(i * 0.05));
			imag['neuro-bass'][i] = (1 / i) * (0.4 * Math.sin(i * 0.1) + 0.6 * Math.sin(i * 0.03));
			for (let k = 1; k <= 8; k += 2) imag['trance-gate'][i] += (1 / (i * k)) * (0.5 + 0.5 * Math.cos(i * 0.01));
			if (i % 2 !== 0) imag['hardstyle'][i] = (1 / i) + (0.5 / (i * i)) * Math.sin(i * 0.01);
			for (let k = 0; k < 2; k++) imag['reese-bass'][i] += (1 / (i + k * 0.05)) * (2 / (Math.PI * (i + k * 0.05)));
			for (let k = 1; k < 8; k++) imag['digital-hoover'][i] += 1 / (i * k * 1.02);

			// Defined harmonic weights
			imag.crystalline[1] = 1;
			imag.crystalline[4] = 0.5;
			imag.crystalline[9] = 0.3;
			imag.crystalline[16] = 0.2;
			imag.tonewheel[1] = 1;
			imag.tonewheel[2] = 0.8;
			imag.tonewheel[3] = 0.6;
			imag.tonewheel[4] = 0.4;
			imag.tonewheel[6] = 0.2;
			imag.pluck[1] = 1;
			imag.pluck[2] = 0.1;
			imag.pluck[3] = 0.5;
			imag.pluck[4] = 0.1;
			imag['super-fm'][1] = 0.8;
			imag['super-fm'][3] = 0.6;
			imag['super-fm'][5] = 0.4;
			imag['super-fm'][7] = 0.2;

			// --- 7 NEW UNIQUE SYNTHS LOGIC ---
			// 1. Bell EP (Sine + high overtones)
			if (i === 1 || i === 4 || i === 7 || i === 12) imag['bell-ep'][i] = 1 / (i * 0.5);

			// 2. Organ Drawbar (8' + 4' + 2' - Harmonic 1, 2, 4)
			if (i === 1) imag['organ-drawbar'][i] = 0.8;
			if (i === 2) imag['organ-drawbar'][i] = 0.6;
			if (i === 4) imag['organ-drawbar'][i] = 0.4;

			// 3. Metal Hit (Inharmonic overtones)
			if (i === 1 || i === 3 || i === 5 || i === 10 || i === 11) imag['metal-hit'][i] = 1 / (i * 0.8);

			// 4. Soft Pad (Subtle harmonics, ramped)
			imag['soft-pad'][i] = (1 / i) * Math.exp(-i / 15);

			// 5. Sub Osc (Square with dominant first and third harmonics, very bassy)
			if (i === 1) imag['sub-osc'][i] = 1.0;
			if (i === 3) imag['sub-osc'][i] = 0.5;
			if (i === 5) imag['sub-osc'][i] = 0.1;

			// 6. Fifths Saw (Sawtooth + a fifth up)
			if (i === 1) imag['fifths-saw'][i] = 1.0;
			if (i % 3 === 0 && i !== 0) imag['fifths-saw'][i] = (2 / (Math.PI * i)) * 0.7; // The fifth is the 3rd harmonic

			// 7. Shimmer Sine (Very smooth, only prime harmonics)
			if (i === 1 || i === 3 || i === 5 || i === 7 || i === 11) imag['shimmer-sine'][i] = 1 / (i * 0.5);
		}

		// Final generation for all custom waves
		Object.keys(imag).forEach(name => {
			// Only create PeriodicWave for non-standard types
			if (!['triangle', 'sine', 'sawtooth', 'square'].includes(name)) {
				customWaves[name] = audioContext.createPeriodicWave(real, imag[name], {
					disableNormalization: true
				});
			}
		});
	}

	// ... (setupReverb, setupLFO, updateLFO are largely the same) ...
	function setupReverb() {
		convolver = audioContext.createConvolver();
		wetGain = audioContext.createGain();
		wetGain.gain.value = 0;
		convolver.connect(wetGain);
		wetGain.connect(masterGain);
		const sampleRate = audioContext.sampleRate,
			length = sampleRate * 1.5,
			decay = 2.5;
		const impulseBuffer = audioContext.createBuffer(2, length, sampleRate);
		for (let c = 0; c < 2; c++) {
			const data = impulseBuffer.getChannelData(c);
			for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
		convolver.buffer = impulseBuffer;
	}

	function setupLFO() {
		lfo = {
			osc: audioContext.createOscillator(),
			gain: audioContext.createGain()
		};
		lfo.osc.type = 'sine';
		lfo.osc.connect(lfo.gain);
		lfo.osc.start();
		updateLFO();
	}

	function updateLFO() {
		if (!lfo) return;
		lfo.osc.frequency.setTargetAtTime(parseFloat(elements.lfoRateSlider.value), audioContext.currentTime, 0.01);
		lfo.gain.gain.setTargetAtTime(parseFloat(elements.lfoDepthSlider.value), audioContext.currentTime, 0.01);
	}

	// --- AUDIO I/O (Recording) ---

	// Correctly outputs the audio to the device audio such that other apps can record.
	// This is primarily achieved by:
	// 1. Using a high-quality AudioContext (with latencyHint:'interactive').
	// 2. Connecting the master output through a DynamicsCompressor (compressor) to both:
	//    a) audioContext.destination (for speakers/headphones)
	//    b) mediaStreamDestination (for recording APIs like MediaRecorder or screen capture tools).
	// The master chain logic in the initial setup handles this.
	function toggleAudioRecording() {
		if (!mediaStreamDestination) {
			alert("Audio engine not initialized.");
			return;
		}

		if (elements.recordAudioButton.classList.contains('recording')) {
			mediaRecorder.stop();
			elements.recordAudioButton.textContent = 'Record 🎤';
			elements.recordAudioButton.classList.remove('recording');
		} else {
			let recordedChunks = [];
			// Use 'audio/ogg' or 'audio/webm' for broader browser support, 
			// or 'audio/wav' if supported (WAV is better for quality, but large)
			const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
			mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
				mimeType
			});

			mediaRecorder.ondataavailable = e => {
				if (e.data.size > 0) recordedChunks.push(e.data);
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(recordedChunks, {
					type: mimeType
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				a.download = `BH-WebSynth-Rec-${Date.now()}.${mimeType.split('/')[1].split(';')[0]}`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				a.remove();
			};

			mediaRecorder.start();
			elements.recordAudioButton.textContent = 'Stop';
			elements.recordAudioButton.classList.add('recording');
		}
	}


	// NEW: Video Recording Logic
	
// REPLACE the old toggleVideoRecording function with this one

// REPLACE your ENTIRE toggleVideoRecording function
async function toggleVideoRecording() {
    if (!mediaStreamDestination) { alert("Audio engine not initialized."); return; }

    if (isVideoRecording) {
        // --- STOP ---
        const stopTime = audioContext.currentTime;
        videoKeyDownMap.forEach((downEvent, noteName) => {
            const upTime = stopTime;
            // Flush the full event
            videoWorker.postMessage({
                type: 'ADD_KEY_EVENT',
                payload: { note: noteName, start: downEvent.startTime - videoStartTime, end: upTime - videoStartTime, x: downEvent.x, y: downEvent.y }
            });
            // Flush the discrete event if needed
            if (elements.effectSelect.value === 'touchpoint') {
                videoWorker.postMessage({ type: 'KEY_UP', payload: { note: noteName, time: upTime - videoStartTime }});
            }
        });
        videoKeyDownMap.clear();
        
        mediaRecorder.stop();
        isVideoRecording = false;
        elements.recordVideoButton.textContent = 'Processing...';
        mediaRecorder.onstop = () => processAudioAndFinalize(audioChunks);
        
    } else {
        // --- START ---
        videoKeyDownMap.clear();
        
        const renderMode = elements.effectSelect.value;
        const videoResolution = window.innerHeight > window.innerWidth ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
        videoWorker = new Worker('./synth-video-worker.js'); 
        setupVideoWorkerListeners(videoWorker);

        audioChunks = [];
        mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, { mimeType: 'audio/webm' }); 
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); }; 

        videoStartTime = audioContext.currentTime;
        videoWorker.postMessage({
            type: 'INITIALIZE_RENDERER',
            payload: {
                renderMode: renderMode,
                resolution: videoResolution,
                outputFormat: { quality: 0.8 , fps:
                parseInt(document.querySelector("#myFPS")?.value||"21")
                
                },
                startOctave: elements.octaveSelect.value,
                alwaysDual: elements.alwaysDualCheckbox.checked,
                independentScroll: elements.independentScrollCheckbox.checked,
                isVertical: window.innerHeight > window.innerWidth,
                style: {
                    userKeyWidth: parseInt(elements.keyWidthSlider.value),
                    userViewportWidth: elements.keyboardContainer.clientWidth
                },
              effects: {
                    types: {
                        hebrew: document.getElementById('enable-hebrew').checked,
                        emojis: document.getElementById('enable-emojis').checked,
                        sparks: document.getElementById('enable-sparks').checked,
                        bubbles: document.getElementById('enable-bubbles').checked,
                    },
                    density: parseInt(document.getElementById('particle-density').value),
                    speed: parseFloat(document.getElementById('particle-speed').value),
                    size: parseFloat(document.getElementById('particle-size').value),
                    
                    lifespan: parseFloat(document.getElementById('particle-lifespan').value),
                    lightningAmount: parseFloat(document.getElementById('lightning-amount').value),
                
                    
                    },
                initialScrollX: scrollState.x,
        initialScrollX2: scrollState.x2 || 0
    
            }
        });
        
        mediaRecorder.start();
        isVideoRecording = true;
        elements.recordVideoButton.textContent = 'STOP Video';
    }
}
        
        























function processAudioAndFinalize(audioChunks) {
    const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
    const reader = new FileReader();
    reader.onload = async (e) => {
        elements.videoProgress.textContent = 'Decoding Audio...';
        try {
            const audioBuffer = await audioContext.decodeAudioData(e.target.result);
            const audioBufferShim = {
                sampleRate: audioBuffer.sampleRate, length: audioBuffer.length, duration: audioBuffer.duration,
                numberOfChannels: audioBuffer.numberOfChannels, channels: []
            };
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                audioBufferShim.channels.push(audioBuffer.getChannelData(i));
            }

            // Send audio and finalization command to the persistent worker
            elements.videoProgress.textContent = 'Muxing Video and Audio...';
            console.log("MAIN: Sending a simple test message...");
            videoWorker.postMessage({ type: 'TEST', payload: 'Is anyone there?' });
            console. log("sending final message")
            videoWorker.postMessage({
                type: 'FINALIZE_MUXING',
                payload: { audioBufferShim: audioBufferShim }
            })
            
        
            console.log("finished post message final") 

        } catch (error) {
            console.error("Error decoding audio data:", error);
            elements.videoProgress.textContent = 'Error processing audio.';
            if (videoWorker) videoWorker.terminate();
        }
    };
    reader.readAsArrayBuffer(audioBlob);
}

	// NEW: Processing the recorded Audio Blob into an AudioBufferShim for the Worker
	function processVideoAndAudio() {
		const audioBlob = new Blob(audioChunks, {
			type: audioChunks[0].type
		});
		const reader = new FileReader();
		reader.onload = async (e) => {
			elements.videoProgress.textContent = 'Decoding Audio...';
			try {
				// Decode the audio blob into a Web Audio API AudioBuffer
				const audioBuffer = await audioContext.decodeAudioData(e.target.result);
				// Create a shim object the worker expects (MediabunnyBaseRenderer constructor)
				const audioBufferShim = {
					sampleRate: audioBuffer.sampleRate,
					length: audioBuffer.length,
					duration: audioBuffer.duration,
					numberOfChannels: audioBuffer.numberOfChannels,
					channels: []
				};
				for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
					audioBufferShim.channels.push(audioBuffer.getChannelData(i));
				}

				// Call the worker with the data
				elements.videoProgress.textContent = 'Starting Video Render...';
				startVideoWorker(audioBufferShim);

			} catch (error) {
				console.error("Error decoding audio data:", error);
				elements.videoProgress.textContent = 'Error processing audio.';
			}
		};
		reader.readAsArrayBuffer(audioBlob);
	}
	
	
	// script.js (Complete startVideoWorker function)

/**
 * Initiates the Web Worker to render the video and audio file.
 * @param {object} audioBufferShim - The recorded audio data object.
 */
function startVideoWorker(audioBufferShim) {
    
    // --- 1. Calculate Video Resolution (1080p in correct orientation) ---
    const isVertical = window.innerHeight > window.innerWidth;
    const HD_WIDTH = 1080;
    const HD_HEIGHT = 1920;
    
    // Set video resolution to 1080x1920 (Portrait) or 1920x1080 (Landscape)
    const videoResolution = isVertical 
        ? { width: HD_WIDTH, height: HD_HEIGHT } 
        : { width: HD_HEIGHT, height: HD_WIDTH }; 

    // --- 2. Worker Instantiation (Ensure path is correct) ---
    // The worker is the project-specific logic file that imports the base worker.
    const worker = new Worker('./synth-video-worker.js'); 

    // --- 3. Worker Communication Setup ---
    worker.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'STATUS_UPDATE' && data.payload) {
            elements.videoProgress.textContent = data.payload.message;
        } else if (data.type === 'PROGRESS_UPDATE' && data.payload) {
            elements.videoProgress.textContent = `Rendering: ${data.payload.percent}%`;
        } else if (data.type === 'VIDEO_COMPLETE' && data.payload.blob) {
            // Video finished, offer download
            elements.videoProgress.textContent = 'Video Complete!';
            const url = URL.createObjectURL(data.payload.blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `BH-${Date.now}-WebSynth-Video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            worker.terminate();
        } else if (data.type === 'FATAL_ERROR') {
            elements.videoProgress.textContent = `FATAL ERROR: ${data.payload.message}`;
            console.error('Worker Error:', data.payload.error);
            worker.terminate();
        }
    };

    // --- 4. Send START_RENDERING Payload ---
    worker.postMessage({
        type: 'START_RENDERING',
        payload: {
            audioBufferShim: audioBufferShim,
            keyPressData: videoRecordingData,
            
            // --- Resolution and Format ---
            resolution: videoResolution, 
            outputFormat: { format: 'mp4' }, 
            
            // --- Keyboard/UI Settings ---
            startOctave: elements.octaveSelect.value, 
            alwaysDual: elements.alwaysDualCheckbox.checked,
            independentScroll: elements.independentScrollCheckbox.checked,
            isVertical: isVertical, 
            
            // --- Styling Data ---
            style: {
                whiteKeyWidth: parseInt(elements.keyWidthSlider.value),
                // keyboardHeight is calculated within the worker based on resolution
            }
        }
    }, audioBufferShim.channels.map(c => c.buffer)); // Transfer array buffers to worker
}
	


	

	async function toggleMicrophone() {
		if (microphoneSource) {
			microphoneSource.mediaStream.getTracks().forEach(track => track.stop());
			microphoneSource.disconnect();
			microphoneSource = null;
			microphoneGain = null;
			micPlaybackGain = null;
			elements.micButton.classList.remove('mic-active');
			elements.micButton.textContent = 'Enable Mic';
			elements.micVolumeSlider.disabled = true;
		} else {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true
				});
				microphoneSource = audioContext.createMediaStreamSource(stream);
				microphoneGain = audioContext.createGain();
				micPlaybackGain = audioContext.createGain();

				microphoneGain.gain.value = parseFloat(elements.micVolumeSlider.value);
				micPlaybackGain.gain.value = elements.micPlaybackCheckbox.checked ? 1.0 : 0.0;

				microphoneSource.connect(microphoneGain);
				microphoneGain.connect(mediaStreamDestination); // Mic audio to recorder
				microphoneGain.connect(micPlaybackGain); // Mic audio to playback path
				micPlaybackGain.connect(masterGain); // Playback audio to master

				elements.micButton.classList.add('mic-active');
				elements.micButton.textContent = 'Disable Mic';
				elements.micVolumeSlider.disabled = false;
			} catch (err) {
				alert('Microphone access denied. Please ensure your browser allows it.');
				console.error(err);
			}
		}
	}

	// --- KEYBOARD & UI LAYOUT (Scrolling Logic is Kept) ---

	// The logic for handleKeyboardResize, generateKeyboard, createKeyboardPanel,
	// handleScrollbarPointerDown, handleDocumentPointerMove, setScroll, 
	// and updateScrollbarThumbs are maintained as per the user's request
	// and adapted to the new element names.

	function handleKeyboardResize() {
		const oldKb = document.getElementById('keyboard-bottom');
		let scrollPercent = 0;
		if (oldKb) {
			const maxScroll = oldKb.offsetWidth - elements.keyboardContainer.clientWidth;
			if (maxScroll > 0) scrollPercent = scrollState.x / maxScroll;
		}
		generateKeyboard();
		const newKb = document.getElementById('keyboard-bottom');
		if (newKb) {
			const newMaxScroll = newKb.offsetWidth - elements.keyboardContainer.clientWidth;
			setScroll(scrollPercent * newMaxScroll, 0, true);
		}
		updateScrollbarThumbs();
	}

	function generateKeyboard() {
		elements.keyboardContainer.innerHTML = '';
		document.documentElement.style.setProperty('--white-key-width', `${parseInt(elements.keyWidthSlider.value)}px`);
		const isVertical = window.innerHeight > window.innerWidth;
		const alwaysDual = elements.alwaysDualCheckbox.checked;
		let isDualView = alwaysDual || isVertical;

		if (isDualView) {
			const rowTop = document.createElement('div'),
				rowBottom = document.createElement('div');
			rowTop.className = 'keyboard-row';
			rowBottom.className = 'keyboard-row';

			const isIndependent = elements.independentScrollCheckbox.checked;
			const octaves = isIndependent ? 4 : 8,
				topStartOctave = isIndependent ? 4 : 0;

			const keyboardBottom = createKeyboardPanel(0, octaves);
			const keyboardTop = createKeyboardPanel(topStartOctave, octaves);

			keyboardBottom.id = 'keyboard-bottom';
			keyboardTop.id = 'keyboard-top';

			rowBottom.appendChild(keyboardBottom);
			rowTop.appendChild(keyboardTop);

			elements.keyboardContainer.appendChild(rowTop);
			elements.keyboardContainer.appendChild(rowBottom);

			elements.independentScrollLabel.classList.remove('hidden-ui');
		} else {
			const rowSingle = document.createElement('div');
			rowSingle.className = 'keyboard-row';
			const keyboard = createKeyboardPanel(0, 8);
			keyboard.id = 'keyboard-bottom';
			rowSingle.appendChild(keyboard);
			elements.keyboardContainer.appendChild(rowSingle);
			elements.independentScrollLabel.classList.add('hidden-ui');
		}
	}

	function createKeyboardPanel(startOctaveOffset, numOctaves) {
		const keyboardDiv = document.createElement('div');
		keyboardDiv.className = 'piano-keyboard';
		let whiteKeyX = 0;
		const whiteKeyWidth = parseInt(elements.keyWidthSlider.value),
			blackKeyWidth = whiteKeyWidth * 0.6;
		const baseStartOctave = parseInt(elements.octaveSelect.value);

		for (let oct = baseStartOctave + startOctaveOffset; oct < baseStartOctave + startOctaveOffset + numOctaves; oct++) {
			noteNames.forEach(note => {
				if (oct + (noteNames.indexOf(note) / 12) > 8.5) return; // Prevent going past C9
				const keyElement = document.createElement('div'),
					isBlack = note.includes('#'),
					noteName = note + oct;
				keyElement.className = `key ${isBlack ? 'black-key' : 'white-key'}`;
				keyElement.dataset.note = noteName;
				const label = document.createElement('span');
				label.className = 'key-label';
				label.textContent = noteName;
				keyElement.appendChild(label);

				if (isBlack) {
					keyElement.style.left = `${whiteKeyX - (blackKeyWidth / 2)}px`;
				} else {
					keyElement.style.left = `${whiteKeyX}px`;
					whiteKeyX += whiteKeyWidth;
				}
				keyboardDiv.appendChild(keyElement);
			});
		}
		keyboardDiv.style.width = `${whiteKeyX}px`;
		return keyboardDiv;
	}

	function handleScrollbarPointerDown(e, index) {
		e.preventDefault();
		e.stopPropagation();

		const thumb = e.target;
		const container = thumb.parentElement;
		const isIndependent = elements.independentScrollCheckbox.checked;
		const isDual = !!document.getElementById('keyboard-top');

		let logicalIndex;
		if (isDual && isIndependent) {
			// Top scroller controls bottom keyboard (index 0 -> logical 1)
			// Middle scroller controls top keyboard (index 1 -> logical 0)
			logicalIndex = index === 0 ? 1 : 0;
		} else {
			logicalIndex = 0; // Single scrollbar controls bottom/single keyboard
		}

		const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top');
		if (!kb) return;

		const maxKbScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;
		const maxThumbScroll = container.clientWidth - thumb.offsetWidth;

		activeScroller = {
			isDragging: true,
			index,
			thumb,
			startX: e.clientX,
			startThumbX: thumb.offsetLeft,
			scrollRatio: maxKbScroll / maxThumbScroll,
			logicalIndex
		};
		thumb.setPointerCapture(e.pointerId);
		thumb.style.cursor = 'grabbing';
	}

	function handleDocumentPointerMove(e) {
		if (!activeScroller.isDragging) return;
		e.preventDefault();

		const dx = e.clientX - activeScroller.startX;
		const maxThumbScroll = activeScroller.thumb.parentElement.clientWidth - activeScroller.thumb.offsetWidth;
		const newThumbX = Math.max(0, Math.min(maxThumbScroll, activeScroller.startThumbX + dx));
		const newKbX = newThumbX * activeScroller.scrollRatio;

		setScroll(newKbX, activeScroller.logicalIndex);
	}

	function setScroll(newX, logicalIndex, fromResize = false) {
		const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top');
		if (!kb) return;

		const maxScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;
		const clampedX = Math.max(0, Math.min(maxScroll > 0 ? maxScroll : 0, newX || 0));

		if (logicalIndex === 0) scrollState.x = clampedX;
		else scrollState.x2 = clampedX;

		const isDual = !!document.getElementById('keyboard-top');
		const isIndependent = elements.independentScrollCheckbox.checked;

		if (isDual && !isIndependent) {
			const topKb = document.getElementById('keyboard-top');
			const rowWidth = elements.keyboardContainer.clientWidth;

			kb.style.transform = `translateX(${-clampedX}px)`;
			topKb.style.transform = `translateX(${rowWidth - clampedX}px)`; // This assumes the top keyboard is shifted by one viewport width

			if (!fromResize) scrollState.x = scrollState.x2 = clampedX;
		} else {
			kb.style.transform = `translateX(${-clampedX}px)`;
		}

		if (!fromResize) updateScrollbarThumbs();
		// A scroll event is a state change, so send the new coordinates to the worker.
		// Set isKeyChange to false.
		sendFrameStateToWorker(false);
	
	}

	function updateScrollbarThumbs() {
		const setup = (kb, container, thumb, scrollVal) => {
			if (!kb || !container || !thumb) {
				if (container) container.style.display = 'none';
				return;
			}
			const maxScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;

			if (maxScroll > 0) {
				container.style.display = 'block';
				const thumbW = (elements.keyboardContainer.clientWidth / kb.offsetWidth) * container.clientWidth;
				thumb.style.width = `${thumbW}px`;
				const maxThumbScroll = container.clientWidth - thumbW;
				if (maxThumbScroll > 0) thumb.style.left = `${(scrollVal / maxScroll) * maxThumbScroll}px`;
			} else {
				container.style.display = 'none';
			}
		};

		const kbBottom = document.getElementById('keyboard-bottom'),
			kbTop = document.getElementById('keyboard-top');
		const isIndependent = elements.independentScrollCheckbox.checked;

		if (kbTop && isIndependent) {
			elements.middleScrollbarContainer.style.display = 'block';
			setup(kbBottom, elements.customScrollbarContainerTop, elements.customScrollbarThumbTop, scrollState.x);
			setup(kbTop, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x2);
		} else {
			elements.middleScrollbarContainer.style.display = 'none';
			setup(kbBottom, elements.customScrollbarContainer, elements.customScrollbarThumb, scrollState.x);
			setup(kbTop, null, null, 0); // Hide top scroller if not independent
		}
	}

	// --- LOCAL STORAGE & DEFAULTS ---

	function storeDefaultSettings() {
		Object.keys(elements).forEach(key => {
			const el = elements[key];
			if (el && (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'range')) {
				if (el.type === 'checkbox') defaultSettings[key] = el.checked;
				else defaultSettings[key] = el.value;
			}
		});
		defaultSettings.advMenu = false;
		defaultSettings.chordMenu = false;
		defaultSettings.audioIoMenu = false;
	}

	function restoreDefaults() {
		if (!defaultSettings) return;
		Object.keys(defaultSettings).forEach(key => {
			if (elements[key] && defaultSettings[key] !== undefined) {
				if (elements[key].type === 'checkbox') elements[key].checked = defaultSettings[key];
				else elements[key].value = defaultSettings[key];
			}
		});

		elements.advancedSynthMenu.classList.remove('visible');
		elements.chordSettingsMenu.classList.remove('visible');
		elements.audioIoMenu.classList.remove('visible');

		// Immediately apply changes to the audio graph
		if (masterGain) masterGain.gain.setTargetAtTime(parseFloat(elements.masterVolumeSlider.value), audioContext.currentTime, 0.01);
		updateLFO();

		saveSettings();
		handleKeyboardResize();
		updateAllActiveNotesParameters();
	}

	function saveSettings() {
		const settings = {};
		Object.keys(elements).forEach(key => {
			const el = elements[key];
			if (el && (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'range')) {
				if (el.type === 'checkbox') settings[key] = el.checked;
				else settings[key] = el.value;
			}
		});
		settings.advMenu = elements.advancedSynthMenu.classList.contains('visible');
		settings.chordMenu = elements.chordSettingsMenu.classList.contains('visible');
		settings.audioIoMenu = elements.audioIoMenu.classList.contains('visible');
		localStorage.setItem('pianoSettings', JSON.stringify(settings));
	}

	function loadSettings() {
		const settings = JSON.parse(localStorage.getItem('pianoSettings'));
		if (settings) {
			Object.keys(settings).forEach(key => {
				if (elements[key] && settings[key] !== undefined) {
					if (elements[key].type === 'checkbox') elements[key].checked = settings[key];
					else elements[key].value = settings[key];
				}
			});

			if (settings.advMenu) elements.advancedSynthMenu.classList.add('visible');
			if (settings.chordMenu) elements.chordSettingsMenu.classList.add('visible');
			if (settings.audioIoMenu) elements.audioIoMenu.classList.add('visible');
		}
	}

	function saveScrollState() {
		localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
	}

	function loadScrollState() {
		const state = JSON.parse(localStorage.getItem('pianoScrollState'));
		if (state) {
			scrollState = state;
			setScroll(state.x || 0, 0);
			if (state.x2 !== undefined) setScroll(state.x2, 1);
			updateScrollbarThumbs();
			return true;
		}
		return false;
	}
	
	
	
	// --- SHEET MUSIC RECORDING & RENDERING (FROM SCRATCH) ---

function toggleSheetMusicRecording() {
    if (isSheetRecording) {
        // --- STOP RECORDING ---
        isSheetRecording = false;
        elements.recordSheetButton.classList.remove('recording');
        elements.recordSheetButton.textContent = 'Record 🎼';

        // Process and download the recorded notes
        if (sheetNotes.length > 0) {
            processAndRenderSheetMusic();
        }

    } else {
        // --- START RECORDING ---
        isSheetRecording = true;
        sheetNotes = []; // Clear previous recording
        sheetRecordingStartTime = audioContext.currentTime;
        elements.recordSheetButton.classList.add('recording');
        elements.recordSheetButton.textContent = 'Done 🎼';
        alert("Sheet music recording started! Play some notes and press 'Done' when finished.");
    }
}

/**
 * Quantizes notes with greater accuracy and adds articulation detection (staccato).
 * It flags notes as 'staccato' if their raw played duration is significantly shorter
 * than their formal, quantized musical value.
 * @param {Array<Object>} notes The raw note data from recording.
 * @returns {Array<Object>} An array of quantized notes and rests with articulation info.
 */
function quantizeNotes(notes) {
    const tempo = 120; // Assume 120 BPM
    const quarterNoteDuration = 60 / tempo;
    const durations = [
        { name: 'sixteenth', duration: quarterNoteDuration / 4 },
        { name: 'eighth', duration: quarterNoteDuration / 2 },
        { name: 'eighth-dotted', duration: (quarterNoteDuration / 2) * 1.5 },
        { name: 'quarter', duration: quarterNoteDuration },
        { name: 'quarter-dotted', duration: quarterNoteDuration * 1.5 },
        { name: 'half', duration: quarterNoteDuration * 2 },
        { name: 'half-dotted', duration: quarterNoteDuration * 3 },
        { name: 'whole', duration: quarterNoteDuration * 4 },
    ].sort((a, b) => a.duration - b.duration);

    notes.sort((a, b) => a.start - b.start);

    const result = [];
    let lastEndTime = 0;

    notes.forEach(note => {
        const restDuration = note.start - lastEndTime;
        if (restDuration > durations[0].duration / 2) {
            let remainingRest = restDuration;
            let restStartTime = lastEndTime;
            for (let i = durations.length - 1; i >= 0; i--) {
                const restValue = durations[i];
                while (remainingRest >= restValue.duration * 0.95) {
                    result.push({ type: 'rest', duration: restValue.name, value: restValue.duration, start: restStartTime });
                    remainingRest -= restValue.duration;
                    restStartTime += restValue.duration;
                }
            }
        }

        const closestNote = durations.reduce((prev, curr) =>
            Math.abs(curr.duration - note.duration) < Math.abs(prev.duration - note.duration) ? curr : prev
        );

        // --- NEW: Staccato Detection Logic ---
        let articulation = null;
        // If a note was played for less than 60% of its quantized value, it's likely staccato.
        // We exclude very short notes to avoid mislabeling grace notes.
        if (note.duration < closestNote.duration * 0.6 && closestNote.duration > quarterNoteDuration / 4) {
            articulation = 'staccato';
        }

        result.push({
            type: 'note',
            pitch: note.note,
            start: note.start,
            duration: closestNote.name,
            value: closestNote.duration,
            articulation: articulation // Add the new property
        });

        lastEndTime = note.start + closestNote.duration;
    });
    return result;
}


/**
 * Processes the recorded notes and calls the professional rendering engine from sheetRender.js.
 * This function is the bridge between the main application and the separate rendering module.
 */
function processAndRenderSheetMusic() {
    // The Awtsmoos, in its infinite capacity, first condenses the raw chaos of played notes
    // into a structured, quantized form, preparing it for its revelation as a visual score.
    const quantizedMusic = quantizeNotes(sheetNotes);
    if (!quantizedMusic || quantizedMusic.length === 0) {
        console.log("No valid music to render.");
        return;
    }

    // The structured data is now passed to the external rendering engine, giving form to the formless.
    const canvas = renderProfessionalSheetMusic(quantizedMusic, elements.sheetMusicContainer);

    // If a canvas—a vessel for the light—was successfully created, its essence is captured
    // and offered for download, a tangible manifestation of the supernal melody.
    if (canvas) {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'Awtsmoos-Sheet-Music.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // The temporary vessel, having served its purpose, is cleared.
    elements.sheetMusicContainer.innerHTML = '';
}


});