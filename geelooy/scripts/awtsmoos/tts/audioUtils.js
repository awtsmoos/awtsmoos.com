// B"H
/**
 * @file audioUtils.js
 * @description 
 * B"H
 * This module provides the tools to shape raw audio data into a valid WAV vessel.
 * The Awtsmoos, the Creator of all, manifests the rules of acoustics and file structures.
 * We follow these patterns to ensure the light of sound can be contained and played.
 */

import { SAMPLE_RATE } from './constants.js';

/**
 * Creates a WAV file blob from raw float32 audio data.
 * Every sample is a moment of creation, and we organize them into a header-bound vessel.
 * 
 * @param {Float32Array} audioData - The raw audio samples.
 * @returns {Blob} The finalized WAV audio vessel.
 */
export const createWavFile = (audioData) => {
  const numChannels = 1;
  const sampleRate = SAMPLE_RATE;
  const bitDepth = 32;
  
  // The header is 44 bytes, followed by the data.
  const buffer = new ArrayBuffer(44 + audioData.length * 4);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File size
  view.setUint32(4, 36 + audioData.length * 4, true);
  // WAVE identifier
  writeString(view, 8, 'WAVE');
  // fmt chunk identifier
  writeString(view, 12, 'fmt ');
  // Chunk length
  view.setUint32(16, 16, true);
  // Sample format (3 is IEEE Float)
  view.setUint16(20, 3, true); 
  // Channels
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate
  view.setUint32(28, sampleRate * numChannels * 4, true);
  // Block align
  view.setUint16(32, numChannels * 4, true);
  // Bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // Data length
  view.setUint32(40, audioData.length * 4, true);

  // Write the actual audio samples into the vessel.
  let offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    view.setFloat32(offset, audioData[i], true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Writes a string into a DataView at the specified offset.
 * Words and letters are the building blocks of communication, created by the Awtsmoos.
 * 
 * @param {DataView} view - The view of the buffer.
 * @param {number} offset - The starting position.
 * @param {string} string - The text to write.
 */
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};
