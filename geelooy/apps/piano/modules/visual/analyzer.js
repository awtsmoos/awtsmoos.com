/* B"H
The analyzer lets sound become visible: wave, spectrum, and waterfall seeds.
*/
export function createAnalyzer(ctx, source) { const analyser=ctx.createAnalyser(); analyser.fftSize=2048; source.connect(analyser); return { analyser, time:new Uint8Array(analyser.fftSize), freq:new Uint8Array(analyser.frequencyBinCount) }; }
export function readAnalyzer(state) { state.analyser.getByteTimeDomainData(state.time); state.analyser.getByteFrequencyData(state.freq); return state; }
