/* B"H */
export function createAudioCapture(input = {}) { return { kind:'AudioCapture', id:input.id || `capture-${Date.now()}`, stream:input.stream || null, state:input.state || 'idle', deviceId:input.deviceId || null }; }
export async function startAudioCapture(capture, constraints = { audio:true }) { const media = globalThis.navigator?.mediaDevices; if (!media?.getUserMedia) throw new Error('Audio capture requires mediaDevices.getUserMedia.'); capture.stream = await media.getUserMedia(constraints); capture.state = 'running'; return capture; }
export function stopAudioCapture(capture) { capture.stream?.getTracks?.().forEach(track => track.stop()); capture.state = 'stopped'; return capture; }
