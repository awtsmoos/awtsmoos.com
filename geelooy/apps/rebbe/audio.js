//B"H
import { setVisualizerData } from './viz.js';

let audioCtx;
let audioEl;
let sourceNode;
let analyser;
let gainNode;

const btnPlay = document.getElementById('btn-play');
const progressBar = document.getElementById('progress-fill');
const progressContainer = document.getElementById('progress-bar');
const currTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volSlider = document.getElementById('volume-slider');

export function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    audioEl = new Audio();
    audioEl.crossOrigin = "anonymous";
    
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    analyser = audioCtx.createAnalyser();
    gainNode = audioCtx.createGain();

    // Config Analyser
    analyser.fftSize = 256;
    
    // Connect Graph
    sourceNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    setupAudioListeners();
    startVisualizerLoop();
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function setupAudioListeners() {
  audioEl.addEventListener('timeupdate', updateProgress);
  audioEl.addEventListener('loadedmetadata', () => {
    totalTimeEl.innerText = formatTime(audioEl.duration);
  });
  audioEl.addEventListener('ended', () => {
    if(window.nextTrack) window.nextTrack();
  });
  audioEl.addEventListener('error', (e) => {
    console.error("Audio Error", e);
    // Auto skip on error?
    setTimeout(() => { if(window.nextTrack) window.nextTrack(); }, 2000);
  });

  progressContainer.parentElement.addEventListener('click', (e) => {
    if(!audioEl.duration) return;
    const rect = progressContainer.parentElement.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioEl.currentTime = pos * audioEl.duration;
  });

  volSlider.addEventListener('input', (e) => {
    if(gainNode) gainNode.gain.value = e.target.value;
  });
}

export function playTrack(url, isBlob) {
  if(!audioCtx) initAudioContext();
  
  audioEl.src = url;
  audioEl.play().then(() => {
    btnPlay.innerText = "⏸";
    document.getElementById('player-status').innerText = "PLAYING NOW";
  }).catch(e => {
    console.error("Play error", e);
  });
}

export function togglePlay() {
  if(!audioEl) return;
  if(audioEl.paused) {
    audioEl.play();
    btnPlay.innerText = "⏸";
    document.getElementById('player-status').innerText = "PLAYING";
  } else {
    audioEl.pause();
    btnPlay.innerText = "▶";
    document.getElementById('player-status').innerText = "PAUSED";
  }
}

function updateProgress() {
  if(!audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  progressBar.style.width = `${pct}%`;
  currTimeEl.innerText = formatTime(audioEl.currentTime);
}

function formatTime(s) {
  if(isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

// Visualizer Loop
function startVisualizerLoop() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function loop() {
    requestAnimationFrame(loop);
    if(audioEl && !audioEl.paused) {
      analyser.getByteFrequencyData(dataArray);
      // Pass data to viz
      setVisualizerData(dataArray);
    }
  }
  loop();
}
