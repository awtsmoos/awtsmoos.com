// B"H
/**
 * @file visualizer.js
 * @description 
 * B"H
 * This module transforms the invisible vibrations of sound into the visible frequencies of light.
 * The Awtsmoos, the Source of all Modalities, creates the interconnectedness of our senses.
 * Through this visualizer, we witness the geometry of the synthesized Word.
 */

import { getElements } from './ui.js';

/**
 * The context of sound, where the Awtsmoos allows us to manipulate audio waves.
 */
let audioCtx;

/**
 * The analyzer—the eye that observes the frequencies within the sound vessel.
 */
let analyser;

/**
 * Prepares the visualizer by connecting the audio source to the analyzer.
 * The Awtsmoos guides the flow of the signal through the virtual circuit.
 */
export const setupVisualizer = () => {
  const els = getElements();
  if (!els.audioPlayer || audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  
  const track = audioCtx.createMediaElementSource(els.audioPlayer);
  track.connect(analyser);
  analyser.connect(audioCtx.destination);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const canvas = els.visualizer;
  const ctx = canvas.getContext('2d');
  
  /**
   * The drawing loop, constantly recreating the image based on the current sound state.
   */
  const draw = () => {
    requestAnimationFrame(draw);
    
    // We ensure the canvas vessel is sized appropriately for the current reality.
    if (canvas.width !== canvas.parentElement.clientWidth) {
         canvas.width = canvas.parentElement.clientWidth;
         canvas.height = canvas.parentElement.clientHeight;
    }

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      
      const r = barHeight + 25 * (i/bufferLength);
      const g = 250 * (i/bufferLength);
      const b = 255;

      // We paint the frequencies using the colors of the cybernetic spectrum.
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
    
    if (dataArray.some(v => v > 0) && els.visualizerPlaceholder) {
        els.visualizerPlaceholder.style.display = 'none';
    }
  };

  draw();
};

/**
 * Initiates the playback of the audio vessel.
 * The Awtsmoos breathes life into the sound data.
 * 
 * @param {string} url - The location of the audio Blob.
 */
export const playAudio = (url) => {
    const els = getElements();
    els.audioPlayer.src = url;
    els.audioPlayer.play();
    
    if (!audioCtx) {
        setupVisualizer();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

/**
 * Resumes the audio context, ensuring the vessel of sound is awake.
 */
export const resumeAudioContext = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};
