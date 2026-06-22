/* B"H */
export function makeSilentAudio(duration, sampleRate = 48000) {
  const length = Math.max(1, Math.ceil(duration * sampleRate));
  return { channels:[new Float32Array(length)], sampleRate, length, duration:length / sampleRate, numberOfChannels:1 };
}
